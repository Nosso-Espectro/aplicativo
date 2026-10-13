/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { openPreferencesDatabase } from '../../../src/features/communication-profile/preferences-database';
import { emptyPreferences, normalizedPreferences } from '../../../src/features/communication-profile/preferences';
import { emptySupportPreferences } from '../../../src/features/communication-profile/support-preferences';
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
let directory: string; let connections: DatabaseSync[]; let failRead: boolean; let failSupportRead: boolean;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'tear-profile-test-')); connections = []; failRead = false; failSupportRead = false;
  jest.mocked(openDatabaseAsync).mockImplementation(async () => {
    const sql = new DatabaseSync(join(directory, 'profile.db')); connections.push(sql);
    const adapter = {
      execAsync: async (statement: string) => { sql.exec(statement); },
      runAsync: async (statement: string, ...params: (string | number | null)[]) => sql.prepare(statement).run(...params),
      getAllAsync: async (statement: string) => {
        if ((failRead && statement.startsWith('SELECT communication')) || (failSupportRead && statement.startsWith('SELECT sound'))) throw new Error('synthetic read failure');
        return sql.prepare(statement).all();
      },
      closeAsync: async () => { sql.close(); },
      withExclusiveTransactionAsync: async (operation: (tx: SQLiteDatabase) => Promise<void>) => {
        sql.exec('BEGIN');
        try { await operation(adapter as unknown as SQLiteDatabase); sql.exec('COMMIT'); }
        catch (error) { sql.exec('ROLLBACK'); throw error; }
      },
    };
    return adapter as unknown as SQLiteDatabase;
  });
});
afterEach(() => { for (const db of connections) { try { db.close(); } catch {} } rmSync(directory, { recursive: true, force: true }); });
it('opens empty, persists parameterized free text and reopens preferences locally — RF-001/RF-004', async () => {
  const db = await openPreferencesDatabase(); expect(await db.read()).toEqual(emptyPreferences);
  const saved = await db.save({ communication: "  Texto'); DROP TABLE communication_preferences; --  ", instructions: '  Uma instrução por vez  ', extraTime: true });
  expect(saved.communication).toBe("Texto'); DROP TABLE communication_preferences; --");
  expect(saved.instructions).toBe('Uma instrução por vez');
  expect(await (await openPreferencesDatabase()).read()).toEqual(saved);
});
it('distinguishes uninformed, required and not required extra time — RF-002', async () => {
  const db = await openPreferencesDatabase();
  for (const extraTime of [null, true, false]) {
    expect((await db.save({ ...emptyPreferences, extraTime })).extraTime).toBe(extraTime);
    expect((await (await openPreferencesDatabase()).read()).extraTime).toBe(extraTime);
  }
});
it('edits/removes individual fields and all preferences without creating multiple profiles — RF-003', async () => {
  const db = await openPreferencesDatabase();
  await db.save({ communication: 'Texto', instructions: 'Escritas', extraTime: true });
  expect(await db.save({ communication: '', instructions: 'Imagens', extraTime: null })).toEqual({ communication: '', instructions: 'Imagens', extraTime: null });
  expect(await db.save(emptyPreferences)).toEqual(emptyPreferences);
  expect(await (await openPreferencesDatabase()).read()).toEqual(emptyPreferences);
  expect(connections[0].prepare('SELECT count(*) AS total FROM communication_preferences').get()).toEqual({ total: 1 });
});
it('rolls back a failed save/removal and permits retry without losing confirmed content', async () => {
  const db = await openPreferencesDatabase();
  const saved = await db.save({ communication: 'Texto', instructions: '', extraTime: true });
  failRead = true; await expect(db.save(emptyPreferences)).rejects.toThrow(); failRead = false;
  expect(await db.read()).toEqual(saved);
  expect(await db.save(emptyPreferences)).toEqual(emptyPreferences);
});
it('rejects invalid tri-state input and refuses a future schema without downgrade', async () => {
  expect(() => normalizedPreferences({ ...emptyPreferences, extraTime: 1 as unknown as boolean })).toThrow('Invalid preferences.');
  const db = await openPreferencesDatabase();
  const saved = await db.save({ ...emptyPreferences, communication: 'Teste' });
  connections[0].exec('PRAGMA user_version = 3;');
  await expect(openPreferencesDatabase()).rejects.toThrow('Profile storage unavailable.');
  expect(connections[0].prepare('PRAGMA user_version').get()).toEqual({ user_version: 3 });
  expect(await db.read()).toEqual(saved);
});
it('migrates a genuine version 1 profile without changing communication data', async () => {
  const legacy = new DatabaseSync(join(directory, 'profile.db'));
  legacy.exec(`CREATE TABLE communication_preferences (id INTEGER PRIMARY KEY CHECK(id=1), communication TEXT NOT NULL,
    instructions TEXT NOT NULL, extra_time INTEGER); INSERT INTO communication_preferences VALUES (1, 'Texto', 'Imagens', 0); PRAGMA user_version=1;`);
  legacy.close();
  const db = await openPreferencesDatabase();
  expect(await db.read()).toEqual({ communication: 'Texto', instructions: 'Imagens', extraTime: false });
  expect(await db.readSupport()).toEqual(emptySupportPreferences);
  expect(connections[0].prepare('PRAGMA user_version').get()).toEqual({ user_version: 2 });
});
it('saves all optional support fields, parameterizes text and reopens offline — RF-005/RF-006', async () => {
  const db = await openPreferencesDatabase();
  const draft = { sound: "  Teste'); DROP TABLE support_preferences; --  ", light: ' Luz ', touch: ' Toque ', temperature: ' Frio ',
    other: ' Outro ', helpfulStrategies: ' Pausa ', avoidStrategies: ' Gritos ' };
  const saved = await db.saveSupport(draft);
  expect(saved.sound).toBe("Teste'); DROP TABLE support_preferences; --");
  expect(saved).toMatchObject({ light: 'Luz', touch: 'Toque', temperature: 'Frio', other: 'Outro', helpfulStrategies: 'Pausa', avoidStrategies: 'Gritos' });
  expect(await (await openPreferencesDatabase()).readSupport()).toEqual(saved);
});
it('reads current explicitly selected fields for the plan without retaining removed snapshots — RF-007', async () => {
  const db = await openPreferencesDatabase();
  await db.saveSupport({ ...emptySupportPreferences, sound: 'Som sintético', helpfulStrategies: 'Pausa' });
  expect(await db.readSupportForPlan()).toEqual([]);
  expect(await db.readSupportForPlan(['helpfulStrategies'])).toEqual([{ field: 'helpfulStrategies', label: 'Estratégias que ajudam', value: 'Pausa' }]);
  await db.saveSupport({ ...emptySupportPreferences, helpfulStrategies: 'Outra pausa' });
  const reopened = await openPreferencesDatabase();
  expect(await reopened.readSupportForPlan(['sound', 'helpfulStrategies'])).toEqual([{ field: 'helpfulStrategies', label: 'Estratégias que ajudam', value: 'Outra pausa' }]);
  await db.saveSupport(emptySupportPreferences);
  expect(await reopened.readSupportForPlan(['helpfulStrategies'])).toEqual([]);
});
it('isolates deletion in both modules and rolls back a failed support edit/removal before retry', async () => {
  const db = await openPreferencesDatabase();
  const communication = await db.save({ ...emptyPreferences, communication: 'Texto' });
  const saved = await db.saveSupport({ ...emptySupportPreferences, sound: 'Teste' });
  failSupportRead = true;
  await expect(db.saveSupport(emptySupportPreferences)).rejects.toThrow();
  failSupportRead = false;
  expect(await db.readSupport()).toEqual(saved); expect(await db.read()).toEqual(communication);
  await db.save(emptyPreferences); expect(await db.readSupport()).toEqual(saved);
  await db.save(communication); await db.saveSupport(emptySupportPreferences);
  expect(await db.readSupport()).toEqual(emptySupportPreferences); expect(await db.read()).toEqual(communication);
});

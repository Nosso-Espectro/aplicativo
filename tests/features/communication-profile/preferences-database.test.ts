/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { openPreferencesDatabase } from '../../../src/features/communication-profile/preferences-database';
import { emptyPreferences, normalizedPreferences } from '../../../src/features/communication-profile/preferences';
import { emptySupportPreferences } from '../../../src/features/communication-profile/support-preferences';
import { type SummaryField } from '../../../src/features/communication-profile/profile-summary';
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
let directory: string; let connections: DatabaseSync[]; let failRead: boolean; let failSupportRead: boolean; let failSelectionRead: boolean;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'tear-profile-test-')); connections = []; failRead = false; failSupportRead = false; failSelectionRead = false;
  jest.mocked(openDatabaseAsync).mockImplementation(async () => {
    const sql = new DatabaseSync(join(directory, 'profile.db')); connections.push(sql);
    const adapter = {
      execAsync: async (statement: string) => { sql.exec(statement); },
      runAsync: async (statement: string, ...params: (string | number | null)[]) => sql.prepare(statement).run(...params),
      getAllAsync: async (statement: string) => {
        if ((failRead && statement.startsWith('SELECT communication')) || (failSupportRead && statement.startsWith('SELECT sound'))) throw new Error('synthetic read failure');
        if (failSelectionRead && statement.startsWith('SELECT field')) throw new Error('synthetic selection failure');
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
  connections[0].exec('PRAGMA user_version = 4;');
  await expect(openPreferencesDatabase()).rejects.toThrow('Profile storage unavailable.');
  expect(connections[0].prepare('PRAGMA user_version').get()).toEqual({ user_version: 4 });
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
  expect(await db.readSummarySelection()).toEqual([]);
  expect(connections[0].prepare('PRAGMA user_version').get()).toEqual({ user_version: 3 });
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
it('migrates a genuine version 2 profile without selecting or altering any personal fields — RF-008', async () => {
  const legacy = new DatabaseSync(join(directory, 'profile.db'));
  legacy.exec(`CREATE TABLE communication_preferences (id INTEGER PRIMARY KEY CHECK(id=1), communication TEXT NOT NULL,
    instructions TEXT NOT NULL, extra_time INTEGER);
    CREATE TABLE support_preferences (id INTEGER PRIMARY KEY CHECK(id=1), sound TEXT NOT NULL, light TEXT NOT NULL,
      touch TEXT NOT NULL, temperature TEXT NOT NULL, other TEXT NOT NULL, helpful_strategies TEXT NOT NULL, avoid_strategies TEXT NOT NULL);
    INSERT INTO communication_preferences VALUES (1, 'Texto', 'Imagens', 0);
    INSERT INTO support_preferences VALUES (1, 'Som sintético', '', '', '', '', 'Pausa', ''); PRAGMA user_version=2;`);
  legacy.close();
  const db = await openPreferencesDatabase();
  expect(await db.read()).toEqual({ communication: 'Texto', instructions: 'Imagens', extraTime: false });
  expect(await db.readSupport()).toEqual({ ...emptySupportPreferences, sound: 'Som sintético', helpfulStrategies: 'Pausa' });
  expect(await db.readSummarySelection()).toEqual([]); expect(await db.readProfileSummary()).toEqual([]);
  expect(connections[0].prepare('PRAGMA user_version').get()).toEqual({ user_version: 3 });
});
it('persists only selected field identifiers and clears selection without clearing the profile — RF-008/RF-010', async () => {
  const db = await openPreferencesDatabase();
  const communication = await db.save({ ...emptyPreferences, communication: 'Texto sintético' });
  const support = await db.saveSupport({ ...emptySupportPreferences, sound: 'Som sintético' });
  expect(await db.saveSummarySelection(['sound', 'communication', 'sound'])).toEqual(['communication', 'sound']);
  const reopened = await openPreferencesDatabase();
  expect(await reopened.readSummarySelection()).toEqual(['communication', 'sound']);
  expect(connections[0].prepare('SELECT * FROM summary_selection ORDER BY field').all()).toEqual([{ field: 'communication' }, { field: 'sound' }]);
  expect(await reopened.saveSummarySelection([])).toEqual([]);
  expect(await db.readProfileSummary()).toEqual([]);
  expect(await db.read()).toEqual(communication); expect(await db.readSupport()).toEqual(support);
});
it('returns only chosen, current nonempty values after edit/removal and reopening — RF-008/RF-009', async () => {
  const db = await openPreferencesDatabase();
  await db.save({ communication: 'Não selecionado', instructions: 'Imagens', extraTime: false });
  await db.saveSupport({ ...emptySupportPreferences, sound: 'Som', helpfulStrategies: 'Não selecionado' });
  await db.saveSummarySelection(['instructions', 'extraTime', 'sound', 'light']);
  expect(await db.readProfileSummary()).toEqual([
    { field: 'instructions', label: 'Como prefiro receber informações', value: 'Imagens' },
    { field: 'extraTime', label: 'Tempo adicional para responder', value: 'Não preciso de tempo adicional.' },
    { field: 'sound', label: 'Som', value: 'Som' },
  ]);
  await db.save({ ...emptyPreferences, instructions: 'Uma por vez' });
  await db.saveSupport(emptySupportPreferences);
  expect(await (await openPreferencesDatabase()).readProfileSummary()).toEqual([
    { field: 'instructions', label: 'Como prefiro receber informações', value: 'Uma por vez' },
  ]);
  expect(await db.readSummarySelection()).toEqual(['instructions', 'extraTime', 'sound', 'light']);
});
it('rolls back a failed selection save, preserves confirmed choices and supports retry — RF-008', async () => {
  const db = await openPreferencesDatabase(); await db.saveSummarySelection(['communication']);
  failSelectionRead = true; await expect(db.saveSummarySelection(['sound'])).rejects.toThrow(); failSelectionRead = false;
  expect(await db.readSummarySelection()).toEqual(['communication']);
  expect(await db.saveSummarySelection(['sound'])).toEqual(['sound']);
});
it('rejects invalid or corrupted field identifiers without publishing a partial summary', async () => {
  const db = await openPreferencesDatabase(); await db.saveSummarySelection(['communication']);
  await expect(db.saveSummarySelection(['invalid' as SummaryField])).rejects.toThrow('Invalid summary selection.');
  expect(await db.readSummarySelection()).toEqual(['communication']);
  connections[0].prepare('INSERT INTO summary_selection VALUES (?)').run('invalid');
  await expect(db.readProfileSummary()).rejects.toThrow('Invalid summary selection.');
  await db.saveSummarySelection(['communication']);
  await db.save({ ...emptyPreferences, communication: 'Teste' });
  failSupportRead = true; await expect(db.readProfileSummary()).rejects.toThrow(); failSupportRead = false;
  expect(await db.readProfileSummary()).toEqual([{ field: 'communication', label: 'Formas preferidas de comunicação', value: 'Teste' }]);
});

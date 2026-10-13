/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { openSupportPlanDatabase } from '../../../src/features/support-plan/support-plan-database';
import { emptySupportPlan } from '../../../src/features/support-plan/support-plan';
import { openPreferencesDatabase } from '../../../src/features/communication-profile/preferences-database';
import { emptySupportPreferences } from '../../../src/features/communication-profile/support-preferences';
import { emptyPreferences } from '../../../src/features/communication-profile/preferences';
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
let directory: string; let connections: DatabaseSync[]; let failRead: boolean; let failReferenceInsert: boolean; let failCommit: boolean;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'tear-plan-test-')); connections = []; failRead = false; failReferenceInsert = false; failCommit = false;
  jest.mocked(openDatabaseAsync).mockImplementation(async (name) => {
    const sql = new DatabaseSync(join(directory, name)); connections.push(sql);
    const adapter = {
      execAsync: async (statement: string) => { sql.exec(statement); },
      runAsync: async (statement: string, ...params: (string | number | null)[]) => {
        if (failReferenceInsert && statement.startsWith('INSERT INTO plan_profile_fields')) throw new Error('synthetic write failure');
        return sql.prepare(statement).run(...params);
      },
      getAllAsync: async (statement: string) => {
        if (failRead && statement.startsWith('SELECT instructions')) throw new Error('synthetic read failure');
        return sql.prepare(statement).all();
      },
      closeAsync: async () => { sql.close(); },
      withExclusiveTransactionAsync: async (operation: (tx: SQLiteDatabase) => Promise<void>) => {
        sql.exec('BEGIN');
        try { await operation(adapter as unknown as SQLiteDatabase); if (failCommit) throw new Error('synthetic commit failure'); sql.exec('COMMIT'); }
        catch (error) { sql.exec('ROLLBACK'); throw error; }
      },
    };
    return adapter as unknown as SQLiteDatabase;
  });
});
afterEach(() => { for (const db of connections) { try { db.close(); } catch {} } rmSync(directory, { recursive: true, force: true }); });
it('starts empty and persists free text/optional choices on a new connection — spec004/RF-001/RF-004', async () => {
  const db = await openSupportPlanDatabase(); expect(await db.read()).toEqual(emptySupportPlan);
  const saved = await db.save({ instructions: "  Texto'); DROP TABLE support_plan; --  ", suggestions: ['quiet', 'no-touch', 'quiet'], profileFields: ['helpfulStrategies', 'sound'] });
  expect(saved).toEqual({ instructions: "Texto'); DROP TABLE support_plan; --", suggestions: ['no-touch', 'quiet'], profileFields: ['sound', 'helpfulStrategies'] });
  expect(await (await openSupportPlanDatabase()).read()).toEqual(saved);
});
it('edits/clears any source, keeps one plan and stores only identifiers for profile references — RF-003', async () => {
  const db = await openSupportPlanDatabase();
  await db.save({ instructions: 'Orientação sintética', suggestions: ['quiet'], profileFields: ['sound', 'light'] });
  const saved = await db.save({ instructions: '', suggestions: ['response-time'], profileFields: ['light'] });
  expect(await db.read()).toEqual(saved);
  expect(connections[0].prepare('SELECT * FROM plan_profile_fields').all()).toEqual([{ id: 'light' }]);
  expect(connections[0].prepare('SELECT count(*) AS total FROM support_plan').get()).toEqual({ total: 1 });
  expect(await db.save(emptySupportPlan)).toEqual(emptySupportPlan); expect(await (await openSupportPlanDatabase()).read()).toEqual(emptySupportPlan);
});
it('rolls back all three sources after a partial write failure and allows retry', async () => {
  const db = await openSupportPlanDatabase();
  const saved = await db.save({ instructions: 'Confirmado', suggestions: ['no-touch'], profileFields: ['sound'] });
  const draft = { instructions: 'Rascunho', suggestions: ['quiet' as const], profileFields: ['light' as const] };
  failReferenceInsert = true; await expect(db.save(draft)).rejects.toThrow(); failReferenceInsert = false;
  expect(await db.read()).toEqual(saved); expect(await db.save(draft)).toEqual(draft);
});
it('does not publish success before commit and preserves confirmed content on failed removal', async () => {
  const db = await openSupportPlanDatabase(); const saved = await db.save({ ...emptySupportPlan, instructions: 'Confirmado' });
  failCommit = true; await expect(db.save(emptySupportPlan)).rejects.toThrow(); failCommit = false;
  expect(await db.read()).toEqual(saved);
  failRead = true; await expect(db.save(emptySupportPlan)).rejects.toThrow(); failRead = false;
  expect(await db.read()).toEqual(saved); expect(await db.save(emptySupportPlan)).toEqual(emptySupportPlan);
});
it('queues save/read operations in order rather than publishing mixed source states', async () => {
  const db = await openSupportPlanDatabase();
  const first = { ...emptySupportPlan, instructions: 'Primeiro', suggestions: ['no-touch' as const] };
  const second = { ...emptySupportPlan, instructions: 'Segundo', profileFields: ['light' as const] };
  const writeFirst = db.save(first); const readFirst = db.read(); const writeSecond = db.save(second); const readSecond = db.read();
  expect(await writeFirst).toEqual(first); expect(await readFirst).toEqual(first); expect(await writeSecond).toEqual(second); expect(await readSecond).toEqual(second);
});
it('refuses future schema without downgrade or content loss', async () => {
  const db = await openSupportPlanDatabase(); const saved = await db.save({ ...emptySupportPlan, instructions: 'Teste' });
  connections[0].exec('PRAGMA user_version = 2;');
  await expect(openSupportPlanDatabase()).rejects.toThrow('Support plan storage unavailable.');
  expect(connections[0].prepare('PRAGMA user_version').get()).toEqual({ user_version: 2 }); expect(await db.read()).toEqual(saved);
});
it('fails closed on corrupted IDs and recovers a read error without overwriting confirmed data', async () => {
  const db = await openSupportPlanDatabase(); const saved = await db.save({ ...emptySupportPlan, instructions: 'Teste' });
  failRead = true; await expect(db.read()).rejects.toThrow(); failRead = false; expect(await db.read()).toEqual(saved);
  connections[0].prepare('INSERT INTO plan_suggestions VALUES (?)').run('invalid'); await expect(db.read()).rejects.toThrow('Invalid support plan.');
  expect(await db.save(saved)).toEqual(saved);
});
it('reads chosen current profile values after reopen and isolates deletion from both profile modules', async () => {
  const profile = await openPreferencesDatabase();
  const communication = await profile.save({ ...emptyPreferences, communication: 'Texto' });
  const support = await profile.saveSupport({ ...emptySupportPreferences, sound: 'Não escolhido', helpfulStrategies: 'Pausa' });
  const plan = await openSupportPlanDatabase(); await plan.save({ ...emptySupportPlan, instructions: 'Orientação', profileFields: ['helpfulStrategies'] });
  const reopened = await openSupportPlanDatabase(); const saved = await reopened.read();
  expect(await profile.readSupportForPlan(saved.profileFields)).toEqual([{ field: 'helpfulStrategies', label: 'Estratégias que ajudam', value: 'Pausa' }]);
  await profile.saveSupport({ ...support, helpfulStrategies: 'Outra pausa' });
  expect(await (await openPreferencesDatabase()).readSupportForPlan(saved.profileFields)).toEqual([{ field: 'helpfulStrategies', label: 'Estratégias que ajudam', value: 'Outra pausa' }]);
  await profile.saveSupport(emptySupportPreferences); expect(await profile.readSupportForPlan(saved.profileFields)).toEqual([]);
  await profile.saveSupport(support); await reopened.save(emptySupportPlan);
  expect(await profile.read()).toEqual(communication); expect(await profile.readSupport()).toEqual(support);
});

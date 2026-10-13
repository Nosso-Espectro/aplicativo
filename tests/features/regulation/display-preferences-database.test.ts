/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { openDisplayPreferencesDatabase } from '../../../src/features/regulation/display-preferences-database';
import { openPreferencesDatabase } from '../../../src/features/communication-profile/preferences-database';
import { emptySupportPreferences } from '../../../src/features/communication-profile/support-preferences';
import { openSupportPlanDatabase } from '../../../src/features/support-plan/support-plan-database';
import { emptySupportPlan } from '../../../src/features/support-plan/support-plan';
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
let directory: string; let connections: DatabaseSync[]; let failRead: boolean; let failCommit: boolean;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'tear-display-test-')); connections = []; failRead = false; failCommit = false;
  jest.mocked(openDatabaseAsync).mockImplementation(async (name) => {
    const sql = new DatabaseSync(join(directory, name)); connections.push(sql);
    const adapter = {
      execAsync: async (statement: string) => { sql.exec(statement); },
      runAsync: async (statement: string, ...params: (string | number | null)[]) => sql.prepare(statement).run(...params),
      getAllAsync: async (statement: string) => {
        if (failRead && statement.startsWith('SELECT enabled')) throw new Error('synthetic read failure');
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
it('starts disabled and persists reversible choices across file-backed reopening without network — spec005/RF-004', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  try {
    const db = await openDisplayPreferencesDatabase(); expect(await db.read()).toEqual({ enabled: false });
    expect(await db.save({ enabled: true })).toEqual({ enabled: true });
    expect(connections[0].prepare('SELECT count(*) AS total FROM display_preference').get()).toEqual({ total: 1 });
    connections[0].close();
    const reopened = await openDisplayPreferencesDatabase(); expect(await reopened.read()).toEqual({ enabled: true });
    expect(await reopened.save({ enabled: false })).toEqual({ enabled: false });
    connections[1].close();
    expect(await (await openDisplayPreferencesDatabase()).read()).toEqual({ enabled: false });
    expect(fetch).not.toHaveBeenCalled();
  } finally { fetch.mockRestore(); }
});
it('rolls back failed readback and permits retry without losing the confirmed choice', async () => {
  const db = await openDisplayPreferencesDatabase(); await db.save({ enabled: true });
  failRead = true; await expect(db.save({ enabled: false })).rejects.toThrow(); failRead = false;
  expect(await db.read()).toEqual({ enabled: true }); expect(await db.save({ enabled: false })).toEqual({ enabled: false });
});
it('does not confirm a save before commit and recovers from an interrupted write', async () => {
  const db = await openDisplayPreferencesDatabase(); await db.save({ enabled: false });
  failCommit = true; await expect(db.save({ enabled: true })).rejects.toThrow(); failCommit = false;
  expect(await (await openDisplayPreferencesDatabase()).read()).toEqual({ enabled: false });
  expect(await db.save({ enabled: true })).toEqual({ enabled: true });
});
it('queues reads after writes and preserves their confirmed ordering', async () => {
  const db = await openDisplayPreferencesDatabase();
  const first = db.save({ enabled: true }); const readFirst = db.read(); const second = db.save({ enabled: false }); const readSecond = db.read();
  expect(await first).toEqual({ enabled: true }); expect(await readFirst).toEqual({ enabled: true });
  expect(await second).toEqual({ enabled: false }); expect(await readSecond).toEqual({ enabled: false });
});
it('rejects coercion and leaves persisted data untouched', async () => {
  const db = await openDisplayPreferencesDatabase(); await db.save({ enabled: true });
  await expect(db.save({ enabled: 'false' } as unknown as { enabled: boolean })).rejects.toThrow('Invalid display preference.');
  expect(await db.read()).toEqual({ enabled: true });
});
it('detects corrupt flags instead of presenting them as a voluntary preference', async () => {
  const db = await openDisplayPreferencesDatabase(); await db.save({ enabled: false });
  connections[0].exec('PRAGMA ignore_check_constraints=ON; UPDATE display_preference SET enabled=2;');
  await expect(db.read()).rejects.toThrow('Invalid display preference.');
  expect(await db.save({ enabled: true })).toEqual({ enabled: true });
});
it('refuses future schema without downgrading or clearing data', async () => {
  const db = await openDisplayPreferencesDatabase(); await db.save({ enabled: true }); connections[0].exec('PRAGMA user_version=2;');
  await expect(openDisplayPreferencesDatabase()).rejects.toThrow('Display preference storage unavailable.');
  expect(connections[0].prepare('PRAGMA user_version').get()).toEqual({ user_version: 2 }); expect(await db.read()).toEqual({ enabled: true });
});
it('changes only presentation preferences, preserving existing profile and plan', async () => {
  const profile = await openPreferencesDatabase(); const support = await profile.saveSupport({ ...emptySupportPreferences, sound: 'Som sintético' });
  const plans = await openSupportPlanDatabase(); const plan = await plans.save({ ...emptySupportPlan, instructions: 'Orientação sintética' });
  const db = await openDisplayPreferencesDatabase(); await db.save({ enabled: true }); await db.save({ enabled: false });
  expect(await profile.readSupport()).toEqual(support); expect(await plans.read()).toEqual(plan);
});

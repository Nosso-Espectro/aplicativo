/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { openTimerDatabase } from '../../../src/features/transition-timer/timer-database';
import { openProgressAlertDatabase } from '../../../src/features/transition-timer/progress-alert-database';
import { emptyProgressAlerts, type ProgressAlertPreferences } from '../../../src/features/transition-timer/progress-alerts';
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
let directory: string; let connections: DatabaseSync[]; let failReadback: boolean; let failCommit: boolean;
const enabled: ProgressAlertPreferences = { enabled: true, marks: [10, 5, 2], systemNotifications: true };
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'tear-alert-db-')); connections = []; failReadback = false; failCommit = false;
  jest.mocked(openDatabaseAsync).mockImplementation(async name => {
    const sql = new DatabaseSync(join(directory, name)); connections.push(sql); let written = false;
    const adapter = {
      execAsync: async (statement: string) => { sql.exec(statement); },
      runAsync: async (statement: string, ...params: (string | number | null)[]) => { written = true; return sql.prepare(statement).run(...params); },
      getAllAsync: async (statement: string) => { if (written && failReadback) throw new Error('Synthetic readback failure'); return sql.prepare(statement).all(); },
      closeAsync: async () => sql.close(),
      withExclusiveTransactionAsync: async (operation: (tx: SQLiteDatabase) => Promise<void>) => {
        sql.exec('BEGIN'); written = false;
        try { await operation(adapter as unknown as SQLiteDatabase); if (failCommit) throw new Error('Synthetic commit failure'); sql.exec('COMMIT'); }
        catch (error) { sql.exec('ROLLBACK'); throw error; }
      },
    };
    return adapter as unknown as SQLiteDatabase;
  });
});
afterEach(() => { for (const db of connections) { try { db.close(); } catch {} } rmSync(directory, { recursive: true, force: true }); });
it('starts with empty private preferences and restores choices from the same file offline without touching timer', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  try {
    const db = await openProgressAlertDatabase(); const initial = await db.read();
    expect(initial).toMatchObject({ session: null, sessionNumber: null, revision: 0, preferences: emptyProgressAlerts, delivered: [], pending: [] });
    const saved = await db.savePreferences(enabled, initial.revision); connections[0].close();
    const reopened = await openProgressAlertDatabase(); expect(await reopened.read()).toEqual(saved);
    expect((await reopened.read()).session).toBeNull(); expect(fetch).not.toHaveBeenCalled();
  } finally { fetch.mockRestore(); }
});
it.each(['running', 'paused'] as const)('migrates schema1 %s sessions intact with one stable identity and disabled alerts', async phase => {
  const sql = new DatabaseSync(join(directory, 'tear-transition-timer.db'));
  sql.exec(`CREATE TABLE timer_session (id INTEGER PRIMARY KEY, phase TEXT, duration_ms INTEGER, remaining_ms INTEGER, deadline_ms INTEGER); PRAGMA user_version=1;`);
  sql.prepare('INSERT INTO timer_session VALUES (1, ?, 1200000, 900000, ?)').run(phase, phase === 'running' ? 901000 : null); sql.close();
  const db = await openProgressAlertDatabase(); const snapshot = await db.read();
  expect(snapshot).toMatchObject({ sessionNumber: 1, preferences: emptyProgressAlerts, session: { phase, durationMs: 1200000, remainingMs: 900000, deadlineMs: phase === 'running' ? 901000 : null } });
  expect(connections[0].prepare('PRAGMA user_version').get()).toEqual({ user_version: 2 });
});
it('retains identity and delivered marks across pause/resume but gives a new timer a new identity', async () => {
  const timer = await openTimerDatabase(); const alerts = await openProgressAlertDatabase();
  let snapshot = await alerts.savePreferences(enabled, 0);
  const started = await timer.act({ type: 'start', durationMs: 1200000 }, 1000, null); snapshot = await alerts.read();
  snapshot = await alerts.markDelivered(10, snapshot.sessionNumber!, 601000, snapshot.revision); expect(snapshot.delivered).toEqual([10]);
  await expect(alerts.markDelivered(10, snapshot.sessionNumber!, 601000, snapshot.revision)).rejects.toThrow('Timer alert unavailable.');
  const paused = await timer.act({ type: 'pause' }, 602000, started); const resumed = await timer.act({ type: 'resume' }, 700000, paused);
  expect(await alerts.read()).toMatchObject({ sessionNumber: snapshot.sessionNumber, delivered: [10] });
  await timer.act({ type: 'cancel' }, 700000, resumed); await timer.act({ type: 'start', durationMs: 1200000 }, 700000, null);
  const next = await alerts.read(); expect(next.sessionNumber).toBe(snapshot.sessionNumber! + 1); expect(next.delivered).toEqual([]);
  await expect(alerts.markDelivered(5, snapshot.sessionNumber!, 1700000, next.revision)).rejects.toThrow();
});
it('reserves only consented future requests and keeps ownership across cancellation until explicit acknowledgement', async () => {
  const timer = await openTimerDatabase(); const alerts = await openProgressAlertDatabase();
  const started = await timer.act({ type: 'start', durationMs: 1200000 }, 1000, null);
  let current = await alerts.read(); await expect(alerts.reserve(10, 601000, 1000, current.revision)).rejects.toThrow();
  current = await alerts.savePreferences(enabled, current.revision);
  current = await alerts.reserve(10, 601000, 1000, current.revision);
  const [owned] = current.pending; expect(owned).toMatchObject({ minutes: 10, sessionNumber: current.sessionNumber, atMs: 601000 });
  await expect(alerts.reserve(10, 601000, 1000, current.revision)).rejects.toThrow();
  await timer.act({ type: 'cancel' }, 2000, started); current = await alerts.read();
  expect(current.session).toBeNull(); expect(current.pending).toEqual([owned]);
  await expect(alerts.forget('other-application-id', current.revision)).rejects.toThrow('Owned timer alert unavailable.');
  current = await alerts.forget(owned.identifier, current.revision); expect(current.pending).toEqual([]);
});
it.each(['readback', 'commit'])('rolls back failed %s without confirming preferences or losing pending ownership', async failure => {
  const alerts = await openProgressAlertDatabase(); const timer = await openTimerDatabase();
  await timer.act({ type: 'start', durationMs: 1200000 }, 1000, null);
  const configured = await alerts.savePreferences(enabled, (await alerts.read()).revision);
  const initial = await alerts.reserve(10, 601000, 1000, configured.revision);
  if (failure === 'readback') failReadback = true; else failCommit = true;
  await expect(alerts.savePreferences(emptyProgressAlerts, initial.revision)).rejects.toThrow();
  await expect(alerts.forget(initial.pending[0].identifier, initial.revision)).rejects.toThrow();
  failReadback = false; failCommit = false;
  expect(await alerts.read()).toEqual(initial);
  const disabled = await alerts.savePreferences(emptyProgressAlerts, initial.revision);
  expect(disabled.preferences).toEqual(emptyProgressAlerts); expect(disabled.pending).toEqual(initial.pending);
  expect((await alerts.forget(initial.pending[0].identifier, disabled.revision)).pending).toEqual([]);
});
it('rolls back a failed migration and preserves the schema1 timer until a successful retry', async () => {
  const sql = new DatabaseSync(join(directory, 'tear-transition-timer.db'));
  sql.exec(`CREATE TABLE timer_session (id INTEGER PRIMARY KEY, phase TEXT, duration_ms INTEGER, remaining_ms INTEGER, deadline_ms INTEGER);
    INSERT INTO timer_session VALUES (1, 'paused', 1200000, 900000, NULL); PRAGMA user_version=1;`);
  failCommit = true; await expect(openProgressAlertDatabase()).rejects.toThrow('Timer storage unavailable.'); failCommit = false;
  expect(sql.prepare('PRAGMA user_version').get()).toEqual({ user_version: 1 });
  expect(sql.prepare("SELECT name FROM sqlite_master WHERE name = 'timer_alert_state'").all()).toEqual([]);
  expect(sql.prepare('SELECT remaining_ms FROM timer_session').get()).toEqual({ remaining_ms: 900000 }); sql.close();
  expect((await (await openProgressAlertDatabase()).read()).session?.phase).toBe('paused');
});
it('rejects stale revisions across both timer actions and preference updates', async () => {
  const alerts = await openProgressAlertDatabase(); const timer = await openTimerDatabase(); const old = await alerts.read();
  await timer.act({ type: 'start', durationMs: 1200000 }, 1000, null);
  await expect(alerts.savePreferences(enabled, old.revision)).rejects.toThrow('Timer alerts changed.');
  const current = await alerts.read(); const saved = await alerts.savePreferences(enabled, current.revision);
  await expect(alerts.savePreferences(emptyProgressAlerts, current.revision)).rejects.toThrow(); expect(await alerts.read()).toEqual(saved);
});
it('rejects cancellation of a different identity even when the new timer has identical values', async () => {
  const timer = await openTimerDatabase(); const alerts = await openProgressAlertDatabase();
  const first = await timer.act({ type: 'start', durationMs: 1200000 }, 1000, null, null);
  const original = await alerts.read(); await timer.act({ type: 'cancel' }, 1000, first, original.sessionNumber);
  const second = await timer.act({ type: 'start', durationMs: 1200000 }, 1000, null, null);
  expect(second).toEqual(first);
  await expect(timer.act({ type: 'cancel' }, 1000, first, original.sessionNumber)).rejects.toThrow('Timer session changed.');
  expect(await timer.read()).toEqual(second);
});
it('rejects past requests, invalid choices and missing metadata rather than recreating identity', async () => {
  const alerts = await openProgressAlertDatabase(); const current = await alerts.read();
  await expect(alerts.savePreferences({ ...enabled, marks: [3] } as unknown as ProgressAlertPreferences, current.revision)).rejects.toThrow();
  const timer = await openTimerDatabase(); await timer.act({ type: 'start', durationMs: 1200000 }, 1000, null);
  const saved = await alerts.savePreferences(enabled, (await alerts.read()).revision);
  await expect(alerts.reserve(10, 601000, 601000, saved.revision)).rejects.toThrow();
  connections[0].exec('DELETE FROM timer_alert_state'); await expect(openProgressAlertDatabase()).rejects.toThrow('Timer storage unavailable.');
});
it('refuses future schema without downgrading or clearing the session', async () => {
  const timer = await openTimerDatabase(); const saved = await timer.act({ type: 'start', durationMs: 10000 }, 1000, null);
  connections[0].exec('PRAGMA user_version=3'); await expect(openProgressAlertDatabase()).rejects.toThrow();
  expect(connections[0].prepare('PRAGMA user_version').get()).toEqual({ user_version: 3 }); expect(await timer.read()).toEqual(saved);
});

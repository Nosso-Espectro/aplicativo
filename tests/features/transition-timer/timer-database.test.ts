/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { openTimerDatabase, type TimerAction } from '../../../src/features/transition-timer/timer-database';
import { timerAt } from '../../../src/features/transition-timer/visual-timer';
import { openDisplayPreferencesDatabase } from '../../../src/features/regulation/display-preferences-database';
import { openSupportPlanDatabase } from '../../../src/features/support-plan/support-plan-database';
import { emptySupportPlan } from '../../../src/features/support-plan/support-plan';
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
let directory: string; let connections: DatabaseSync[]; let failReadback: boolean; let failCommit: boolean;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'tear-timer-test-')); connections = []; failReadback = false; failCommit = false;
  jest.mocked(openDatabaseAsync).mockImplementation(async (name) => {
    const sql = new DatabaseSync(join(directory, name)); connections.push(sql); let written = false;
    const adapter = {
      execAsync: async (statement: string) => { sql.exec(statement); },
      runAsync: async (statement: string, ...params: (string | number | null)[]) => { if (statement.includes('timer_session')) written = true; return sql.prepare(statement).run(...params); },
      getAllAsync: async (statement: string) => {
        if (failReadback && written && statement.startsWith('SELECT phase')) throw new Error('synthetic readback failure');
        return sql.prepare(statement).all();
      },
      closeAsync: async () => { sql.close(); },
      withExclusiveTransactionAsync: async (operation: (tx: SQLiteDatabase) => Promise<void>) => {
        sql.exec('BEGIN'); written = false;
        try { await operation(adapter as unknown as SQLiteDatabase); if (failCommit) throw new Error('synthetic commit failure'); sql.exec('COMMIT'); }
        catch (error) { sql.exec('ROLLBACK'); throw error; }
      },
    };
    return adapter as unknown as SQLiteDatabase;
  });
});
afterEach(() => { for (const db of connections) { try { db.close(); } catch {} } rmSync(directory, { recursive: true, force: true }); });
it('starts absent and restores an absolute deadline after file close/reopen without network — spec006/RF-001/RF-003', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  try {
    const db = await openTimerDatabase(); expect(await db.read()).toBeNull();
    const started = await db.act({ type: 'start', durationMs: 10000 }, 1000, null);
    connections[0].close(); const reopened = await openTimerDatabase(); expect(await reopened.read()).toEqual(started);
    expect(timerAt(await reopened.read(), 12000)?.phase).toBe('finished');
    expect(fetch).not.toHaveBeenCalled();
  } finally { fetch.mockRestore(); }
});
it('persists paused remainder across reopen and resumes only after an explicit action', async () => {
  const db = await openTimerDatabase(); const started = await db.act({ type: 'start', durationMs: 10000 }, 1000, null);
  const paused = await db.act({ type: 'pause' }, 3500, started); expect(paused?.remainingMs).toBe(7500);
  connections[0].close(); const reopened = await openTimerDatabase(); expect(await reopened.read()).toEqual(paused);
  expect(timerAt(await reopened.read(), 50000)).toEqual(paused);
  const resumed = await reopened.act({ type: 'resume' }, 50000, paused); expect(resumed?.deadlineMs).toBe(57500);
  expect(await reopened.act({ type: 'cancel' }, 50100, resumed)).toBeNull();
  expect(await reopened.read()).toBeNull();
});
it.each(['start', 'pause', 'resume', 'cancel'] as const)('rolls back failed %s readback and permits recovery without data loss', async (type) => {
  const db = await openTimerDatabase();
  let expected = type === 'start' ? null : await db.act({ type: 'start', durationMs: 10000 }, 1000, null);
  if (type === 'resume') expected = await db.act({ type: 'pause' }, 2000, expected);
  const action: TimerAction = type === 'start' ? { type, durationMs: 10000 } : { type };
  failReadback = true; await expect(db.act(action, 3000, expected)).rejects.toThrow(); failReadback = false;
  expect(await db.read()).toEqual(expected); await expect(db.act(action, 3000, expected)).resolves.not.toBeUndefined();
});
it('refuses to confirm an action before commit and retains the last saved session', async () => {
  const db = await openTimerDatabase(); const started = await db.act({ type: 'start', durationMs: 10000 }, 1000, null);
  failCommit = true; await expect(db.act({ type: 'pause' }, 3000, started)).rejects.toThrow(); failCommit = false;
  expect(await db.read()).toEqual(started);
  expect((await db.act({ type: 'pause' }, 3000, started))?.phase).toBe('paused');
});
it('queues operations, refuses stale action targets and never cancels a different resumed timer', async () => {
  const db = await openTimerDatabase(); const first = db.act({ type: 'start', durationMs: 10000 }, 1000, null); const read = db.read();
  const duplicate = db.act({ type: 'start', durationMs: 20000 }, 1000, null);
  const started = await first; expect(await read).toEqual(started); await expect(duplicate).rejects.toThrow('Timer session changed.');
  const paused = await db.act({ type: 'pause' }, 2000, started); const resumed = await db.act({ type: 'resume' }, 3000, paused);
  await expect(db.act({ type: 'cancel' }, 3000, started)).rejects.toThrow('Timer session changed.');
  expect(await db.read()).toEqual(resumed); expect(await db.act({ type: 'cancel' }, 3000, resumed)).toBeNull();
});
it('rejects invalid duration/actions and permits a new timer only after completion or cancellation', async () => {
  const db = await openTimerDatabase(); await expect(db.act({ type: 'start', durationMs: 0 }, 1000, null)).rejects.toThrow();
  const started = await db.act({ type: 'start', durationMs: 1000 }, 1000, null);
  await expect(db.act({ type: 'start', durationMs: 2000 }, 1500, started)).rejects.toThrow('Timer already active.');
  await expect(db.act({ type: 'resume' }, 1500, started)).rejects.toThrow(); expect(await db.read()).toEqual(started);
  const next = await db.act({ type: 'start', durationMs: 2000 }, 2000, started); expect(next?.durationMs).toBe(2000);
});
it('detects corrupt state and refuses future schemas without clearing or downgrading them', async () => {
  const db = await openTimerDatabase(); const started = await db.act({ type: 'start', durationMs: 10000 }, 1000, null);
  connections[0].exec('UPDATE timer_session SET remaining_ms = -1;'); await expect(db.read()).rejects.toThrow('Invalid timer session.');
  connections[0].prepare('UPDATE timer_session SET remaining_ms = ?').run(started!.remainingMs);
  connections[0].exec('PRAGMA user_version=3;'); await expect(openTimerDatabase()).rejects.toThrow('Timer storage unavailable.');
  expect(connections[0].prepare('PRAGMA user_version').get()).toEqual({ user_version: 3 }); expect(await db.read()).toEqual(started);
});
it('cancels only the timer, preserving mode and plan data', async () => {
  const display = await openDisplayPreferencesDatabase(); await display.save({ enabled: true });
  const plans = await openSupportPlanDatabase(); const plan = await plans.save({ ...emptySupportPlan, instructions: 'Orientação sintética' });
  const db = await openTimerDatabase(); const started = await db.act({ type: 'start', durationMs: 1000 }, 1000, null);
  await db.act({ type: 'cancel' }, 1500, started); expect(await db.read()).toBeNull();
  expect(await display.read()).toEqual({ enabled: true }); expect(await plans.read()).toEqual(plan);
});
it('reads and commits session and identity together, maintaining identity over pause/resume and reopening', async () => {
  const db = await openTimerDatabase(); expect(await db.readVersioned()).toEqual({ session: null, sessionNumber: null });
  const first = await db.actVersioned({ type: 'start', durationMs: 10000 }, 1000, await db.readVersioned());
  expect(first.sessionNumber).toBe(1); expect(await db.readVersioned()).toEqual(first);
  const paused = await db.actVersioned({ type: 'pause' }, 2000, first);
  const resumed = await db.actVersioned({ type: 'resume' }, 3000, paused);
  expect(resumed.sessionNumber).toBe(1);
  connections[0].close(); const reopened = await openTimerDatabase(); expect(await reopened.readVersioned()).toEqual(resumed);
});
it('rejects a versioned action from another identity even if payload and deadline are identical', async () => {
  const db = await openTimerDatabase();
  const first = await db.actVersioned({ type: 'start', durationMs: 10000 }, 1000, await db.readVersioned());
  const absent = await db.actVersioned({ type: 'cancel' }, 1000, first);
  const second = await db.actVersioned({ type: 'start', durationMs: 10000 }, 1000, absent);
  expect(first.session).toEqual(second.session); expect(second.sessionNumber).toBe(2);
  await expect(db.actVersioned({ type: 'cancel' }, 1000, first)).rejects.toThrow('Timer session changed.');
  expect(await db.readVersioned()).toEqual(second);
});
it('does not publish a new versioned identity after a failed commit', async () => {
  const db = await openTimerDatabase(); const absent = await db.readVersioned(); failCommit = true;
  await expect(db.actVersioned({ type: 'start', durationMs: 10000 }, 1000, absent)).rejects.toThrow(); failCommit = false;
  expect(await db.readVersioned()).toEqual(absent);
  expect((await db.actVersioned({ type: 'start', durationMs: 10000 }, 1000, absent)).sessionNumber).toBe(1);
});
it('refuses a saved session without a valid identity instead of assigning one during read', async () => {
  const db = await openTimerDatabase();
  await db.actVersioned({ type: 'start', durationMs: 10000 }, 1000, await db.readVersioned());
  connections[0].exec('UPDATE timer_alert_state SET session_counter = 0');
  await expect(db.readVersioned()).rejects.toThrow('Invalid timer identity.');
  expect(connections[0].prepare('SELECT session_counter FROM timer_alert_state').get()).toEqual({ session_counter: 0 });
});

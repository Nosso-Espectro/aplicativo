import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { normalizedTimerSession, pauseTimer, resumeTimer, startTimer, timerAt, type TimerSession } from './visual-timer';

export type TimerAction = { type: 'start'; durationMs: number } | { type: 'pause' | 'resume' | 'cancel' };
async function readSession(db: SQLiteDatabase): Promise<TimerSession | null> {
  const [row] = await db.getAllAsync<TimerSession>(`SELECT phase, duration_ms AS durationMs,
    remaining_ms AS remainingMs, deadline_ms AS deadlineMs FROM timer_session WHERE id = 1`);
  return normalizedTimerSession(row ?? null);
}
function sameSession(left: TimerSession | null, right: TimerSession | null) {
  return left === null || right === null ? left === right : left.phase === right.phase && left.durationMs === right.durationMs
    && left.remainingMs === right.remainingMs && left.deadlineMs === right.deadlineMs;
}
export async function openTimerDatabase() {
  const db = await openDatabaseAsync('tear-transition-timer.db');
  try {
    await db.withExclusiveTransactionAsync(async (tx) => {
      const [{ user_version: version }] = await tx.getAllAsync<{ user_version: number }>('PRAGMA user_version');
      if (version > 1) throw new Error('Unsupported timer schema.');
      await tx.execAsync(`CREATE TABLE IF NOT EXISTS timer_session (
        id INTEGER PRIMARY KEY CHECK(id = 1), phase TEXT NOT NULL CHECK(phase IN ('running', 'paused', 'finished')),
        duration_ms INTEGER NOT NULL, remaining_ms INTEGER NOT NULL, deadline_ms INTEGER
      ); PRAGMA user_version = 1;`);
    });
  } catch { await db.closeAsync(); throw new Error('Timer storage unavailable.'); }
  let pending: Promise<unknown> = Promise.resolve();
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const next = pending.then(operation); pending = next.catch(() => undefined); return next;
  }
  return {
    read: () => enqueue(() => readSession(db)),
    act: (action: TimerAction, nowMs: number, expected: TimerSession | null): Promise<TimerSession | null> => enqueue(async () => {
      let saved: TimerSession | null = null;
      await db.withExclusiveTransactionAsync(async (tx) => {
        const current = await readSession(tx);
        if (!sameSession(current, normalizedTimerSession(expected))) throw new Error('Timer session changed.');
        let next: TimerSession | null;
        if (action.type === 'start') {
          const effective = timerAt(current, nowMs);
          if (effective && effective.phase !== 'finished') throw new Error('Timer already active.');
          next = startTimer(action.durationMs, nowMs);
        } else if (action.type === 'cancel') next = null;
        else if (!current) throw new Error('Timer unavailable.');
        else if (action.type === 'pause') next = pauseTimer(current, nowMs);
        else if (action.type === 'resume') next = resumeTimer(current, nowMs);
        else throw new Error('Invalid timer action.');
        if (next) await tx.runAsync(`INSERT INTO timer_session (id, phase, duration_ms, remaining_ms, deadline_ms) VALUES (1, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET phase=excluded.phase, duration_ms=excluded.duration_ms,
          remaining_ms=excluded.remaining_ms, deadline_ms=excluded.deadline_ms`, next.phase, next.durationMs, next.remainingMs, next.deadlineMs);
        else await tx.runAsync('DELETE FROM timer_session WHERE id = 1');
        saved = await readSession(tx);
      });
      return saved;
    }),
  };
}

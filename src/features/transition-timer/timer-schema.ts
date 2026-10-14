import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { normalizedTimerSession, type TimerSession } from './visual-timer';

export async function readTimerSession(db: SQLiteDatabase): Promise<TimerSession | null> {
  const [row] = await db.getAllAsync<TimerSession>(`SELECT phase, duration_ms AS durationMs,
    remaining_ms AS remainingMs, deadline_ms AS deadlineMs FROM timer_session WHERE id = 1`);
  return normalizedTimerSession(row ?? null);
}
export async function readAlertVersion(db: SQLiteDatabase) {
  const [row] = await db.getAllAsync<{ session_counter: number; revision: number }>('SELECT session_counter, revision FROM timer_alert_state WHERE id = 1');
  if (!row || !Number.isSafeInteger(row.session_counter) || row.session_counter < 0 || !Number.isSafeInteger(row.revision) || row.revision < 0) throw new Error('Invalid timer alert version.');
  return row;
}
export async function advanceAlertVersion(db: SQLiteDatabase, newSession = false) {
  await db.runAsync('UPDATE timer_alert_state SET revision = revision + 1, session_counter = session_counter + ? WHERE id = 1', newSession ? 1 : 0);
  await readAlertVersion(db);
}
export async function openTimerConnection() {
  const db = await openDatabaseAsync('tear-transition-timer.db');
  try {
    await db.withExclusiveTransactionAsync(async tx => {
      const [{ user_version: version }] = await tx.getAllAsync<{ user_version: number }>('PRAGMA user_version');
      if (version > 2) throw new Error('Unsupported timer schema.');
      await tx.execAsync(`CREATE TABLE IF NOT EXISTS timer_session (
        id INTEGER PRIMARY KEY CHECK(id = 1), phase TEXT NOT NULL CHECK(phase IN ('running', 'paused', 'finished')),
        duration_ms INTEGER NOT NULL, remaining_ms INTEGER NOT NULL, deadline_ms INTEGER
      ); CREATE TABLE IF NOT EXISTS timer_alert_state (
        id INTEGER PRIMARY KEY CHECK(id = 1), session_counter INTEGER NOT NULL CHECK(session_counter >= 0),
        revision INTEGER NOT NULL CHECK(revision >= 0), enabled INTEGER NOT NULL CHECK(enabled IN (0,1)),
        system_notifications INTEGER NOT NULL CHECK(system_notifications IN (0,1))
      ); CREATE TABLE IF NOT EXISTS timer_alert_marks (minutes INTEGER PRIMARY KEY CHECK(minutes IN (10,5,2)));
      CREATE TABLE IF NOT EXISTS timer_delivered_marks (minutes INTEGER PRIMARY KEY CHECK(minutes IN (10,5,2)));
      CREATE TABLE IF NOT EXISTS timer_owned_notifications (
        identifier TEXT PRIMARY KEY NOT NULL, session_number INTEGER NOT NULL CHECK(session_number > 0),
        minutes INTEGER NOT NULL CHECK(minutes IN (10,5,2)), at_ms INTEGER NOT NULL CHECK(at_ms >= 0)
      );`);
      if (version < 2) await tx.execAsync(`INSERT INTO timer_alert_state (id, session_counter, revision, enabled, system_notifications)
        VALUES (1, (SELECT COUNT(*) FROM timer_session), 0, 0, 0); PRAGMA user_version = 2;`);
      await readAlertVersion(tx);
    });
  } catch { await db.closeAsync(); throw new Error('Timer storage unavailable.'); }
  return db;
}

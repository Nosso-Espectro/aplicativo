import { type SQLiteDatabase } from 'expo-sqlite';
import { advanceAlertVersion, openTimerConnection, readAlertVersion, readTimerSession } from './timer-schema';
import { futureProgressAlerts, normalizedProgressAlerts, type ProgressAlertPreferences, type ProgressMark } from './progress-alerts';
import { normalizedProgressNotification, type OwnedProgressNotification } from './progress-notification';
import { timerAt } from './visual-timer';

async function readSnapshot(db: SQLiteDatabase) {
  const session = await readTimerSession(db);
  const version = await readAlertVersion(db);
  if (session && version.session_counter === 0) throw new Error('Invalid timer alert identity.');
  const [flags] = await db.getAllAsync<{ enabled: number; system_notifications: number }>('SELECT enabled, system_notifications FROM timer_alert_state WHERE id = 1');
  if (!flags || ![0, 1].includes(flags.enabled) || ![0, 1].includes(flags.system_notifications)) throw new Error('Invalid timer alert preferences.');
  const marks = await db.getAllAsync<{ minutes: ProgressMark }>('SELECT minutes FROM timer_alert_marks');
  const delivered = await db.getAllAsync<{ minutes: ProgressMark }>('SELECT minutes FROM timer_delivered_marks');
  const preferences = normalizedProgressAlerts({ enabled: flags.enabled === 1, systemNotifications: flags.system_notifications === 1, marks: marks.map(row => row.minutes) });
  const deliveredMarks = normalizedProgressAlerts({ ...preferences, marks: delivered.map(row => row.minutes) }).marks;
  const rows = await db.getAllAsync<OwnedProgressNotification>('SELECT identifier, session_number AS sessionNumber, minutes, at_ms AS atMs FROM timer_owned_notifications ORDER BY identifier');
  const pending = rows.map(normalizedProgressNotification);
  return { session, sessionNumber: session ? version.session_counter : null, revision: version.revision, preferences, delivered: deliveredMarks, pending };
}
export type ProgressAlertSnapshot = Awaited<ReturnType<typeof readSnapshot>>;

export async function openProgressAlertDatabase() {
  const db = await openTimerConnection();
  let pending: Promise<unknown> = Promise.resolve();
  function enqueue<T>(operation: () => Promise<T>) {
    const next = pending.then(operation); pending = next.catch(() => undefined); return next;
  }
  function change(expectedRevision: number, operation: (tx: SQLiteDatabase, current: ProgressAlertSnapshot) => Promise<void>) {
    return enqueue(async () => {
      let saved!: ProgressAlertSnapshot;
      await db.withExclusiveTransactionAsync(async tx => {
        const current = await readSnapshot(tx);
        if (current.revision !== expectedRevision) throw new Error('Timer alerts changed.');
        await operation(tx, current); await advanceAlertVersion(tx); saved = await readSnapshot(tx);
      });
      return saved;
    });
  }
  return {
    read: () => enqueue(async () => {
      let saved!: ProgressAlertSnapshot;
      await db.withExclusiveTransactionAsync(async tx => { saved = await readSnapshot(tx); }); return saved;
    }),
    savePreferences: (input: ProgressAlertPreferences, expectedRevision: number) => change(expectedRevision, async tx => {
      const draft = normalizedProgressAlerts(input);
      await tx.runAsync('UPDATE timer_alert_state SET enabled = ?, system_notifications = ? WHERE id = 1', draft.enabled ? 1 : 0, draft.systemNotifications ? 1 : 0);
      await tx.runAsync('DELETE FROM timer_alert_marks');
      for (const minutes of draft.marks) await tx.runAsync('INSERT INTO timer_alert_marks (minutes) VALUES (?)', minutes);
    }),
    reserve: (minutes: ProgressMark, atMs: number, nowMs: number, expectedRevision: number) => change(expectedRevision, async (tx, current) => {
      const eligible = futureProgressAlerts(current.preferences, current.session, nowMs, current.delivered);
      if (!current.preferences.systemNotifications || !current.sessionNumber || !eligible.some(mark => mark.minutes === minutes && mark.atMs === atMs)
        || current.pending.some(entry => entry.sessionNumber !== current.sessionNumber || entry.minutes === minutes)) throw new Error('Timer alert unavailable.');
      const identifier = `tear-transition-${current.sessionNumber}-${minutes}-${current.revision}`;
      await tx.runAsync('INSERT INTO timer_owned_notifications (identifier, session_number, minutes, at_ms) VALUES (?, ?, ?, ?)', identifier, current.sessionNumber, minutes, atMs);
    }),
    forget: (identifier: string, expectedRevision: number) => change(expectedRevision, async (tx, current) => {
      if (!current.pending.some(entry => entry.identifier === identifier)) throw new Error('Owned timer alert unavailable.');
      await tx.runAsync('DELETE FROM timer_owned_notifications WHERE identifier = ?', identifier);
    }),
    markDelivered: (minutes: ProgressMark, sessionNumber: number, nowMs: number, expectedRevision: number) => change(expectedRevision, async (tx, current) => {
      const active = timerAt(current.session, nowMs);
      if (!active || active.phase !== 'running' || current.sessionNumber !== sessionNumber || !current.preferences.enabled
        || !current.preferences.marks.includes(minutes) || minutes * 60000 >= active.durationMs || active.remainingMs > minutes * 60000 || current.delivered.includes(minutes)) throw new Error('Timer alert unavailable.');
      await tx.runAsync('INSERT INTO timer_delivered_marks (minutes) VALUES (?)', minutes);
    }),
  };
}

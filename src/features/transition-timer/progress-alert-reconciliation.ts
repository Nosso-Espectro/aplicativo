import type { ProgressAlertSnapshot } from './progress-alert-database';
import { futureProgressAlerts, type ProgressMark } from './progress-alerts';
import { timerAt } from './visual-timer';

export function elapsedProgressMarks(snapshot: ProgressAlertSnapshot, nowMs: number): ProgressMark[] {
  const current = timerAt(snapshot.session, nowMs);
  if (!current || !snapshot.preferences.enabled) return [];
  return snapshot.preferences.marks.filter(minutes => !snapshot.delivered.includes(minutes)
    && minutes * 60000 < current.durationMs && minutes * 60000 >= current.remainingMs);
}

// Consumption prevents replay; it is not evidence that the OS delivered a notification.
export function progressAlertReconciliation(snapshot: ProgressAlertSnapshot, nowMs: number,
  observed: { scheduled: readonly string[]; presented: readonly string[] } = { scheduled: [], presented: [] }) {
  const elapsed = elapsedProgressMarks(snapshot, nowMs);
  const consumedOwned = snapshot.pending.filter(entry => entry.sessionNumber === snapshot.sessionNumber
    && !snapshot.delivered.includes(entry.minutes)
    && (entry.atMs <= nowMs || observed.presented.includes(entry.identifier)));
  const consumed = [...snapshot.delivered, ...elapsed, ...consumedOwned.map(entry => entry.minutes)];
  const future = futureProgressAlerts(snapshot.preferences, snapshot.session, nowMs, consumed);
  const cancel = snapshot.pending.filter(entry => !snapshot.preferences.systemNotifications
    || entry.sessionNumber !== snapshot.sessionNumber
    || !future.some(mark => mark.minutes === entry.minutes && mark.atMs === entry.atMs));
  const retained = snapshot.pending.filter(entry => !cancel.some(old => old.identifier === entry.identifier));
  const scheduleExisting = retained.filter(entry => !observed.scheduled.includes(entry.identifier));
  const reserve = snapshot.preferences.systemNotifications
    ? future.filter(mark => !retained.some(entry => entry.minutes === mark.minutes)) : [];
  return { elapsed, consumedOwned, cancel, scheduleExisting, reserve };
}

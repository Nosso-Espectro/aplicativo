import { timerAt, type TimerSession } from './visual-timer';

export const progressMarks = [10, 5, 2] as const;
export type ProgressMark = typeof progressMarks[number];
export type ProgressAlertPreferences = { enabled: boolean; marks: ProgressMark[]; systemNotifications: boolean };
export const emptyProgressAlerts: ProgressAlertPreferences = { enabled: false, marks: [], systemNotifications: false };

function checkedMarks(input: readonly ProgressMark[]): ProgressMark[] {
  if (!Array.isArray(input) || !input.every(value => progressMarks.includes(value))) throw new Error('Invalid progress alert preferences.');
  return progressMarks.filter(value => input.includes(value));
}
export function normalizedProgressAlerts(input: ProgressAlertPreferences): ProgressAlertPreferences {
  if (!input || typeof input.enabled !== 'boolean' || typeof input.systemNotifications !== 'boolean') throw new Error('Invalid progress alert preferences.');
  return { enabled: input.enabled, marks: checkedMarks(input.marks), systemNotifications: input.systemNotifications };
}
export function futureProgressAlerts(input: ProgressAlertPreferences, session: TimerSession | null, nowMs: number, delivered: readonly ProgressMark[] = []) {
  const preferences = normalizedProgressAlerts(input);
  const current = timerAt(session, nowMs);
  const previous = checkedMarks(delivered);
  if (!preferences.enabled || !current || current.phase !== 'running') return [];
  return preferences.marks.flatMap(minutes => {
    const thresholdMs = minutes * 60000;
    if (previous.includes(minutes) || thresholdMs >= current.durationMs || thresholdMs >= current.remainingMs) return [];
    return [{ minutes, atMs: current.deadlineMs! - thresholdMs }];
  });
}

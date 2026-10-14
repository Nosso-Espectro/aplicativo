import type { ProgressAlertSnapshot } from './progress-alert-database';
import { normalizedProgressAlerts, type ProgressMark } from './progress-alerts';
import { timerAt } from './visual-timer';

export type ProgressVisualSample = { snapshot: ProgressAlertSnapshot; nowMs: number; monotonicMs: number; foreground: boolean };
const clockDriftToleranceMs = 1000;

export function crossedVisualProgressMark(previous: ProgressVisualSample | null, next: ProgressVisualSample): ProgressMark | null {
  const current = timerAt(next.snapshot.session, next.nowMs);
  if (!previous || !previous.foreground || !next.foreground || !current || current.phase !== 'running'
    || next.snapshot.sessionNumber === null) return null;
  const before = timerAt(previous.snapshot.session, previous.nowMs);
  if (!before || before.phase !== 'running' || previous.snapshot.sessionNumber !== next.snapshot.sessionNumber
    || before.deadlineMs !== current.deadlineMs || before.durationMs !== current.durationMs) return null;
  const preferences = normalizedProgressAlerts(next.snapshot.preferences);
  const oldPreferences = normalizedProgressAlerts(previous.snapshot.preferences);
  if (!preferences.enabled || !oldPreferences.enabled || preferences.systemNotifications !== oldPreferences.systemNotifications
    || preferences.marks.join(',') !== oldPreferences.marks.join(',')) return null;
  const wallDelta = next.nowMs - previous.nowMs;
  const monotonicDelta = next.monotonicMs - previous.monotonicMs;
  if (!Number.isFinite(next.monotonicMs) || !Number.isFinite(previous.monotonicMs)
    || previous.monotonicMs < 0 || next.monotonicMs < 0 || wallDelta <= 0 || monotonicDelta <= 0
    || Math.abs(wallDelta - monotonicDelta) > clockDriftToleranceMs) return null;
  const crossed = preferences.marks.filter(minutes => minutes * 60000 < current.durationMs
    && !next.snapshot.delivered.includes(minutes) && !previous.snapshot.delivered.includes(minutes)
    && before.remainingMs > minutes * 60000 && current.remainingMs <= minutes * 60000);
  // A stalled foreground must not replay several elapsed milestones as a burst.
  return crossed.length === 1 ? crossed[0] : null;
}

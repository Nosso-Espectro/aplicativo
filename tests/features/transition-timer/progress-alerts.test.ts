import { emptyProgressAlerts, futureProgressAlerts, normalizedProgressAlerts, type ProgressAlertPreferences } from '../../../src/features/transition-timer/progress-alerts';
import { pauseTimer, resumeTimer, startTimer } from '../../../src/features/transition-timer/visual-timer';
const enabled: ProgressAlertPreferences = { enabled: true, marks: [10, 5, 2], systemNotifications: false };
it('starts disabled with no choices or native notification consent', () => {
  expect(normalizedProgressAlerts(emptyProgressAlerts)).toEqual({ enabled: false, marks: [], systemNotifications: false });
  expect(futureProgressAlerts(emptyProgressAlerts, startTimer(1200000, 1000), 1000)).toEqual([]);
});
it('normalizes selected marks in stable order without changing input or inferring notification consent', () => {
  const input: ProgressAlertPreferences = { enabled: true, marks: [2, 10, 2], systemNotifications: false };
  expect(normalizedProgressAlerts(input)).toEqual({ enabled: true, marks: [10, 2], systemNotifications: false });
  expect(input.marks).toEqual([2, 10, 2]);
});
it('rejects unsupported marks and non-boolean flags generically', () => {
  for (const input of [null, { ...enabled, enabled: 'true' }, { ...enabled, systemNotifications: 1 }, { ...enabled, marks: [3] }, { ...enabled, marks: ['5'] }]) {
    expect(() => normalizedProgressAlerts(input as unknown as ProgressAlertPreferences)).toThrow('Invalid progress alert preferences.');
  }
});
it('produces only future marks strictly below initial duration without immediate or late catch-up alerts', () => {
  const session = startTimer(10 * 60000, 1000);
  expect(futureProgressAlerts(enabled, session, 1000)).toEqual([{ minutes: 5, atMs: 301000 }, { minutes: 2, atMs: 481000 }]);
  expect(futureProgressAlerts(enabled, session, 301000)).toEqual([{ minutes: 2, atMs: 481000 }]);
  expect(futureProgressAlerts(enabled, session, 500000)).toEqual([]);
});
it('omits already-delivered marks, paused/finished/absent sessions and every mark when disabled', () => {
  const session = startTimer(20 * 60000, 1000);
  expect(futureProgressAlerts(enabled, session, 1000, [10, 5])).toEqual([{ minutes: 2, atMs: 1081000 }]);
  for (const input of [null, pauseTimer(session, 1000), { ...session, phase: 'finished' as const, remainingMs: 0, deadlineMs: null }]) expect(futureProgressAlerts(enabled, input, 1000)).toEqual([]);
  expect(futureProgressAlerts({ ...enabled, enabled: false }, session, 1000)).toEqual([]);
});
it('recalculates only remaining future marks from a resumed deadline while keeping emitted marks excluded', () => {
  const paused = pauseTimer(startTimer(20 * 60000, 1000), 661000);
  const resumed = resumeTimer(paused, 1000000);
  expect(futureProgressAlerts(enabled, resumed, 1000000, [10])).toEqual([{ minutes: 5, atMs: 1240000 }, { minutes: 2, atMs: 1420000 }]);
});

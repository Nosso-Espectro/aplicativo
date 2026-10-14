import { progressAlertReconciliation, elapsedProgressMarks } from '../../../src/features/transition-timer/progress-alert-reconciliation';
import type { ProgressAlertSnapshot } from '../../../src/features/transition-timer/progress-alert-database';
import { startTimer, pauseTimer, resumeTimer } from '../../../src/features/transition-timer/visual-timer';

function snapshot(): ProgressAlertSnapshot {
  return { session: startTimer(1200000, 1000), sessionNumber: 1, revision: 5,
    preferences: { enabled: true, systemNotifications: true, marks: [10, 5, 2] }, delivered: [],
    pending: [{ identifier: 'tear-transition-1-10-4', sessionNumber: 1, minutes: 10, atMs: 601000 }] };
}
it('retains observed future IDs and reserves only missing future markers without mutating inputs', () => {
  const current = snapshot(); const before = structuredClone(current);
  expect(progressAlertReconciliation(current, 1000, { scheduled: [current.pending[0].identifier], presented: [] }))
    .toEqual({ elapsed: [], consumedOwned: [], cancel: [], scheduleExisting: [], reserve: [{ minutes: 5, atMs: 901000 }, { minutes: 2, atMs: 1081000 }] });
  expect(current).toEqual(before);
});
it('retries an uncertain future intent using its existing ID, never reserving a duplicate', () => {
  const current = snapshot(); const plan = progressAlertReconciliation(current, 1000);
  expect(plan.scheduleExisting).toEqual(current.pending); expect(plan.reserve.map(mark => mark.minutes)).toEqual([5, 2]);
});
it('consumes elapsed or currently presented own requests without claiming OS delivery or replaying on clock rollback', () => {
  const current = snapshot();
  const plan = progressAlertReconciliation(current, 950000);
  expect(plan.elapsed).toEqual([10, 5]); expect(plan.cancel).toEqual(current.pending); expect(plan.reserve).toEqual([{ minutes: 2, atMs: 1081000 }]);
  const earlyObserved = progressAlertReconciliation(current, 1000, { scheduled: [], presented: [current.pending[0].identifier, 'foreign'] });
  expect(earlyObserved.consumedOwned).toEqual(current.pending); expect(earlyObserved.cancel).toEqual(current.pending);
  current.delivered = [10, 5]; current.pending = [];
  expect(progressAlertReconciliation(current, 1000).reserve.map(mark => mark.minutes)).toEqual([2]);
});
it('cancels old-session IDs even when the current timer has identical content', () => {
  const current = snapshot(); current.sessionNumber = 2;
  const plan = progressAlertReconciliation(current, 1000, { scheduled: [], presented: [current.pending[0].identifier] });
  expect(plan.consumedOwned).toEqual([]); expect(plan.cancel).toEqual(current.pending); expect(plan.reserve).toHaveLength(3);
});
it('cancels paused requests and retargets only future markers after resume', () => {
  const current = snapshot(); current.session = pauseTimer(current.session!, 602000);
  expect(elapsedProgressMarks(current, 700000)).toEqual([10]);
  expect(progressAlertReconciliation(current, 700000)).toMatchObject({ cancel: current.pending, reserve: [] });
  current.delivered = [10]; current.session = resumeTimer(current.session, 700000);
  expect(progressAlertReconciliation(current, 700000).reserve).toEqual([{ minutes: 5, atMs: 999000 }, { minutes: 2, atMs: 1179000 }]);
});
it.each(['disabled', 'visual', 'finished', 'absent'] as const)('cancels own requests without new scheduling when %s', condition => {
  const current = snapshot();
  if (condition === 'disabled') current.preferences.enabled = false;
  if (condition === 'visual') current.preferences.systemNotifications = false;
  if (condition === 'absent') { current.session = null; current.sessionNumber = null; }
  const plan = progressAlertReconciliation(current, condition === 'finished' ? 1300000 : 1000);
  expect(plan.cancel).toEqual(current.pending); expect(plan.reserve).toEqual([]); expect(plan.scheduleExisting).toEqual([]);
});

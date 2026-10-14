import { crossedVisualProgressMark, type ProgressVisualSample } from '../../../src/features/transition-timer/progress-visual-crossing';
import { pauseTimer, resumeTimer, startTimer } from '../../../src/features/transition-timer/visual-timer';

function sample(nowMs: number): ProgressVisualSample {
  return { nowMs, monotonicMs: nowMs - 1000, foreground: true,
    snapshot: { session: startTimer(1200000, 1000), sessionNumber: 1, revision: 1,
      preferences: { enabled: true, marks: [10, 5, 2], systemNotifications: false }, delivered: [], pending: [] } };
}
it('detects one current foreground crossing without modifying the sampled state', () => {
  const before = sample(600000); const next = sample(601000);
  expect(crossedVisualProgressMark(before, next)).toBe(10);
  expect(next.snapshot.delivered).toEqual([]);
});
it('does not replay a marker on restoration, an unchanged tick, or a consumed marker', () => {
  const next = sample(601000);
  expect(crossedVisualProgressMark(null, next)).toBeNull();
  expect(crossedVisualProgressMark(next, next)).toBeNull();
  next.snapshot.delivered = [10]; expect(crossedVisualProgressMark(sample(600000), next)).toBeNull();
});
it.each(['previous', 'next'] as const)('does not announce elapsed background marks when %s sample is not foreground', which => {
  const previous = sample(600000); const next = sample(601000);
  (which === 'previous' ? previous : next).foreground = false;
  expect(crossedVisualProgressMark(previous, next)).toBeNull();
});
it('does not replay several markers after a foreground stall or completion', () => {
  expect(crossedVisualProgressMark(sample(600000), sample(950000))).toBeNull();
  expect(crossedVisualProgressMark(sample(600000), sample(1300000))).toBeNull();
});
it('suppresses wall-clock jumps and backwards monotonic samples', () => {
  const next = sample(602000); next.monotonicMs = sample(600000).monotonicMs + 10;
  expect(crossedVisualProgressMark(sample(600000), next)).toBeNull();
  next.monotonicMs = -1; expect(crossedVisualProgressMark(sample(600000), next)).toBeNull();
  expect(crossedVisualProgressMark(sample(602000), sample(600000))).toBeNull();
});
it('does not announce immediately after selection, enabling, or changing session identity', () => {
  const previous = sample(600000); const next = sample(601000);
  next.snapshot.sessionNumber = 2; expect(crossedVisualProgressMark(previous, next)).toBeNull();
  previous.snapshot.sessionNumber = null; next.snapshot.sessionNumber = null;
  expect(crossedVisualProgressMark(previous, next)).toBeNull(); previous.snapshot.sessionNumber = 1;
  next.snapshot.sessionNumber = 1; previous.snapshot.preferences.enabled = false;
  expect(crossedVisualProgressMark(previous, next)).toBeNull();
  previous.snapshot.preferences.enabled = true; previous.snapshot.preferences.marks = [5, 2];
  expect(crossedVisualProgressMark(previous, next)).toBeNull();
});
it('does not treat a pause/resume deadline change as a foreground crossing', () => {
  const previous = sample(600000); const next = sample(601000);
  next.snapshot.session = pauseTimer(next.snapshot.session!, 600000);
  expect(crossedVisualProgressMark(previous, next)).toBeNull();
  next.snapshot.session = resumeTimer(next.snapshot.session, 600500);
  expect(crossedVisualProgressMark(previous, next)).toBeNull();
});

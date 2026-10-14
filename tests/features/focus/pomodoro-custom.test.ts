import { initialPomodoroState, reducePomodoro, validPomodoroCustomTimes } from '../../../src/features/focus/pomodoro-model';
const custom = (focusMinutes: number, breakMinutes: number, nowMs = 1000) => reducePomodoro(initialPomodoroState(), {
  type: 'start', presetId: 'custom', customTimes: { focusMinutes, breakMinutes }, expectedRevision: 0, nowMs,
});
it.each([1, 180])('accepts each inclusive boundary %s for both intervals', minutes => {
  expect(custom(minutes, minutes).session).toMatchObject({ focusMs: minutes * 60000, breakMs: minutes * 60000, remainingMs: minutes * 60000 });
});
it.each([0, -1, 181, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER])('refuses invalid duration %s without starting or changing revision', minutes => {
  expect(validPomodoroCustomTimes({ focusMinutes: minutes, breakMinutes: 5 })).toBe(false);
  expect(custom(minutes, 5)).toEqual(initialPomodoroState());
  expect(custom(25, minutes)).toEqual(initialPomodoroState());
});
it('requires custom times and ignores them for fixed presets', () => {
  const state = initialPomodoroState();
  expect(reducePomodoro(state, { type: 'start', presetId: 'custom', nowMs: 1, expectedRevision: 0 })).toBe(state);
  expect(reducePomodoro(state, { type: 'start', presetId: '50-10', customTimes: { focusMinutes: 1, breakMinutes: 1 }, nowMs: 1, expectedRevision: 0 }).session)
    .toMatchObject({ focusMs: 3000000, breakMs: 600000 });
});
it('captures values independently and waits for human commands through both phases', () => {
  const times = { focusMinutes: 1, breakMinutes: 2 };
  const state = reducePomodoro(initialPomodoroState(), { type: 'start', presetId: 'custom', customTimes: times, expectedRevision: 0, nowMs: 1000 });
  times.focusMinutes = 180; times.breakMinutes = 180;
  const waiting = reducePomodoro(state, { type: 'tick', expectedRevision: state.revision, nowMs: 61000 });
  expect(waiting.session).toMatchObject({ status: 'waiting', remainingMs: 0 });
  const pause = reducePomodoro(waiting, { type: 'next', expectedRevision: waiting.revision, nowMs: 90000 });
  expect(pause.session).toMatchObject({ phase: 'break', remainingMs: 120000 });
  const done = reducePomodoro(pause, { type: 'tick', expectedRevision: pause.revision, nowMs: 210000 });
  expect(reducePomodoro(done, { type: 'next', expectedRevision: done.revision, nowMs: 210001 }).session?.remainingMs).toBe(60000);
  expect(state.session).toMatchObject({ remainingMs: 60000, breakMs: 120000 });
});
it('preserves durations on clock failure, pause and resume; rejects replacement and stale commands', () => {
  const state = custom(3, 7);
  const paused = reducePomodoro(state, { type: 'pause', expectedRevision: state.revision, nowMs: 2000 });
  expect(reducePomodoro(paused, { type: 'start', presetId: '25-5', expectedRevision: paused.revision, nowMs: 2001 })).toBe(paused);
  const failed = reducePomodoro(paused, { type: 'resume', expectedRevision: paused.revision, nowMs: NaN });
  expect(failed).toMatchObject({ error: 'clock', session: { focusMs: 180000, breakMs: 420000, remainingMs: 179000 } });
  expect(reducePomodoro(failed, { type: 'resume', expectedRevision: state.revision, nowMs: 3000 })).toBe(failed);
  const resumed = reducePomodoro(failed, { type: 'resume', expectedRevision: failed.revision, nowMs: 3000 });
  expect(resumed.session).toMatchObject({ status: 'running', deadlineMs: 182000, focusMs: 180000, breakMs: 420000 });
});

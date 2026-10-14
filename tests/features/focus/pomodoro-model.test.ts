import { initialPomodoroState, pomodoroPresets, reducePomodoro, type PomodoroState } from '../../../src/features/focus/pomodoro-model';
function start(presetId: '25-5' | '50-10' = '25-5', nowMs = 1000) {
  return reducePomodoro(initialPomodoroState(), { type: 'start', presetId, nowMs, expectedRevision: 0 });
}
function timed(state: PomodoroState, type: 'tick' | 'pause' | 'resume' | 'next', nowMs: number) {
  return reducePomodoro(state, { type, nowMs, expectedRevision: state.revision });
}
describe('manual Pomodoro model', () => {
  it('starts both fixed presets without changing an active selection', () => {
    expect(pomodoroPresets.map(preset => [preset.focusMs, preset.breakMs])).toEqual([[1500000, 300000], [3000000, 600000]]);
    expect(start('50-10').session?.remainingMs).toBe(3000000);
    const state = start();
    expect(reducePomodoro(state, { type: 'start', presetId: '50-10', nowMs: 2000, expectedRevision: state.revision })).toBe(state);
  });
  it('uses deadlines rather than tick counts and freezes remaining time while paused', () => {
    const started = start(); const tick = timed(started, 'tick', 11000);
    expect(tick.session?.remainingMs).toBe(1490000);
    expect(started.session?.remainingMs).toBe(1500000);
    const paused = timed(tick, 'pause', 21000);
    expect(paused.session?.remainingMs).toBe(1480000);
    expect(timed(paused, 'tick', 9000000)).toBe(paused);
    const resumed = timed(paused, 'resume', 9000000);
    expect(resumed.session?.deadlineMs).toBe(10480000);
    expect(timed(resumed, 'tick', 9000001).session?.remainingMs).toBe(1479999);
  });
  it('waits at each boundary and never catches up multiple phases after background', () => {
    const expired = timed(start(), 'tick', 90000000);
    expect(expired.session).toMatchObject({ phase: 'focus', status: 'waiting', remainingMs: 0, deadlineMs: null });
    expect(timed(expired, 'tick', 99000000)).toBe(expired);
    const pause = timed(expired, 'next', 99000000);
    expect(pause.session).toMatchObject({ phase: 'break', status: 'running', remainingMs: 300000 });
    const finishedPause = timed(pause, 'tick', 99300000);
    expect(finishedPause.session).toMatchObject({ phase: 'break', status: 'waiting' });
    expect(timed(finishedPause, 'next', 99300001).session).toMatchObject({ phase: 'focus', remainingMs: 1500000 });
  });
  it('handles pause at expiry as a waiting boundary, not a resumable zero timer', () => {
    const boundary = timed(start(), 'pause', 1501000);
    expect(boundary.session?.status).toBe('waiting');
    expect(timed(boundary, 'resume', 1501001)).toBe(boundary);
  });
  it('retains a waiting boundary after a failed next-phase clock and permits human retry', () => {
    const waiting = timed(start('50-10'), 'tick', 3001000);
    const failed = timed(waiting, 'next', NaN);
    expect(failed).toMatchObject({ error: 'clock', session: { status: 'waiting', phase: 'focus', remainingMs: 0 } });
    const retry = timed(failed, 'next', 4000000);
    expect(retry).toMatchObject({ error: null, session: { status: 'running', phase: 'break', remainingMs: 600000 } });
  });
  it('rejects stale and duplicate commands across phases, pauses, end and restart', () => {
    const first = start(); const paused = timed(first, 'pause', 2000);
    expect(reducePomodoro(paused, { type: 'pause', nowMs: 3000, expectedRevision: first.revision })).toBe(paused);
    const ended = reducePomodoro(paused, { type: 'end', expectedRevision: paused.revision });
    const restarted = reducePomodoro(ended, { type: 'start', presetId: '50-10', nowMs: 4000, expectedRevision: ended.revision });
    expect(reducePomodoro(restarted, { type: 'tick', nowMs: 90000000, expectedRevision: first.revision })).toBe(restarted);
    expect(ended.session).toBeNull(); expect(initialPomodoroState()).toEqual({ revision: 0, session: null, error: null });
    const waiting = timed(restarted, 'tick', 3004000); const next = timed(waiting, 'next', 3004001);
    expect(reducePomodoro(next, { type: 'next', nowMs: 3004002, expectedRevision: waiting.revision })).toBe(next);
  });
  it.each([NaN, Infinity, -1, 0.5, Number.MAX_SAFE_INTEGER])('does not start with an invalid or overflowing clock %s', nowMs => {
    const state = start('25-5', nowMs); expect(state.session).toBeNull(); expect(state.error).toBe('clock');
  });
  it('pauses on a regressive or invalid running clock and recovers only by explicit resume', () => {
    const state = timed(start(), 'tick', 5000);
    for (const nowMs of [4999, NaN, Infinity]) {
      const failed = timed(state, 'tick', nowMs);
      expect(failed).toMatchObject({ error: 'clock', session: { status: 'paused', remainingMs: 1496000, deadlineMs: null } });
      expect(timed(failed, 'tick', 90000000)).toBe(failed);
      const resumed = timed(failed, 'resume', 10);
      expect(resumed.error).toBeNull(); expect(resumed.session?.deadlineMs).toBe(1496010);
    }
  });
});

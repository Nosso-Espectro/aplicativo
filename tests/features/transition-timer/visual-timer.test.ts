import { durationFromInput, normalizedTimerSession, pauseTimer, resumeTimer, startTimer, timerAt, timerVisual, type TimerSession } from '../../../src/features/transition-timer/visual-timer';

it('accepts explicit whole minute/second fields from1s to24h without a suggested duration — spec006/RF-001', () => {
  expect(durationFromInput('', '1')).toBe(1000); expect(durationFromInput('1', '')).toBe(60000);
  expect(durationFromInput(' 2 ', '30')).toBe(150000); expect(durationFromInput('1440', '0')).toBe(86400000);
});
it('rejects empty/zero, negative, fractions, exponent, non-finite and excessive input generically', () => {
  for (const [minutes, seconds] of [['', ''], ['0', '0'], ['-1', '0'], ['1.5', '0'], ['1e2', '0'], ['Infinity', '0'], ['1', '60'], ['1440', '1'], ['texto sintético', '0']]) {
    expect(() => durationFromInput(minutes, seconds)).toThrow('Invalid timer duration.');
  }
});
it('derives remaining time/proportion from a deadline rather than the number of ticks — spec006/RF-002', () => {
  const timer = startTimer(60000, 10000);
  expect(timerVisual(timer, 25000)).toEqual({ phase: 'running', remainingMs: 45000, remainingSeconds: 45, remainingFraction: 0.75 });
  expect(timerVisual(timer, 68500)).toEqual({ phase: 'running', remainingMs: 1500, remainingSeconds: 2, remainingFraction: 0.025 });
  expect(timerVisual(timer, 80000)).toEqual({ phase: 'finished', remainingMs: 0, remainingSeconds: 0, remainingFraction: 0 });
  expect(timer.remainingMs).toBe(60000);
});
it('pauses the current remainder and resumes it with a new deadline without restarting duration — spec006/RF-003', () => {
  const paused = pauseTimer(startTimer(60000, 10000), 25345);
  expect(paused).toEqual({ phase: 'paused', durationMs: 60000, remainingMs: 44655, deadlineMs: null });
  expect(timerAt(paused, 100000)).toEqual(paused);
  const resumed = resumeTimer(paused, 110000);
  expect(resumed).toEqual({ phase: 'running', durationMs: 60000, remainingMs: 44655, deadlineMs: 154655 });
  expect(timerAt(resumed, 154655)?.phase).toBe('finished');
});
it('does not turn an expired timer into a paused session with zero remainder', () => {
  const finished = pauseTimer(startTimer(1000, 10000), 11000);
  expect(finished).toEqual({ phase: 'finished', durationMs: 1000, remainingMs: 0, deadlineMs: null });
  expect(() => resumeTimer(finished, 12000)).toThrow('Invalid timer action.');
});
it('limits a backwards-clock update to the confirmed remaining snapshot and never shows negative time', () => {
  const snapshot = timerAt(startTimer(10000, 10000), 15000)!;
  expect(timerAt(snapshot, 10000)?.remainingMs).toBe(5000);
  expect(timerAt(snapshot, 50000)?.remainingMs).toBe(0);
});
it('validates session combinations, clocks and overflow before any side effect', () => {
  const timer = startTimer(1000, 10000); expect(normalizedTimerSession(null)).toBeNull();
  for (const value of [{ ...timer, phase: 'other' }, { ...timer, remainingMs: 1001 }, { ...timer, deadlineMs: null }, { ...timer, phase: 'paused' }, { ...timer, phase: 'finished' }, { ...timer, durationMs: 1 }]) {
    expect(() => normalizedTimerSession(value as TimerSession)).toThrow('Invalid timer session.');
  }
  expect(() => timerAt(timer, NaN)).toThrow('Invalid timer clock.');
  expect(() => startTimer(1000, Number.MAX_SAFE_INTEGER)).toThrow('Invalid timer session.');
  expect(() => pauseTimer(pauseTimer(timer, 10001), 10002)).toThrow('Invalid timer action.');
});

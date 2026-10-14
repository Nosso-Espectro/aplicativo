import { initialSoundTimer, reduceSoundTimer, validSoundTimerMinutes } from '../../../src/features/regulation-sounds/sound-timer';
function armed() { return reduceSoundTimer(initialSoundTimer(), { type: 'arm', minutes: 1, nowMs: 1000, expectedRevision: 0 }); }
it.each([0, -1, 181, 1.5, NaN, Infinity])('rejects invalid durations without changing a confirmed timer: %s', minutes => {
  const state = armed(); expect(validSoundTimerMinutes(minutes)).toBe(false);
  expect(reduceSoundTimer(state, { type: 'arm', minutes, nowMs: 2000, expectedRevision: state.revision })).toBe(state);
});
it('accepts duration boundaries and counts deadline differences, not ticks', () => {
  expect(validSoundTimerMinutes(1)).toBe(true); expect(validSoundTimerMinutes(180)).toBe(true);
  const first = armed(); const sampled = reduceSoundTimer(first, { type: 'tick', nowMs: 1100, expectedRevision: first.revision });
  expect(sampled.remainingMs).toBe(59900);
  expect(reduceSoundTimer(sampled, { type: 'tick', nowMs: 61000, expectedRevision: sampled.revision }).status).toBe('stopping');
  expect(first.remainingMs).toBe(60000);
});
it('requires observed stop confirmation and rejects stale expiry/cancel/arm callbacks', () => {
  const first = armed(); const expired = reduceSoundTimer(first, { type: 'tick', nowMs: 9999999, expectedRevision: first.revision });
  expect(expired.status).toBe('stopping');
  expect(reduceSoundTimer(expired, { type: 'arm', minutes: 15, nowMs: 9999999, expectedRevision: expired.revision })).toBe(expired);
  expect(reduceSoundTimer(expired, { type: 'cancel', expectedRevision: first.revision })).toBe(expired);
  const finished = reduceSoundTimer(expired, { type: 'finished', expectedRevision: expired.revision });
  expect(finished.status).toBe('finished');
  expect(reduceSoundTimer(finished, { type: 'tick', nowMs: 1, expectedRevision: first.revision })).toBe(finished);
});
it('cancels and replaces timers without retaining prior deadlines', () => {
  const first = armed(); const canceled = reduceSoundTimer(first, { type: 'cancel', expectedRevision: first.revision });
  expect(canceled).toMatchObject({ status: 'idle', deadlineMs: null });
  const next = reduceSoundTimer(canceled, { type: 'arm', minutes: 180, nowMs: 5000, expectedRevision: canceled.revision });
  expect(next.deadlineMs).toBe(10805000);
  expect(reduceSoundTimer(next, { type: 'failed', expectedRevision: first.revision })).toBe(next);
});
it.each([NaN, Infinity, -1, 0.5, Number.MAX_SAFE_INTEGER])('invalidates unsafe clocks/deadlines without claiming expiry: %s', nowMs => {
  const state = reduceSoundTimer(initialSoundTimer(), { type: 'arm', minutes: 1, nowMs, expectedRevision: 0 });
  expect(state).toMatchObject({ status: 'error', error: 'clock', deadlineMs: null });
});
it('preserves last confirmed remaining time on a regressive clock and permits human rearm', () => {
  const first = armed(); const failed = reduceSoundTimer(first, { type: 'tick', nowMs: 999, expectedRevision: first.revision });
  expect(failed).toMatchObject({ status: 'error', error: 'clock', remainingMs: 60000 });
  expect(reduceSoundTimer(failed, { type: 'arm', minutes: 5, nowMs: 1, expectedRevision: failed.revision })).toMatchObject({ status: 'armed', error: null, remainingMs: 300000 });
});

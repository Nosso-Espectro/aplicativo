import { initialMeditationState, meditationPresets, reduceMeditation, validMeditationDuration, type MeditationState } from '../../../src/features/meditation/meditation-model';
function start(minutes = 1, noticeEnabled = false, nowMs = 1000) {
  return reduceMeditation(initialMeditationState(), { type: 'start', expectedRevision: 0, durationMinutes: minutes, noticeEnabled, nowMs });
}
function act(state: MeditationState, type: 'tick' | 'pause' | 'resume' | 'end', nowMs: number) {
  return reduceMeditation(state, { type, expectedRevision: state.revision, nowMs });
}
it('starts empty and validates integer durations and presets without a clinical or retained default session', () => {
  expect(initialMeditationState()).toEqual({ revision: 0, session: null, error: null }); expect(meditationPresets).toEqual([5, 10, 20, 30]);
  for (const value of [1, 5, 10, 20, 30, 180]) expect(validMeditationDuration(value)).toBe(true);
  for (const value of [0, -1, 181, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
    expect(validMeditationDuration(value)).toBe(false); expect(start(value)).toMatchObject({ session: null, error: 'configuration' });
  }
});
it('captures duration and explicit notice option and rejects a truthy nonboolean', () => {
  expect(start()).toMatchObject({ revision: 1, session: { status: 'running', remainingMs: 60000, durationMinutes: 1, noticeEnabled: false } });
  expect(start(180, true).session).toMatchObject({ remainingMs: 10800000, noticeEnabled: true });
  expect(start(1, 'true' as unknown as boolean)).toMatchObject({ session: null, error: 'configuration' });
});
it('derives elapsed wall time rather than counting ticks and does not revise on a display refresh', () => {
  const initial = start(); const current = act(initial, 'tick', 11000);
  expect(current.session!.remainingMs).toBe(50000); expect(current.revision).toBe(initial.revision);
  expect(act(current, 'tick', 11000)).toBe(current); expect(initial.session!.remainingMs).toBe(60000);
  expect(act(current, 'tick', 30500).session!.remainingMs).toBe(30500);
});
it('pauses and resumes confirmed remaining time without resetting duration or counting paused time', () => {
  const paused = act(start(1, true), 'pause', 21000); expect(paused.session).toMatchObject({ status: 'paused', remainingMs: 40000, noticeEnabled: true });
  expect(act(paused, 'tick', 90000)).toBe(paused); expect(act(paused, 'pause', 90000)).toBe(paused);
  const resumed = act(paused, 'resume', 100000); expect(act(resumed, 'tick', 115000).session!.remainingMs).toBe(25000);
});
it.each([false, true])('completes once with notice option %s, clamps at zero and waits for a new human session', noticeEnabled => {
  const complete = act(start(1, noticeEnabled), 'tick', 90000);
  expect(complete.session).toMatchObject({ status: 'completed', remainingMs: 0, noticeEnabled });
  expect(act(complete, 'tick', 190000)).toBe(complete); expect(act(complete, 'resume', 190000)).toBe(complete); expect(act(complete, 'end', 190000)).toBe(complete);
  const next = reduceMeditation(complete, { type: 'start', expectedRevision: complete.revision, durationMinutes: 5, noticeEnabled: false, nowMs: 200000 });
  expect(next.session).toMatchObject({ status: 'running', remainingMs: 300000, noticeEnabled: false });
});
it('reconciles expiry on returning from a long background interval without a polling assumption', () => {
  expect(act(start(10), 'tick', 601000).session!.status).toBe('completed');
  expect(act(start(10), 'tick', 601000).session!.remainingMs).toBe(0);
});
it('ends manually without a natural completion notice and retains only the temporary remainder', () => {
  const ended = act(start(1, true), 'end', 11000); expect(ended.session).toMatchObject({ status: 'ended', remainingMs: 50000, noticeEnabled: true });
  expect(act(ended, 'tick', 90000)).toBe(ended); expect(act(ended, 'resume', 90000)).toBe(ended);
  expect(act(act(start(), 'pause', 11000), 'end', NaN).session!.status).toBe('ended');
});
it('allows a human end of clock-error paused state without requiring a valid clock or erasing confirmed remainder', () => {
  const confirmed = act(start(), 'tick', 11000); const failed = act(confirmed, 'end', NaN);
  expect(failed.session!.status).toBe('paused'); expect(failed.error).toBe('clock');
  expect(act(failed, 'end', NaN)).toMatchObject({ error: null, session: { status: 'ended', remainingMs: 50000, generation: confirmed.session!.generation } });
});
it.each([NaN, Infinity, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, 8640000000000001])('preserves confirmed remaining time on invalid clock %s and requires human resume', now => {
  const confirmed = act(start(), 'tick', 11000); const failed = act(confirmed, 'tick', now);
  expect(failed).toMatchObject({ error: 'clock', session: { status: 'paused', remainingMs: 50000, startedAtMs: null } });
  expect(act(failed, 'tick', 90000)).toBe(failed); expect(act(failed, 'resume', 100000).session).toMatchObject({ status: 'running', remainingMs: 50000 });
});
it('refuses regressive clocks, overflow deadlines and a failed restart without erasing the prior result', () => {
  const confirmed = act(start(), 'tick', 11000); expect(act(confirmed, 'pause', 10000)).toMatchObject({ error: 'clock', session: { remainingMs: 50000, status: 'paused' } });
  const complete = act(start(), 'tick', 61000);
  const restart = reduceMeditation(complete, { type: 'start', expectedRevision: complete.revision, durationMinutes: 1, noticeEnabled: false, nowMs: 8640000000000000 });
  expect(restart.session).toBe(complete.session); expect(restart.error).toBe('clock'); expect(start(1, false, 8640000000000000).session).toBeNull();
});
it('rejects stale and duplicate commands and never starts over an active or paused session', () => {
  const initial = start(); const paused = act(initial, 'pause', 11000);
  expect(reduceMeditation(paused, { type: 'end', expectedRevision: initial.revision, nowMs: 20000 })).toBe(paused);
  expect(reduceMeditation(paused, { type: 'start', expectedRevision: paused.revision, durationMinutes: 5, noticeEnabled: true, nowMs: 20000 })).toBe(paused);
  const discarded = reduceMeditation(paused, { type: 'discard', expectedRevision: paused.revision }); expect(discarded.session).toBeNull();
  expect(reduceMeditation(discarded, { type: 'resume', expectedRevision: paused.revision, nowMs: 20000 })).toBe(discarded);
});

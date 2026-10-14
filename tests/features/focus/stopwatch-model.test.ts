import { initialStopwatchState, reduceStopwatch, type StopwatchState } from '../../../src/features/focus/stopwatch-model';
function start(nowMs = 1000) { return reduceStopwatch(initialStopwatchState(), { type: 'start', nowMs, expectedRevision: 0 }); }
function timed(state: StopwatchState, type: 'start' | 'tick' | 'pause' | 'resume' | 'finish', nowMs: number) {
  return reduceStopwatch(state, { type, nowMs, expectedRevision: state.revision });
}
describe('ephemeral free stopwatch', () => {
  it('starts at zero only explicitly and calculates elapsed from the clock without tick-count drift', () => {
    expect(initialStopwatchState().session).toBeNull(); const first = start();
    expect(first.session?.elapsedMs).toBe(0);
    const sampled = timed(first, 'tick', 1800); expect(sampled.session?.elapsedMs).toBe(800);
    expect(timed(sampled, 'tick', 9001).session?.elapsedMs).toBe(8001);
    expect(timed(first, 'tick', 9001).session?.elapsedMs).toBe(8001);
    expect(first.session?.elapsedMs).toBe(0);
  });
  it('freezes pauses and accumulates resumed periods without including paused time', () => {
    const paused = timed(start(), 'pause', 2500); expect(paused.session?.elapsedMs).toBe(1500);
    expect(timed(paused, 'tick', 9000000)).toBe(paused);
    const resumed = timed(paused, 'resume', 9000000);
    expect(resumed.session?.elapsedMs).toBe(1500);
    const secondPause = timed(resumed, 'pause', 9000500); expect(secondPause.session?.elapsedMs).toBe(2000);
    expect(timed(timed(secondPause, 'resume', 9100000), 'finish', 9100100).session?.elapsedMs).toBe(2100);
  });
  it('counts long background time without a duration limit or automatic finalization', () => {
    const state = timed(start(), 'tick', 10 * 24 * 60 * 60 * 1000 + 1000);
    expect(state.session).toMatchObject({ status: 'running', elapsedMs: 864000000 });
  });
  it('allows zero and short sessions without penalty, retains the result and starts a new session in zero', () => {
    const zero = timed(start(), 'finish', 1000); expect(zero.session).toMatchObject({ status: 'finished', elapsedMs: 0 });
    const short = timed(start(), 'finish', 1001); expect(short.session?.elapsedMs).toBe(1);
    expect(timed(short, 'tick', 999999)).toBe(short); expect(timed(short, 'resume', 999999)).toBe(short);
    const next = timed(short, 'start', 999999); expect(next.session).toMatchObject({ status: 'running', elapsedMs: 0 });
    expect(short.session?.elapsedMs).toBe(1);
  });
  it('rejects stale and duplicate commands across pauses, finalization, restart and discard', () => {
    const first = start(); expect(timed(first, 'start', 2000)).toBe(first);
    const paused = timed(first, 'pause', 2000);
    expect(reduceStopwatch(paused, { type: 'finish', nowMs: 3000, expectedRevision: first.revision })).toBe(paused);
    const finished = timed(paused, 'finish', NaN); const restarted = timed(finished, 'start', 4000);
    expect(reduceStopwatch(restarted, { type: 'tick', nowMs: 9000000, expectedRevision: first.revision })).toBe(restarted);
    const discarded = reduceStopwatch(restarted, { type: 'discard', expectedRevision: restarted.revision });
    expect(discarded.session).toBeNull(); expect(reduceStopwatch(discarded, { type: 'discard', expectedRevision: restarted.revision })).toBe(discarded);
  });
  it.each([NaN, Infinity, -1, 1.5])('refuses invalid initial clocks and permits a human retry: %s', nowMs => {
    const failed = start(nowMs); expect(failed).toMatchObject({ error: 'clock', session: null });
    expect(timed(failed, 'start', 1000)).toMatchObject({ error: null, session: { elapsedMs: 0, status: 'running' } });
  });
  it('pauses preserving last confirmed elapsed on regressive clocks and permits resume or finalize', () => {
    const sampled = timed(start(), 'tick', 3000);
    const failed = timed(sampled, 'tick', 2999);
    expect(failed).toMatchObject({ error: 'clock', session: { status: 'paused', elapsedMs: 2000 } });
    expect(timed(failed, 'tick', 900000)).toBe(failed);
    const recovered = timed(failed, 'resume', 100);
    expect(timed(recovered, 'tick', 150).session?.elapsedMs).toBe(2050);
    expect(timed(failed, 'finish', NaN)).toMatchObject({ error: null, session: { status: 'finished', elapsedMs: 2000 } });
  });
  it('does not finalize from an unconfirmed invalid clock and does not erase a previous result on failed restart', () => {
    const sampled = timed(start(), 'tick', 2000); const failed = timed(sampled, 'finish', NaN);
    expect(failed.session).toMatchObject({ status: 'paused', elapsedMs: 1000 });
    const finished = timed(failed, 'finish', NaN); const retry = timed(finished, 'start', Infinity);
    expect(retry.session).toEqual(finished.session); expect(retry.error).toBe('clock');
    expect(timed(retry, 'start', 1).session?.elapsedMs).toBe(0);
  });
  it('pauses rather than publishing elapsed outside safe integer range', () => {
    const paused = timed(start(0), 'pause', Number.MAX_SAFE_INTEGER - 10);
    const resumed = timed(paused, 'resume', 100);
    const failed = timed(resumed, 'tick', 111);
    expect(failed).toMatchObject({ error: 'clock', session: { status: 'paused', elapsedMs: Number.MAX_SAFE_INTEGER - 10 } });
  });
});

export type StopwatchSession = {
  status: 'running' | 'paused' | 'finished';
  accumulatedMs: number; elapsedMs: number;
  startedAtMs: number | null; lastClockMs: number | null;
};
export type StopwatchState = { revision: number; session: StopwatchSession | null; error: 'clock' | null };
export type StopwatchAction = { expectedRevision: number } & (
  | { type: 'start' | 'tick' | 'pause' | 'resume' | 'finish'; nowMs: number }
  | { type: 'discard' }
);
export function initialStopwatchState(): StopwatchState { return { revision: 0, session: null, error: null }; }
function validClock(value: number) { return Number.isSafeInteger(value) && value >= 0; }
function changed(state: StopwatchState, session: StopwatchSession | null, error: StopwatchState['error'] = null): StopwatchState {
  if (!Number.isSafeInteger(state.revision + 1)) throw new Error('Stopwatch revision unavailable.');
  return { revision: state.revision + 1, session, error };
}
function clockError(state: StopwatchState): StopwatchState {
  const session = state.session;
  return changed(state, session ? { ...session, status: 'paused', accumulatedMs: session.elapsedMs, startedAtMs: null, lastClockMs: null } : null, 'clock');
}
function running(state: StopwatchState, elapsedMs: number, nowMs: number): StopwatchState {
  if (!validClock(nowMs)) return clockError(state);
  return changed(state, { status: 'running', accumulatedMs: elapsedMs, elapsedMs, startedAtMs: nowMs, lastClockMs: nowMs });
}
function at(state: StopwatchState, nowMs: number): StopwatchState {
  const session = state.session;
  if (!session || session.status !== 'running') return state;
  if (!validClock(nowMs) || nowMs < session.lastClockMs!) return clockError(state);
  const elapsedMs = session.accumulatedMs + (nowMs - session.startedAtMs!);
  if (!Number.isSafeInteger(elapsedMs) || elapsedMs < 0) return clockError(state);
  return { ...state, session: { ...session, elapsedMs, lastClockMs: nowMs } };
}
export function reduceStopwatch(state: StopwatchState, action: StopwatchAction): StopwatchState {
  if (action.expectedRevision !== state.revision) return state;
  if (action.type === 'discard') return state.session || state.error ? changed(state, null) : state;
  if (action.type === 'start') {
    if (state.session && state.session.status !== 'finished') return state;
    // A failed clock must not erase the final result of an earlier session.
    if (!validClock(action.nowMs)) return changed(state, state.session, 'clock');
    return running(state, 0, action.nowMs);
  }
  const session = state.session;
  if (!session) return state;
  if (action.type === 'tick') return at(state, action.nowMs);
  if (action.type === 'resume') return session.status === 'paused' ? running(state, session.elapsedMs, action.nowMs) : state;
  if (action.type === 'pause') {
    if (session.status !== 'running') return state;
    const current = at(state, action.nowMs);
    if (current.session?.status !== 'running') return current;
    return changed(current, { ...current.session, status: 'paused', accumulatedMs: current.session.elapsedMs, startedAtMs: null, lastClockMs: null });
  }
  if (action.type === 'finish') {
    if (session.status === 'finished') return state;
    const current = at(state, action.nowMs);
    if (current.error && session.status === 'running') return current;
    return changed(current, { ...current.session!, status: 'finished', accumulatedMs: current.session!.elapsedMs, startedAtMs: null, lastClockMs: null });
  }
  return state;
}

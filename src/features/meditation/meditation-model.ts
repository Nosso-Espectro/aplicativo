export const meditationPresets = [5, 10, 20, 30] as const;
export function validMeditationDuration(value: number) { return Number.isInteger(value) && value >= 1 && value <= 180; }
export type MeditationSession = {
  status: 'running' | 'paused' | 'completed' | 'ended'; generation: number; durationMinutes: number; noticeEnabled: boolean;
  remainingMs: number; baselineRemainingMs: number; startedAtMs: number | null; lastClockMs: number | null;
};
export type MeditationState = { revision: number; session: MeditationSession | null; error: 'clock' | 'configuration' | null };
export type MeditationAction = { expectedRevision: number } & (
  | { type: 'start'; durationMinutes: number; noticeEnabled: boolean; nowMs: number }
  | { type: 'tick' | 'pause' | 'resume' | 'end'; nowMs: number }
  | { type: 'discard' }
);
export function initialMeditationState(): MeditationState { return { revision: 0, session: null, error: null }; }
function validClock(value: number) { return Number.isSafeInteger(value) && value >= 0 && Number.isFinite(new Date(value).getTime()); }
function change(state: MeditationState, session: MeditationSession | null, error: MeditationState['error'] = null): MeditationState {
  if (!Number.isSafeInteger(state.revision + 1)) throw new Error('Meditation revision unavailable.');
  return { revision: state.revision + 1, session, error };
}
function clockError(state: MeditationState) {
  const session = state.session;
  return change(state, session ? { ...session, status: 'paused', baselineRemainingMs: session.remainingMs, startedAtMs: null, lastClockMs: null } : null, 'clock');
}
function run(state: MeditationState, session: MeditationSession, nowMs: number) {
  if (!validClock(nowMs) || !validClock(nowMs + session.remainingMs)) return clockError({ ...state, session });
  return change(state, { ...session, status: 'running', baselineRemainingMs: session.remainingMs, startedAtMs: nowMs, lastClockMs: nowMs });
}
function at(state: MeditationState, nowMs: number): MeditationState {
  const session = state.session;
  if (!session || session.status !== 'running') return state;
  if (!validClock(nowMs) || nowMs < session.lastClockMs!) return clockError(state);
  const remainingMs = Math.max(0, session.baselineRemainingMs - (nowMs - session.startedAtMs!));
  if (!Number.isSafeInteger(remainingMs)) return clockError(state);
  if (remainingMs === 0) return change(state, { ...session, status: 'completed', remainingMs: 0, baselineRemainingMs: 0, startedAtMs: null, lastClockMs: null });
  return nowMs === session.lastClockMs ? state : { ...state, session: { ...session, remainingMs, lastClockMs: nowMs } };
}
export function reduceMeditation(state: MeditationState, action: MeditationAction): MeditationState {
  if (action.expectedRevision !== state.revision) return state;
  if (action.type === 'discard') return state.session || state.error ? change(state, null) : state;
  if (action.type === 'start') {
    if (state.session && ['running', 'paused'].includes(state.session.status)) return state;
    if (!validMeditationDuration(action.durationMinutes) || typeof action.noticeEnabled !== 'boolean') return change(state, state.session, 'configuration');
    const remainingMs = action.durationMinutes * 60000;
    // A failed restart must keep the previous temporary result intact.
    if (!validClock(action.nowMs) || !validClock(action.nowMs + remainingMs)) return change(state, state.session, 'clock');
    return run(state, { status: 'running', generation: state.revision + 1, durationMinutes: action.durationMinutes, noticeEnabled: action.noticeEnabled,
      remainingMs, baselineRemainingMs: remainingMs, startedAtMs: null, lastClockMs: null }, action.nowMs);
  }
  const session = state.session;
  if (!session) return state;
  if (action.type === 'tick') return at(state, action.nowMs);
  if (action.type === 'resume') return session.status === 'paused' ? run(state, session, action.nowMs) : state;
  if (!['running', 'paused'].includes(session.status)) return state;
  if (action.type === 'pause' && session.status !== 'running') return state;
  const current = at(state, action.nowMs);
  if ((current.error && session.status === 'running') || current.session?.status === 'completed') return current;
  return change(current, { ...current.session!, status: action.type === 'pause' ? 'paused' : 'ended',
    baselineRemainingMs: current.session!.remainingMs, startedAtMs: null, lastClockMs: null });
}

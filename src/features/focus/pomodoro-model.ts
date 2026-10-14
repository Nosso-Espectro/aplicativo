export const pomodoroPresets = [
  { id: '25-5', focusMs: 25 * 60_000, breakMs: 5 * 60_000 },
  { id: '50-10', focusMs: 50 * 60_000, breakMs: 10 * 60_000 },
] as const;
export type PomodoroPresetId = typeof pomodoroPresets[number]['id'];
export type PomodoroSession = {
  presetId: PomodoroPresetId; phase: 'focus' | 'break';
  status: 'running' | 'paused' | 'waiting';
  remainingMs: number; deadlineMs: number | null; lastClockMs: number | null;
};
export type PomodoroState = { revision: number; session: PomodoroSession | null; error: 'clock' | null };
export type PomodoroAction = { expectedRevision: number } & (
  | { type: 'start'; presetId: PomodoroPresetId; nowMs: number }
  | { type: 'tick' | 'pause' | 'resume' | 'next'; nowMs: number }
  | { type: 'end' }
);
export function initialPomodoroState(): PomodoroState { return { revision: 0, session: null, error: null }; }
function validClock(value: number) { return Number.isSafeInteger(value) && value >= 0; }
function duration(presetId: PomodoroPresetId, phase: PomodoroSession['phase']) {
  const preset = pomodoroPresets.find(item => item.id === presetId);
  if (!preset) throw new Error('Invalid Pomodoro preset.');
  return phase === 'focus' ? preset.focusMs : preset.breakMs;
}
function changed(state: PomodoroState, session: PomodoroSession | null, error: PomodoroState['error'] = null): PomodoroState {
  if (!Number.isSafeInteger(state.revision + 1)) throw new Error('Pomodoro revision unavailable.');
  return { revision: state.revision + 1, session, error };
}
function clockError(state: PomodoroState): PomodoroState {
  return changed(state, state.session ? { ...state.session, status: state.session.status === 'waiting' ? 'waiting' : 'paused', deadlineMs: null, lastClockMs: null } : null, 'clock');
}
function running(state: PomodoroState, presetId: PomodoroPresetId, phase: PomodoroSession['phase'], remainingMs: number, nowMs: number) {
  if (!validClock(nowMs) || !Number.isSafeInteger(nowMs + remainingMs)) return clockError(state);
  return changed(state, { presetId, phase, status: 'running', remainingMs, deadlineMs: nowMs + remainingMs, lastClockMs: nowMs });
}
function at(state: PomodoroState, nowMs: number): PomodoroState {
  const session = state.session;
  if (!session || session.status !== 'running') return state;
  if (!validClock(nowMs) || nowMs < session.lastClockMs!) return clockError(state);
  const remainingMs = Math.max(0, session.deadlineMs! - nowMs);
  // Expiry stops at this phase; elapsed background time never starts another one.
  if (!remainingMs) return changed(state, { ...session, status: 'waiting', remainingMs: 0, deadlineMs: null, lastClockMs: nowMs });
  return { ...state, session: { ...session, remainingMs, lastClockMs: nowMs } };
}
export function reducePomodoro(state: PomodoroState, action: PomodoroAction): PomodoroState {
  if (action.expectedRevision !== state.revision) return state;
  if (action.type === 'end') return state.session || state.error ? changed(state, null) : state;
  if (action.type === 'start') {
    if (state.session) return state;
    return running(state, action.presetId, 'focus', duration(action.presetId, 'focus'), action.nowMs);
  }
  const session = state.session;
  if (!session) return state;
  if (action.type === 'tick') return at(state, action.nowMs);
  if (action.type === 'pause') {
    if (session.status !== 'running') return state;
    const current = at(state, action.nowMs);
    if (current.session?.status !== 'running') return current;
    return changed(current, { ...current.session, status: 'paused', deadlineMs: null });
  }
  if (action.type === 'resume') {
    if (session.status !== 'paused' || session.remainingMs <= 0) return state;
    return running(state, session.presetId, session.phase, session.remainingMs, action.nowMs);
  }
  if (action.type === 'next' && session.status === 'waiting') {
    const phase = session.phase === 'focus' ? 'break' : 'focus';
    return running(state, session.presetId, phase, duration(session.presetId, phase), action.nowMs);
  }
  return state;
}

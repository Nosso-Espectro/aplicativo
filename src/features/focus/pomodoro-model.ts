export const pomodoroPresets = [
  { id: '25-5', focusMs: 25 * 60_000, breakMs: 5 * 60_000 },
  { id: '50-10', focusMs: 50 * 60_000, breakMs: 10 * 60_000 },
] as const;
export type PomodoroPresetId = typeof pomodoroPresets[number]['id'];
export type PomodoroChoiceId = PomodoroPresetId | 'custom';
export type PomodoroCustomTimes = { focusMinutes: number; breakMinutes: number };
export function validPomodoroCustomTimes(value: PomodoroCustomTimes): boolean {
  return [value.focusMinutes, value.breakMinutes].every(minutes => Number.isInteger(minutes) && minutes >= 1 && minutes <= 180);
}
export type PomodoroSession = {
  presetId: PomodoroChoiceId; focusMs: number; breakMs: number; phase: 'focus' | 'break';
  status: 'running' | 'paused' | 'waiting';
  remainingMs: number; deadlineMs: number | null; lastClockMs: number | null;
};
export type PomodoroState = { revision: number; session: PomodoroSession | null; error: 'clock' | null };
export type PomodoroAction = { expectedRevision: number } & (
  | { type: 'start'; presetId: PomodoroChoiceId; customTimes?: PomodoroCustomTimes; nowMs: number }
  | { type: 'tick' | 'pause' | 'resume' | 'next'; nowMs: number }
  | { type: 'end' }
);
export function initialPomodoroState(): PomodoroState { return { revision: 0, session: null, error: null }; }
function validClock(value: number) { return Number.isSafeInteger(value) && value >= 0; }
function selectedTimes(action: Extract<PomodoroAction, { type: 'start' }>) {
  if (action.presetId === 'custom') {
    const value = action.customTimes ? { ...action.customTimes } : null;
    if (!value || !validPomodoroCustomTimes(value)) return null;
    return { focusMs: value.focusMinutes * 60_000, breakMs: value.breakMinutes * 60_000 };
  }
  const preset = pomodoroPresets.find(item => item.id === action.presetId);
  return preset ? { focusMs: preset.focusMs, breakMs: preset.breakMs } : null;
}
function changed(state: PomodoroState, session: PomodoroSession | null, error: PomodoroState['error'] = null): PomodoroState {
  if (!Number.isSafeInteger(state.revision + 1)) throw new Error('Pomodoro revision unavailable.');
  return { revision: state.revision + 1, session, error };
}
function clockError(state: PomodoroState): PomodoroState {
  return changed(state, state.session ? { ...state.session, status: state.session.status === 'waiting' ? 'waiting' : 'paused', deadlineMs: null, lastClockMs: null } : null, 'clock');
}
function running(state: PomodoroState, selection: Pick<PomodoroSession, 'presetId' | 'focusMs' | 'breakMs'>, phase: PomodoroSession['phase'], remainingMs: number, nowMs: number) {
  if (!validClock(nowMs) || !Number.isSafeInteger(nowMs + remainingMs)) return clockError(state);
  return changed(state, { ...selection, phase, status: 'running', remainingMs, deadlineMs: nowMs + remainingMs, lastClockMs: nowMs });
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
    const times = selectedTimes(action);
    if (!times) return state;
    return running(state, { presetId: action.presetId, ...times }, 'focus', times.focusMs, action.nowMs);
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
    return running(state, session, session.phase, session.remainingMs, action.nowMs);
  }
  if (action.type === 'next' && session.status === 'waiting') {
    const phase = session.phase === 'focus' ? 'break' : 'focus';
    return running(state, session, phase, phase === 'focus' ? session.focusMs : session.breakMs, action.nowMs);
  }
  return state;
}

export const soundTimerPresets = [5, 15, 30, 60] as const;
export type SoundTimer = {
  revision: number;
  status: 'idle' | 'armed' | 'stopping' | 'finished' | 'error';
  deadlineMs: number | null;
  lastClockMs: number | null;
  remainingMs: number;
  error: 'clock' | 'stop' | null;
};
export type SoundTimerAction = { expectedRevision: number } & (
  | { type: 'arm'; minutes: number; nowMs: number }
  | { type: 'tick'; nowMs: number }
  | { type: 'cancel' | 'finished' | 'failed' }
);
export function initialSoundTimer(): SoundTimer {
  return { revision: 0, status: 'idle', deadlineMs: null, lastClockMs: null, remainingMs: 0, error: null };
}
export function validSoundTimerMinutes(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 180;
}
function validClock(value: number) { return Number.isSafeInteger(value) && value >= 0; }
function changed(state: SoundTimer, patch: Partial<SoundTimer>): SoundTimer {
  if (!Number.isSafeInteger(state.revision + 1)) throw new Error('Sound timer revision unavailable.');
  return { ...state, ...patch, revision: state.revision + 1 };
}
function clockError(state: SoundTimer): SoundTimer {
  return changed(state, { status: 'error', deadlineMs: null, lastClockMs: null, error: 'clock' });
}
export function reduceSoundTimer(state: SoundTimer, action: SoundTimerAction): SoundTimer {
  if (state.revision !== action.expectedRevision) return state;
  if (action.type === 'cancel') return { ...initialSoundTimer(), revision: changed(state, {}).revision };
  if (action.type === 'arm') {
    if (!validSoundTimerMinutes(action.minutes) || state.status === 'stopping') return state;
    const duration = action.minutes * 60000;
    const deadlineMs = action.nowMs + duration;
    if (!validClock(action.nowMs) || !validClock(deadlineMs)) return clockError(state);
    return changed(state, { status: 'armed', deadlineMs, lastClockMs: action.nowMs, remainingMs: duration, error: null });
  }
  if (action.type === 'failed') return changed(state, { status: 'error', deadlineMs: null, lastClockMs: null, error: state.error ?? 'stop' });
  if (action.type === 'finished') return state.status === 'stopping'
    ? changed(state, { status: 'finished', remainingMs: 0, deadlineMs: null, lastClockMs: null, error: null }) : state;
  if (action.type !== 'tick' || state.status !== 'armed') return state;
  if (!validClock(action.nowMs) || action.nowMs < state.lastClockMs!) return clockError(state);
  const remainingMs = Math.max(0, state.deadlineMs! - action.nowMs);
  if (remainingMs === 0) return changed(state, { status: 'stopping', remainingMs: 0, deadlineMs: null, lastClockMs: action.nowMs });
  return { ...state, remainingMs, lastClockMs: action.nowMs };
}

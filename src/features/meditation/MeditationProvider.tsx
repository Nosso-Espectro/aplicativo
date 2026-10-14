import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { initialMeditationState, reduceMeditation, type MeditationAction, type MeditationState } from './meditation-model';
type Command = { expectedRevision: number } & (
  | { type: 'start'; durationMinutes: number; noticeEnabled: boolean }
  | { type: 'pause' | 'resume' | 'end' }
  | { type: 'discard' }
);
type Value = MeditationState & { ready: boolean; act(command: Command): boolean; discard(): void };
const Context = createContext<Value | null>(null);
const readClock = () => Date.now();
export function MeditationProvider({ children, clock = readClock }: { children: ReactNode; clock?: () => number }) {
  const [state, setState] = useState(initialMeditationState); const current = useRef(state);
  const owner = useRef<object | null>(null); const [attached, setAttached] = useState<object | null>(null);
  const [foreground, setForeground] = useState(() => AppState.currentState === 'active'); const foregroundRef = useRef(foreground);
  const now = useCallback(() => { try { return clock(); } catch { return NaN; } }, [clock]);
  const apply = useCallback((action: MeditationAction, token: object | null) => {
    if (!token || owner.current !== token) return false;
    const next = reduceMeditation(current.current, action); if (next === current.current) return false;
    current.current = next; setState(next); return true;
  }, []);
  useEffect(() => {
    const token = {}; owner.current = token;
    // Publish only the live subscription owner after StrictMode's initial cleanup.
    void Promise.resolve().then(() => { if (owner.current === token) setAttached(token); });
    const subscription = AppState.addEventListener('change', status => {
      if (owner.current !== token) return;
      const active = status === 'active'; foregroundRef.current = active; setForeground(active);
      if (active) apply({ type: 'tick', expectedRevision: current.current.revision, nowMs: now() }, token);
    });
    return () => { if (owner.current === token) owner.current = null; subscription.remove(); };
  }, [apply, now]);
  useEffect(() => {
    if (!foreground || state.session?.status !== 'running' || !attached) return;
    const expectedRevision = state.revision;
    const interval = setInterval(() => {
      if (foregroundRef.current) apply({ type: 'tick', expectedRevision, nowMs: now() }, attached);
    }, 1000);
    return () => clearInterval(interval);
  }, [apply, now, attached, foreground, state.revision, state.session?.status]);
  const discard = useCallback(() => { apply({ type: 'discard', expectedRevision: current.current.revision }, attached); }, [apply, attached]);
  return <Context.Provider value={{ ...state, ready: attached !== null, discard,
    act: command => apply(command.type === 'discard' ? command : { ...command, nowMs: now() }, attached),
  }}>{children}</Context.Provider>;
}
export function useMeditation() {
  const value = useContext(Context); if (!value) throw new Error('MeditationProvider required.'); return value;
}

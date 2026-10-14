import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { initialPomodoroState, reducePomodoro, type PomodoroAction, type PomodoroState } from './pomodoro-model';
const readClock = () => Date.now();
type Command = Omit<Extract<PomodoroAction, { type: 'start' }>, 'nowMs'>
  | { type: 'pause' | 'resume' | 'next'; expectedRevision: number }
  | { type: 'end'; expectedRevision: number };
type Value = PomodoroState & { act(command: Command): boolean; discard(): void; isInactive(expectedRevision: number): boolean };
const Context = createContext<Value | null>(null);
export function PomodoroProvider({ children, clock = readClock }: { children: ReactNode; clock?: () => number }) {
  const [state, setState] = useState(initialPomodoroState);
  const current = useRef(state); const owner = useRef<object | null>(null);
  const [foreground, setForeground] = useState(() => AppState.currentState === 'active');
  const foregroundRef = useRef(foreground);
  const now = useCallback(() => { try { return clock(); } catch { return NaN; } }, [clock]);
  const apply = useCallback((action: PomodoroAction) => {
    if (!owner.current) return false;
    const next = reducePomodoro(current.current, action);
    if (next === current.current) return false;
    current.current = next; setState(next); return true;
  }, []);
  useEffect(() => {
    const token = {}; owner.current = token;
    const subscription = AppState.addEventListener('change', status => {
      if (owner.current !== token) return;
      const active = status === 'active'; foregroundRef.current = active; setForeground(active);
      if (active) apply({ type: 'tick', nowMs: now(), expectedRevision: current.current.revision });
    });
    return () => { if (owner.current === token) owner.current = null; subscription.remove(); };
  }, [apply, now]);
  useEffect(() => {
    if (!foreground || state.session?.status !== 'running') return;
    const token = owner.current; const expectedRevision = state.revision;
    const interval = setInterval(() => {
      if (owner.current === token && foregroundRef.current) apply({ type: 'tick', expectedRevision, nowMs: now() });
    }, 1000);
    return () => clearInterval(interval);
  }, [apply, now, foreground, state.revision, state.session?.status]);
  const discard = useCallback(() => { apply({ type: 'end', expectedRevision: current.current.revision }); }, [apply]);
  return <Context.Provider value={{ ...state, discard,
    isInactive: expectedRevision => Boolean(owner.current && current.current.revision === expectedRevision && !current.current.session),
    act: command => apply(command.type === 'end' ? command : { ...command, nowMs: now() }),
  }}>{children}</Context.Provider>;
}
export function usePomodoro() {
  const value = useContext(Context); if (!value) throw new Error('PomodoroProvider required.'); return value;
}

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { initialStopwatchState, reduceStopwatch, type StopwatchAction, type StopwatchState } from './stopwatch-model';
const readClock = () => Date.now();
type Command = { expectedRevision: number } & ({ type: 'start' | 'pause' | 'resume' | 'finish' } | { type: 'discard' });
type Value = StopwatchState & { act(command: Command): boolean; discard(): void };
const Context = createContext<Value | null>(null);
export function StopwatchProvider({ children, clock = readClock }: { children: ReactNode; clock?: () => number }) {
  const [state, setState] = useState(initialStopwatchState);
  const current = useRef(state); const owner = useRef<object | null>(null);
  const [foreground, setForeground] = useState(() => AppState.currentState === 'active');
  const foregroundRef = useRef(foreground);
  const now = useCallback(() => { try { return clock(); } catch { return NaN; } }, [clock]);
  const apply = useCallback((action: StopwatchAction) => {
    if (!owner.current) return false;
    const next = reduceStopwatch(current.current, action);
    if (next === current.current) return false;
    current.current = next; setState(next); return true;
  }, []);
  useEffect(() => {
    const token = {}; owner.current = token;
    const subscription = AppState.addEventListener('change', status => {
      if (owner.current !== token) return;
      const active = status === 'active'; foregroundRef.current = active; setForeground(active);
      if (active) apply({ type: 'tick', expectedRevision: current.current.revision, nowMs: now() });
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
  const discard = useCallback(() => { apply({ type: 'discard', expectedRevision: current.current.revision }); }, [apply]);
  return <Context.Provider value={{ ...state, discard,
    act: command => apply(command.type === 'discard' ? command : { ...command, nowMs: now() }),
  }}>{children}</Context.Provider>;
}
export function useStopwatch() {
  const value = useContext(Context); if (!value) throw new Error('StopwatchProvider required.'); return value;
}

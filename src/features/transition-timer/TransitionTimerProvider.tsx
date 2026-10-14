import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { openTimerDatabase, type TimerAction, type VersionedTimerSession } from './timer-database';
import { timerVisual, type TimerSession } from './visual-timer';

type ContextValue = {
  session: TimerSession | null; sessionNumber: number | null; visual: ReturnType<typeof timerVisual>;
  loading: boolean; busy: boolean; error: 'read' | 'write' | null;
  act(action: TimerAction, expected?: TimerSession | null, expectedSessionNumber?: number | null): Promise<void>; retryRead(): void;
};
const Context = createContext<ContextValue | null>(null);
export function TransitionTimerProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<TimerSession | null>(null);
  const [sessionNumber, setSessionNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ContextValue['error']>(null);
  const [attempt, setAttempt] = useState(0);
  const [nowMs, setNowMs] = useState(Date.now);
  const [foreground, setForeground] = useState(() => AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  const storage = useRef<Awaited<ReturnType<typeof openTimerDatabase>> | null>(null);
  const initialization = useRef<Promise<VersionedTimerSession> | null>(null);
  const reading = useRef(true); const ready = useRef(false); const inFlight = useRef(false);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        initialization.current ??= (async () => { storage.current ??= await openTimerDatabase(); return storage.current.readVersioned(); })();
        const saved = await initialization.current;
        if (active) { setSession(saved.session); setSessionNumber(saved.sessionNumber); setNowMs(Date.now()); ready.current = true; setError(null); }
      } catch { if (active) { ready.current = false; setError('read'); } }
      finally { if (active) { reading.current = false; setLoading(false); } }
    })();
    return () => { active = false; };
  }, [attempt]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setForeground(state === 'active');
      if (state === 'active') setNowMs(Date.now());
    });
    return () => subscription.remove();
  }, []);
  const running = session?.phase === 'running' && nowMs < session.deadlineMs!;
  useEffect(() => {
    if (!foreground || !running) return;
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [foreground, running]);
  async function act(action: TimerAction, expected = session, expectedSessionNumber = sessionNumber) {
    if (!ready.current || reading.current || inFlight.current || !storage.current) return;
    inFlight.current = true; setBusy(true); setError(null);
    try {
      const saved = await storage.current.actVersioned(action, Date.now(), { session: expected, sessionNumber: expectedSessionNumber });
      setSession(saved.session); setSessionNumber(saved.sessionNumber); setNowMs(Date.now());
    }
    catch { setError('write'); }
    finally { inFlight.current = false; setBusy(false); }
  }
  return <Context.Provider value={{ session, sessionNumber, visual: timerVisual(session, nowMs), loading, busy, error, act,
    retryRead: () => {
      if (reading.current || inFlight.current) return;
      reading.current = true; ready.current = false; initialization.current = null;
      setLoading(true); setError(null); setAttempt((value) => value + 1);
    },
  }}>{children}</Context.Provider>;
}
export function useTransitionTimer() {
  const context = useContext(Context);
  if (!context) throw new Error('TransitionTimerProvider is required.');
  return context;
}

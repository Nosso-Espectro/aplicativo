import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { useTransitionTimer } from './TransitionTimerProvider';
import { openProgressAlertDatabase, type ProgressAlertSnapshot } from './progress-alert-database';
import { createProgressAlertCoordinator } from './progress-alert-coordinator';
import { createExpoProgressAlertEngine } from './expo-progress-alert-engine';
import { crossedVisualProgressMark, type ProgressVisualSample } from './progress-visual-crossing';
import type { ProgressAlertPreferences, ProgressMark } from './progress-alerts';

type Coordinator = ReturnType<typeof createProgressAlertCoordinator>;
type Runtime = { active: boolean; coordinator: Coordinator | null; running: boolean; reconcileRequested: boolean;
  previous: ProgressVisualSample | null; initialize?(): void };
type ContextValue = {
  snapshot: ProgressAlertSnapshot | null; loading: boolean; busy: boolean; error: boolean; visualMark: ProgressMark | null;
  save(preferences: ProgressAlertPreferences, systemConfirmed?: boolean): Promise<boolean>;
  requestSystemPermission(): Promise<boolean>; retry(): void; clearVisual(): void;
};
const Context = createContext<ContextValue | null>(null);

export function ProgressAlertsProvider({ children }: { children: ReactNode }) {
  const timer = useTransitionTimer();
  const [snapshot, setSnapshot] = useState<ProgressAlertSnapshot | null>(null);
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState<{ minutes: ProgressMark; sessionNumber: number | null; deadlineMs: number | null } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const runtime = useRef<Runtime | null>(null);
  const storageInitialization = useRef<ReturnType<typeof openProgressAlertDatabase> | null>(null);
  const foreground = useRef(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  const currentTimer = useRef(timer);
  useEffect(() => { currentTimer.current = timer; }, [timer]);

  async function run<T>(owner: Runtime, operation: (coordinator: Coordinator) => Promise<T>): Promise<{ value: T } | null> {
    if (!owner.active || owner.running || !owner.coordinator) return null;
    owner.running = true; setBusy(true);
    try {
      const value = await operation(owner.coordinator);
      if (!owner.active) return null;
      setSnapshot(owner.coordinator.getSnapshot()); setError(false); return { value };
    } catch {
      if (owner.active) { setSnapshot(owner.coordinator.getSnapshot()); setError(true); }
      return null;
    } finally {
      owner.running = false;
      if (owner.active) {
        setBusy(false);
        if (owner.reconcileRequested) {
          owner.reconcileRequested = false; void run(owner, coordinator => coordinator.reconcile());
        }
      }
    }
  }
  function sync(owner: Runtime) {
    owner.previous = null;
    if (owner.running) owner.reconcileRequested = true;
    else void run(owner, coordinator => coordinator.reconcile());
  }
  useEffect(() => {
    const owner: Runtime = { active: true, coordinator: null, running: false, reconcileRequested: false, previous: null };
    runtime.current = owner;
    let started = false;
    async function initialize() {
      try {
        storageInitialization.current ??= openProgressAlertDatabase();
        const storage = await storageInitialization.current; if (!owner.active) return;
        owner.coordinator = createProgressAlertCoordinator(storage, createExpoProgressAlertEngine, Date.now, {
          changed: saved => { if (owner.active) { setSnapshot(saved); owner.previous = null; } },
          failed: () => { if (owner.active) setError(true); },
          consumed: (saved, minutes, receivedAtMs) => {
            const nowMs = Date.now();
            if (!owner.active || !foreground.current || nowMs < receivedAtMs || nowMs - receivedAtMs > 1000
              || currentTimer.current.sessionNumber !== saved.sessionNumber || currentTimer.current.session?.phase !== 'running'
              || currentTimer.current.session?.deadlineMs !== saved.session?.deadlineMs) return;
            // Reconstruct the pre-consumption view only to assess this already-committed event.
            const next: ProgressVisualSample = { snapshot: { ...saved, delivered: saved.delivered.filter(mark => mark !== minutes) },
              nowMs, monotonicMs: performance.now(), foreground: true };
            if (crossedVisualProgressMark(owner.previous, next) === minutes) {
              setNotice({ minutes, sessionNumber: saved.sessionNumber, deadlineMs: saved.session?.deadlineMs ?? null });
            }
          },
        });
        const saved = await owner.coordinator.read(); if (!owner.active) return;
        setSnapshot(saved); setLoading(false); sync(owner);
      } catch { if (owner.active) { setLoading(false); setBusy(false); setError(true); } }
    }
    owner.initialize = () => {
      if (started || !owner.active) return;
      started = true; void initialize();
    };
    if (!currentTimer.current.loading) owner.initialize();
    const subscription = AppState.addEventListener('change', state => {
      foreground.current = state === 'active'; owner.previous = null;
      if (owner.active) { setNotice(null); if (state === 'active' && owner.coordinator) sync(owner); }
    });
    return () => {
      owner.active = false; owner.previous = null; subscription.remove();
      try { owner.coordinator?.dispose(); } catch {}
      if (runtime.current === owner) runtime.current = null;
    };
    // Lifecycle owns one coordinator; retries intentionally create a new owner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);
  useEffect(() => {
    const owner = runtime.current;
    if (owner && !timer.loading) {
      if (owner.coordinator) sync(owner); else owner.initialize?.();
    }
    // Timer commands remain independent of the notification queue.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.session, timer.sessionNumber, timer.loading, timer.visual?.phase]);
  useEffect(() => {
    const interval = setInterval(() => {
      const owner = runtime.current; const controller = owner?.coordinator;
      if (!owner?.active || !controller || !foreground.current) return;
      const saved = controller.getSnapshot(); const latestTimer = currentTimer.current;
      if (!saved || latestTimer.loading || latestTimer.error === 'read' || saved.sessionNumber !== latestTimer.sessionNumber
        || saved.session?.deadlineMs !== latestTimer.session?.deadlineMs) { owner.previous = null; return; }
      const next: ProgressVisualSample = { snapshot: saved, nowMs: Date.now(), monotonicMs: performance.now(), foreground: true };
      const previous = owner.previous; owner.previous = next;
      if (owner.running || crossedVisualProgressMark(previous, next) === null) return;
      void run(owner, coordinator => coordinator.sampleVisual(previous, next, () => foreground.current)).then(result => {
        if (!result || !owner.active || !foreground.current || currentTimer.current.sessionNumber !== next.snapshot.sessionNumber) return;
        setNotice(result.value.minutes === null ? null : { minutes: result.value.minutes,
          sessionNumber: next.snapshot.sessionNumber, deadlineMs: next.snapshot.session?.deadlineMs ?? null });
        sync(owner);
      });
    }, 1000);
    return () => clearInterval(interval);
    // Reads current state through refs, without recreating the interval for each tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <Context.Provider value={{ snapshot, loading: loading || timer.loading, busy, error,
    visualMark: !timer.loading && timer.error !== 'read' && timer.visual?.phase === 'running' && notice?.sessionNumber === timer.sessionNumber
      && notice.deadlineMs === timer.session?.deadlineMs ? notice.minutes : null,
    save: async (preferences, systemConfirmed = false) => {
      const owner = runtime.current; const saved = owner?.coordinator?.getSnapshot();
      if (!owner || !saved) return false;
      owner.previous = null; setNotice(null);
      return !!await run(owner, coordinator => coordinator.save(preferences, saved.revision, systemConfirmed));
    },
    requestSystemPermission: async () => {
      const owner = runtime.current; if (!owner) return false;
      const result = await run(owner, coordinator => coordinator.requestSystemPermission());
      if (result && !result.value) setError(true);
      return result?.value === true;
    },
    retry: () => {
      const owner = runtime.current; if (owner?.running) return;
      if (owner?.coordinator) sync(owner);
      else { storageInitialization.current = null; setLoading(true); setError(false); setNotice(null); setAttempt(value => value + 1); }
    },
    clearVisual: () => setNotice(null),
  }}>{children}</Context.Provider>;
}
export function useProgressAlerts() { return useContext(Context); }

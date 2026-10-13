import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo } from 'react-native';
import { openDisplayPreferencesDatabase } from './display-preferences-database';
import { defaultLowStimulationPreference, lowStimulationPresentation, type LowStimulationPreference } from './low-stimulation';

type ContextValue = {
  preference: LowStimulationPreference | null;
  loading: boolean; saving: boolean; error: 'read' | 'save' | null;
  presentation: ReturnType<typeof lowStimulationPresentation>;
  setEnabled(enabled: boolean): Promise<void>; retry(): void;
};
const Context = createContext<ContextValue | null>(null);

export function LowStimulationProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<LowStimulationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<ContextValue['error']>(null);
  const [attempt, setAttempt] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(true);
  const storage = useRef<Awaited<ReturnType<typeof openDisplayPreferencesDatabase>> | null>(null);
  const initialization = useRef<Promise<LowStimulationPreference> | null>(null);
  const request = useRef(false);
  const failedChoice = useRef<boolean | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        initialization.current ??= (async () => {
          storage.current ??= await openDisplayPreferencesDatabase();
          return storage.current.read();
        })();
        const saved = await initialization.current;
        if (active) { setPreference(saved); setError(null); }
      } catch { if (active) setError('read'); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [attempt]);

  useEffect(() => {
    let active = true; let changed = false;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      changed = true;
      if (active) setReduceMotion(enabled);
    });
    // A newer system event must not be overwritten by a slow initial query.
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active && !changed) setReduceMotion(enabled);
    }).catch(() => undefined);
    return () => { active = false; subscription.remove(); };
  }, []);

  async function setEnabled(enabled: boolean) {
    if (request.current || loading || !preference || error === 'read' || !storage.current) return;
    request.current = true; setSaving(true); setError(null);
    try {
      const saved = await storage.current.save({ enabled });
      setPreference(saved); failedChoice.current = null;
    } catch { failedChoice.current = enabled; setError('save'); }
    finally { request.current = false; setSaving(false); }
  }
  return <Context.Provider value={{ preference, loading, saving, error,
    presentation: lowStimulationPresentation(preference ?? { enabled: true }, reduceMotion), setEnabled,
    retry: () => {
      if (loading || saving || request.current) return;
      if (error === 'save' && failedChoice.current !== null) { void setEnabled(failedChoice.current); return; }
      if (error === 'read') { initialization.current = null; setLoading(true); setError(null); setAttempt((value) => value + 1); }
    },
  }}>{children}</Context.Provider>;
}

export function useLowStimulation() {
  const context = useContext(Context);
  if (!context) throw new Error('LowStimulationProvider is required.');
  return context;
}

export function useLowStimulationPresentation() {
  return useContext(Context)?.presentation ?? lowStimulationPresentation(defaultLowStimulationPreference);
}

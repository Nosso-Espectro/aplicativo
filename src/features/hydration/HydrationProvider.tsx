import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { createHydrationController, type HydrationController, type HydrationState } from './hydration-controller';
import { openHydrationDatabase } from './hydration-database';

type Value = HydrationState & { controller: HydrationController | null };
const Context = createContext<Value | null>(null);
const initial: HydrationState = { config: null, loading: true, busy: false, confirmed: false, error: null, banner: false };
export function HydrationProvider({ children, create }: {
  children: ReactNode; create?: () => HydrationController;
}) {
  const [value, setValue] = useState<Value>({ ...initial, controller: null });
  const storage = useRef<ReturnType<typeof openHydrationDatabase> | null>(null);
  useEffect(() => {
    const controller = create ? create() : createHydrationController({ database: () => {
      // StrictMode owners share initialization, but commands keep distinct lifecycle tokens.
      storage.current ??= openHydrationDatabase().catch(error => { storage.current = null; throw error; });
      return storage.current;
    } });
    let active = true; let reconcile = false;
    const sync = () => {
      if (!active) return;
      const state = controller.getSnapshot(); setValue({ ...state, controller });
      if (reconcile && !state.busy) {
        reconcile = false;
        // Finish the current command before reconciling a foreground transition.
        void Promise.resolve().then(() => { if (active) void controller.reload(); });
      }
    };
    controller.foreground(AppState.currentState === 'active');
    const unsubscribe = controller.subscribe(sync); sync(); void controller.reload();
    const subscription = AppState.addEventListener('change', state => {
      if (!active) return;
      controller.foreground(state === 'active');
      if (state === 'active') {
        if (controller.getSnapshot().busy) reconcile = true;
        else void controller.reload();
      }
    });
    return () => { active = false; subscription.remove(); unsubscribe(); controller.dispose(); };
  }, [create]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useHydration() {
  const value = useContext(Context); if (!value) throw new Error('HydrationProvider required.'); return value;
}

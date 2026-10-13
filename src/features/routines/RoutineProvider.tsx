import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { openRoutineDatabase } from './routine-database';
import { createRoutineStorage } from './routine-storage';
import type { Routine, RoutineDraft } from './routine-model';
import { routineExecution, type ProgressAction } from './routine-execution';

type ContextValue = { routines: Routine[]; loading: boolean; error: string | null; retry(): void; save(draft: RoutineDraft, id?: string): Promise<void>; progress(id: string, action: ProgressAction): Promise<void> };
const Context = createContext<ContextValue | null>(null);
export function RoutineProvider({ children }: { children: ReactNode }) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const storage = useRef<ReturnType<typeof createRoutineStorage> | null>(null);
  const initialization = useRef<Promise<Routine[]> | null>(null);
  const pruned = useRef(false);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        initialization.current ??= (async () => {
          storage.current ??= createRoutineStorage(await openRoutineDatabase());
          const saved = await storage.current.list();
          if (!pruned.current) { pruned.current = true; await storage.current.prune().catch(() => undefined); }
          return saved;
        })();
        const saved = await initialization.current;
        if (active) { setRoutines(saved); setError(null); }
      } catch {
        if (active) setError(Platform.OS === 'web' ? 'Armazenamento de rotinas indisponível nesta prévia web.' : 'Não foi possível abrir as rotinas salvas. Tente novamente.');
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [attempt]);
  return <Context.Provider value={{ routines, loading, error,
    retry: () => { initialization.current = null; setLoading(true); setAttempt((value) => value + 1); },
    async progress(id, action) {
      if (!storage.current || loading || error) throw new Error('Routine storage unavailable.');
      const routine = routines.find((item) => item.id === id);
      if (!routine) throw new Error('Routine unavailable.');
      const currentId = routineExecution(routine.steps).current?.id ?? null;
      const saved = await storage.current.progress(id, action, currentId);
      setRoutines(saved);
    },
    async save(draft, id) {
      if (!storage.current || loading || error) throw new Error('Routine storage unavailable.');
      const previous = routines.find((routine) => routine.id === id);
      if (id && !previous) throw new Error('Routine unavailable.');
      const saved = await storage.current.save(draft, previous);
      setRoutines(saved);
    },
  }}>{children}</Context.Provider>;
}
export function useRoutines() {
  const context = useContext(Context);
  if (!context) throw new Error('RoutineProvider is required.');
  return context;
}

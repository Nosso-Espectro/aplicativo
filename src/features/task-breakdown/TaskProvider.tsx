import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { openTaskDatabase, type SavedTask } from './task-database';
import type { TaskDraft } from './task-model';

type Database = Awaited<ReturnType<typeof openTaskDatabase>>;
type ContextValue = {
  tasks: SavedTask[]; loading: boolean; busy: boolean; error: string | null;
  retry(): void;
  save(draft: TaskDraft, expected: { id: string; revision: number } | null): Promise<boolean>;
  complete(task: SavedTask, stepId: string, completed: boolean): Promise<boolean>;
  remove(task: SavedTask): Promise<boolean>;
};
const Context = createContext<ContextValue | null>(null);
export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<SavedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const database = useRef<Promise<Database> | null>(null);
  const owner = useRef<object | null>(null);
  const inFlight = useRef(false);
  useEffect(() => {
    const token = {}; owner.current = token;
    void (async () => {
      try {
        database.current ??= openTaskDatabase();
        const saved = await (await database.current).list();
        if (owner.current === token) { setTasks(saved); setError(null); }
      } catch {
        if (owner.current === token) {
          database.current = null;
          setError('Não foi possível abrir as tarefas. Tente novamente.');
        }
      } finally { if (owner.current === token) setLoading(false); }
    })();
    return () => { if (owner.current === token) owner.current = null; };
  }, [attempt]);
  async function change(operation: (db: Database) => Promise<SavedTask[]>) {
    const token = owner.current;
    if (!token || !database.current || loading || error || inFlight.current) return false;
    inFlight.current = true; setBusy(true);
    try {
      const saved = await operation(await database.current);
      if (owner.current !== token) return false;
      setTasks(saved); return true;
    } catch { throw new Error('Task change unavailable.'); }
    finally { inFlight.current = false; if (owner.current === token) setBusy(false); }
  }
  return <Context.Provider value={{ tasks, loading, busy, error,
    retry: () => { if (inFlight.current) return; setLoading(true); setAttempt(value => value + 1); },
    save: (draft, expected) => change(db => db.save(draft, expected)),
    complete: (task, stepId, completed) => change(db => db.complete(task.id, stepId, completed, task.revision)),
    remove: task => change(db => db.remove(task.id, task.revision)),
  }}>{children}</Context.Provider>;
}
export function useTasks() {
  const value = useContext(Context);
  if (!value) throw new Error('TaskProvider is required.');
  return value;
}

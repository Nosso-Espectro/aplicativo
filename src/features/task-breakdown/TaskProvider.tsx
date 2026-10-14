import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { openTaskWorkspaceDatabase, type SavedTask, type SavedTemplate, type TaskWorkspace } from './task-database';
import type { TaskDraft } from './task-model';
import type { TemplateDraft } from './task-template-model';

type Database = Awaited<ReturnType<typeof openTaskWorkspaceDatabase>>;
type ContextValue = {
  tasks: SavedTask[]; templates: SavedTemplate[]; loading: boolean; busy: boolean; error: string | null;
  retry(): void;
  save(draft: TaskDraft, expected: { id: string; revision: number } | null): Promise<boolean>;
  complete(task: SavedTask, stepId: string, completed: boolean): Promise<boolean>;
  remove(task: SavedTask): Promise<boolean>;
  createTemplate(task: SavedTask): Promise<boolean>;
  saveTemplate(draft: TemplateDraft, expected: { id: string; revision: number }): Promise<boolean>;
  removeTemplate(template: SavedTemplate): Promise<boolean>;
  createTaskFromTemplate(template: SavedTemplate): Promise<SavedTask | null>;
};
const Context = createContext<ContextValue | null>(null);
export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<SavedTask[]>([]);
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
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
        database.current ??= openTaskWorkspaceDatabase();
        const saved = await (await database.current).readWorkspace();
        if (owner.current === token) { setTasks(saved.tasks); setTemplates(saved.templates); setError(null); }
      } catch {
        if (owner.current === token) {
          database.current = null;
          setError('Não foi possível abrir as tarefas. Tente novamente.');
        }
      } finally { if (owner.current === token) setLoading(false); }
    })();
    return () => { if (owner.current === token) owner.current = null; };
  }, [attempt]);
  async function change<T extends SavedTask[] | TaskWorkspace>(operation: (db: Database) => Promise<T>): Promise<T | null> {
    const token = owner.current;
    if (!token || !database.current || loading || error || inFlight.current) return null;
    inFlight.current = true; setBusy(true);
    try {
      const saved = await operation(await database.current);
      if (owner.current !== token) return null;
      if (Array.isArray(saved)) setTasks(saved);
      else { setTasks(saved.tasks); setTemplates(saved.templates); }
      return saved;
    } catch { throw new Error('Task change unavailable.'); }
    finally { inFlight.current = false; if (owner.current === token) setBusy(false); }
  }
  return <Context.Provider value={{ tasks, templates, loading, busy, error,
    retry: () => { if (inFlight.current) return; setLoading(true); setAttempt(value => value + 1); },
    save: async (draft, expected) => Boolean(await change(db => db.save(draft, expected))),
    complete: async (task, stepId, completed) => Boolean(await change(db => db.complete(task.id, stepId, completed, task.revision))),
    remove: async task => Boolean(await change(db => db.remove(task.id, task.revision))),
    createTemplate: async task => Boolean(await change(db => db.createTemplate({ id: task.id, revision: task.revision }))),
    saveTemplate: async (draft, expected) => Boolean(await change(db => db.saveTemplate(draft, expected))),
    removeTemplate: async template => Boolean(await change(db => db.removeTemplate({ id: template.id, revision: template.revision }))),
    createTaskFromTemplate: async template => {
      const saved = await change(db => db.createTaskFromTemplate({ id: template.id, revision: template.revision }));
      return saved?.tasks.find(task => task.id === saved.createdTaskId) ?? null;
    },
  }}>{children}</Context.Provider>;
}
export function useTasks() {
  const value = useContext(Context);
  if (!value) throw new Error('TaskProvider is required.');
  return value;
}

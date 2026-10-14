import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { normalizedTaskDraft, setTaskStepCompleted, type TaskDraft } from './task-model';

export type SavedTask = TaskDraft & { id: string; revision: number };
function identity(id: string) {
  if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error('Invalid task identity.');
  return id;
}
async function readTasks(db: SQLiteDatabase): Promise<SavedTask[]> {
  const rows = await db.getAllAsync<{ id: string; title: string; revision: number }>('SELECT id, title, revision FROM tasks ORDER BY rowid');
  const steps = await db.getAllAsync<{ task_id: string; id: string; title: string; completed: number; position: number }>('SELECT task_id, id, title, completed, position FROM task_steps ORDER BY position');
  if (steps.some(step => !rows.some(row => row.id === step.task_id))) throw new Error('Invalid task storage.');
  return rows.map(row => {
    if (!Number.isSafeInteger(row.revision) || row.revision < 1) throw new Error('Invalid task revision.');
    const own = steps.filter(step => step.task_id === row.id);
    if (own.some((step, index) => step.position !== index || ![0, 1].includes(step.completed))) throw new Error('Invalid task steps.');
    return { id: identity(row.id), revision: row.revision,
      ...normalizedTaskDraft({ title: row.title, steps: own.map(step => ({ id: step.id, title: step.title, completed: step.completed === 1 })) }) };
  });
}
export async function openTaskDatabase() {
  const db = await openDatabaseAsync('tear-task-breakdown.db');
  try {
    await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
    await db.withExclusiveTransactionAsync(async tx => {
      const [{ user_version: version }] = await tx.getAllAsync<{ user_version: number }>('PRAGMA user_version');
      if (version > 1) throw new Error('Unsupported task schema.');
      await tx.execAsync(`CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, revision INTEGER NOT NULL CHECK(revision >= 1)
      ); CREATE TABLE IF NOT EXISTS task_steps (
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE, id TEXT NOT NULL, title TEXT NOT NULL,
        completed INTEGER NOT NULL CHECK(completed IN (0,1)), position INTEGER NOT NULL CHECK(position >= 0),
        PRIMARY KEY(task_id,id), UNIQUE(task_id,position)
      ); PRAGMA user_version = 1;`);
      await readTasks(tx);
    });
  } catch { await db.closeAsync(); throw new Error('Task storage unavailable.'); }
  let pending: Promise<unknown> = Promise.resolve();
  function enqueue<T>(operation: () => Promise<T>) {
    const next = pending.then(operation); pending = next.catch(() => undefined); return next;
  }
  function change(operation: (tx: SQLiteDatabase, current: SavedTask[]) => Promise<void>) {
    return enqueue(async () => {
      let saved!: SavedTask[];
      await db.withExclusiveTransactionAsync(async tx => { await operation(tx, await readTasks(tx)); saved = await readTasks(tx); });
      return saved;
    });
  }
  function target(current: SavedTask[], id: string, revision: number) {
    const task = current.find(item => item.id === identity(id));
    if (!task || !Number.isSafeInteger(revision) || task.revision !== revision) throw new Error('Task changed.');
    return task;
  }
  async function write(tx: SQLiteDatabase, draft: TaskDraft, id: string, revision: number) {
    if (!Number.isSafeInteger(revision)) throw new Error('Invalid task revision.');
    await tx.runAsync('UPDATE tasks SET title = ?, revision = ? WHERE id = ?', draft.title, revision, id);
    await tx.runAsync('DELETE FROM task_steps WHERE task_id = ?', id);
    for (const [position, step] of draft.steps.entries()) {
      await tx.runAsync('INSERT INTO task_steps (task_id,id,title,completed,position) VALUES (?,?,?,?,?)', id, step.id, step.title, step.completed ? 1 : 0, position);
    }
  }
  return {
    list: () => enqueue(async () => {
      let saved!: SavedTask[];
      await db.withExclusiveTransactionAsync(async tx => { saved = await readTasks(tx); }); return saved;
    }),
    save: (input: TaskDraft, expected: { id: string; revision: number } | null = null) => change(async (tx, current) => {
      const draft = normalizedTaskDraft(input);
      if (expected) {
        const task = target(current, expected.id, expected.revision); await write(tx, draft, task.id, task.revision + 1);
      } else {
        const id = identity(`task-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        await tx.runAsync('INSERT INTO tasks (id,title,revision) VALUES (?,?,1)', id, draft.title);
        await write(tx, draft, id, 1);
      }
    }),
    complete: (id: string, stepId: string, completed: boolean, revision: number) => change(async (tx, current) => {
      const task = target(current, id, revision);
      await write(tx, { title: task.title, steps: setTaskStepCompleted(task.steps, stepId, completed) }, task.id, task.revision + 1);
    }),
    remove: (id: string, revision: number) => change(async (tx, current) => {
      target(current, id, revision);
      // Exclusive transactions may use another connection with different FK settings.
      await tx.runAsync('DELETE FROM task_steps WHERE task_id = ?', id);
      await tx.runAsync('DELETE FROM tasks WHERE id = ?', id);
    }),
  };
}

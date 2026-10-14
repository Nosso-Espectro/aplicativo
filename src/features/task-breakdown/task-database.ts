import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { normalizedTaskDraft, setTaskStepCompleted, type TaskDraft } from './task-model';
import { normalizedTemplateDraft, taskFromTemplate, templateFromTask, type TemplateDraft } from './task-template-model';

export type SavedTask = TaskDraft & { id: string; revision: number };
export type SavedTemplate = TemplateDraft & { id: string; revision: number };
export type TaskWorkspace = { tasks: SavedTask[]; templates: SavedTemplate[]; createdTaskId?: string };
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
async function readTemplates(db: SQLiteDatabase): Promise<SavedTemplate[]> {
  const rows = await db.getAllAsync<{ id: string; title: string; revision: number }>('SELECT id,title,revision FROM task_templates ORDER BY rowid');
  const steps = await db.getAllAsync<{ template_id: string; id: string; title: string; position: number }>('SELECT template_id,id,title,position FROM task_template_steps ORDER BY position');
  if (steps.some(step => !rows.some(row => row.id === step.template_id))) throw new Error('Invalid template storage.');
  return rows.map(row => {
    const own = steps.filter(step => step.template_id === row.id);
    if (!Number.isSafeInteger(row.revision) || row.revision < 1 || own.some((step, index) => step.position !== index)) throw new Error('Invalid template storage.');
    return { id: identity(row.id), revision: row.revision,
      ...normalizedTemplateDraft({ title: row.title, steps: own.map(step => ({ id: step.id, title: step.title })) }) };
  });
}
export async function openTaskWorkspaceDatabase() {
  const db = await openDatabaseAsync('tear-task-breakdown.db');
  try {
    await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
    await db.withExclusiveTransactionAsync(async tx => {
      const [{ user_version: version }] = await tx.getAllAsync<{ user_version: number }>('PRAGMA user_version');
      if (version > 2) throw new Error('Unsupported task schema.');
      if (version === 0) await tx.execAsync(`CREATE TABLE tasks (
        id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, revision INTEGER NOT NULL CHECK(revision >= 1)
      ); CREATE TABLE task_steps (
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE, id TEXT NOT NULL, title TEXT NOT NULL,
        completed INTEGER NOT NULL CHECK(completed IN (0,1)), position INTEGER NOT NULL CHECK(position >= 0),
        PRIMARY KEY(task_id,id), UNIQUE(task_id,position)
      );`);
      if (version < 2) await tx.execAsync(`CREATE TABLE task_templates (
        id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, revision INTEGER NOT NULL CHECK(revision >= 1)
      ); CREATE TABLE task_template_steps (
        template_id TEXT NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
        id TEXT NOT NULL, title TEXT NOT NULL, position INTEGER NOT NULL CHECK(position >= 0),
        PRIMARY KEY(template_id,id), UNIQUE(template_id,position)
      ); PRAGMA user_version = 2;`);
      await readTasks(tx);
      await readTemplates(tx);
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
  async function workspace(tx: SQLiteDatabase): Promise<TaskWorkspace> {
    return { tasks: await readTasks(tx), templates: await readTemplates(tx) };
  }
  function changeWorkspace(operation: (tx: SQLiteDatabase, current: TaskWorkspace) => Promise<string | void>) {
    return enqueue(async () => {
      let saved!: TaskWorkspace;
      await db.withExclusiveTransactionAsync(async tx => {
        const createdTaskId = await operation(tx, await workspace(tx));
        saved = { ...await workspace(tx), ...(createdTaskId ? { createdTaskId } : {}) };
      });
      return saved;
    });
  }
  function templateTarget(current: TaskWorkspace, expected: { id: string; revision: number }) {
    const template = current.templates.find(value => value.id === identity(expected.id));
    if (!template || !Number.isSafeInteger(expected.revision) || template.revision !== expected.revision) throw new Error('Template changed.');
    return template;
  }
  async function writeTemplate(tx: SQLiteDatabase, input: TemplateDraft, id: string, revision: number) {
    const draft = normalizedTemplateDraft(input);
    if (!Number.isSafeInteger(revision)) throw new Error('Invalid template revision.');
    await tx.runAsync('UPDATE task_templates SET title=?,revision=? WHERE id=?', draft.title, revision, id);
    await tx.runAsync('DELETE FROM task_template_steps WHERE template_id=?', id);
    for (const [position, step] of draft.steps.entries()) {
      await tx.runAsync('INSERT INTO task_template_steps (template_id,id,title,position) VALUES (?,?,?,?)', id, step.id, step.title, position);
    }
  }
  return {
    readWorkspace: () => enqueue(async () => {
      let saved!: TaskWorkspace;
      await db.withExclusiveTransactionAsync(async tx => { saved = await workspace(tx); }); return saved;
    }),
    createTemplate: (expected: { id: string; revision: number }) => changeWorkspace(async (tx, current) => {
      const task = target(current.tasks, expected.id, expected.revision);
      const id = identity(`template-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      await tx.runAsync('INSERT INTO task_templates (id,title,revision) VALUES (?,?,1)', id, task.title);
      await writeTemplate(tx, templateFromTask(task), id, 1);
    }),
    saveTemplate: (input: TemplateDraft, expected: { id: string; revision: number }) => changeWorkspace(async (tx, current) => {
      const template = templateTarget(current, expected); await writeTemplate(tx, input, template.id, template.revision + 1);
    }),
    removeTemplate: (expected: { id: string; revision: number }) => changeWorkspace(async (tx, current) => {
      const template = templateTarget(current, expected);
      await tx.runAsync('DELETE FROM task_template_steps WHERE template_id=?', template.id);
      await tx.runAsync('DELETE FROM task_templates WHERE id=?', template.id);
    }),
    createTaskFromTemplate: (expected: { id: string; revision: number }) => changeWorkspace(async (tx, current) => {
      const draft = taskFromTemplate(templateTarget(current, expected));
      const id = identity(`task-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      await tx.runAsync('INSERT INTO tasks (id,title,revision) VALUES (?,?,1)', id, draft.title);
      await write(tx, draft, id, 1);
      return id;
    }),
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
export async function openTaskDatabase() {
  const { list, save, complete, remove } = await openTaskWorkspaceDatabase();
  return { list, save, complete, remove };
}

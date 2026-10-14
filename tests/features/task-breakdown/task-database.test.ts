/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { openTaskDatabase, openTaskWorkspaceDatabase } from '../../../src/features/task-breakdown/task-database';
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
let directory: string; let connections: DatabaseSync[]; let failCommit: boolean; let failReadback: boolean;
const draft = { title: 'Tarefa sintética', steps: [{ id: 'a', title: 'Etapa A', completed: true }, { id: 'b', title: 'Etapa B', completed: false }] };
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'tear-task-db-')); connections = []; failCommit = false; failReadback = false;
  jest.mocked(openDatabaseAsync).mockImplementation(async name => {
    const sql = new DatabaseSync(join(directory, name)); connections.push(sql); let written = false;
    const adapter = {
      execAsync: async (statement: string) => { sql.exec(statement); },
      runAsync: async (statement: string, ...params: (string | number | null)[]) => { written = true; return sql.prepare(statement).run(...params); },
      getAllAsync: async (statement: string) => { if (written && failReadback) throw new Error('synthetic readback failure'); return sql.prepare(statement).all(); },
      closeAsync: async () => sql.close(),
      withExclusiveTransactionAsync: async (operation: (tx: SQLiteDatabase) => Promise<void>) => {
        sql.exec('BEGIN'); written = false;
        try { await operation(adapter as unknown as SQLiteDatabase); if (failCommit) throw new Error('synthetic commit failure'); sql.exec('COMMIT'); }
        catch (error) { sql.exec('ROLLBACK'); throw error; }
      },
    };
    return adapter as unknown as SQLiteDatabase;
  });
});
afterEach(() => { for (const db of connections) { try { db.close(); } catch {} } rmSync(directory, { recursive: true, force: true }); });
it('starts empty and restores ordered manual progress after close/reopen offline', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  try {
    const db = await openTaskDatabase(); expect(await db.list()).toEqual([]);
    const [saved] = await db.save(draft); connections[0].close();
    const reopened = await openTaskDatabase(); expect(await reopened.list()).toEqual([saved]); expect(fetch).not.toHaveBeenCalled();
    const [preserved] = await reopened.save({ title: 'Sem etapas', steps: [] }); expect(preserved).toEqual(saved);
    expect((await reopened.list())[1].steps).toEqual([]);
  } finally { fetch.mockRestore(); }
});
it('edits and reorders stable steps while preserving explicit completion and other tasks', async () => {
  const db = await openTaskDatabase(); const [first] = await db.save(draft);
  const initial = await db.save({ title: 'Outra tarefa', steps: [] }); const second = initial[1];
  const updated = await db.save({ ...draft, steps: [draft.steps[1], { ...draft.steps[0], title: 'Etapa editada' }] }, first);
  expect(updated[0].steps.map(step => [step.id, step.completed])).toEqual([['b', false], ['a', true]]); expect(updated[1]).toEqual(second);
  const completed = await db.complete(first.id, 'b', true, updated[0].revision);
  expect(completed[0].steps.every(step => step.completed)).toBe(true);
  expect((await db.complete(first.id, 'a', false, completed[0].revision))[0].steps[1].completed).toBe(false);
});
it('refuses stale edits/progress/removal and never resurrects a removed task', async () => {
  const db = await openTaskDatabase(); const [saved] = await db.save(draft);
  const [changed] = await db.complete(saved.id, 'b', true, saved.revision);
  await expect(db.save(draft, saved)).rejects.toThrow('Task changed.');
  await expect(db.remove(saved.id, saved.revision)).rejects.toThrow();
  await expect(db.complete(saved.id, 'missing', false, changed.revision)).rejects.toThrow();
  expect(await db.remove(saved.id, changed.revision)).toEqual([]);
  await expect(db.save(draft, changed)).rejects.toThrow(); expect(await db.list()).toEqual([]);
});
it.each(['commit', 'readback'])('rolls back failed %s of editing, progress and deletion', async failure => {
  const db = await openTaskDatabase(); const [saved] = await db.save(draft);
  if (failure === 'commit') failCommit = true; else failReadback = true;
  await expect(db.save({ ...draft, title: 'Novo título' }, saved)).rejects.toThrow();
  await expect(db.complete(saved.id, 'b', true, saved.revision)).rejects.toThrow();
  await expect(db.remove(saved.id, saved.revision)).rejects.toThrow();
  failCommit = false; failReadback = false; expect(await db.list()).toEqual([saved]);
});
it('rejects future schema and corrupt boolean/order without resetting user records', async () => {
  const db = await openTaskDatabase(); const [saved] = await db.save(draft);
  connections[0].exec('PRAGMA user_version=3'); await expect(openTaskDatabase()).rejects.toThrow('Task storage unavailable.');
  expect(await db.list()).toEqual([saved]);
  connections[0].exec('PRAGMA ignore_check_constraints=ON; UPDATE task_steps SET completed=2 WHERE id=\'a\'');
  await expect(db.list()).rejects.toThrow('Invalid task steps.');
  connections[0].exec('UPDATE task_steps SET completed=1 WHERE id=\'a\'; UPDATE task_steps SET position=6 WHERE id=\'a\'');
  await expect(db.list()).rejects.toThrow('Invalid task steps.');
});
it('queues creation/read, rolls back failed creation and remains usable after rejection', async () => {
  const db = await openTaskDatabase(); failReadback = true;
  await expect(db.save(draft)).rejects.toThrow(); failReadback = false; expect(await db.list()).toEqual([]);
  const saving = db.save(draft); const reading = db.list(); expect(await reading).toEqual(await saving);
});
it('rejects revision overflow without losing the last confirmed task', async () => {
  const db = await openTaskDatabase(); const [saved] = await db.save(draft);
  connections[0].prepare('UPDATE tasks SET revision=? WHERE id=?').run(Number.MAX_SAFE_INTEGER, saved.id);
  const [current] = await db.list(); await expect(db.save(draft, current)).rejects.toThrow('Invalid task revision.');
  expect(await db.list()).toEqual([current]);
});
function seedVersionOne() {
  const sql = new DatabaseSync(join(directory, 'tear-task-breakdown.db'));
  sql.exec(`CREATE TABLE tasks (id TEXT PRIMARY KEY NOT NULL,title TEXT NOT NULL,revision INTEGER NOT NULL);
    CREATE TABLE task_steps (task_id TEXT NOT NULL,id TEXT NOT NULL,title TEXT NOT NULL,completed INTEGER NOT NULL,position INTEGER NOT NULL,PRIMARY KEY(task_id,id));
    INSERT INTO tasks VALUES ('v1','Tarefa anterior',7);
    INSERT INTO task_steps VALUES ('v1','step-v1','Etapa anterior',1,0); PRAGMA user_version=1;`);
  sql.close();
}
it('migrates v1 without changing tasks, identities, completion or revisions', async () => {
  seedVersionOne(); const db = await openTaskWorkspaceDatabase();
  expect(await db.readWorkspace()).toEqual({ templates: [], tasks: [{ id: 'v1', title: 'Tarefa anterior', revision: 7,
    steps: [{ id: 'step-v1', title: 'Etapa anterior', completed: true }] }] });
  expect(connections[0].prepare('PRAGMA user_version').get()).toMatchObject({ user_version: 2 });
});
it('rolls back migration on failed commit, preserves schema1 and permits retry', async () => {
  seedVersionOne(); failCommit = true; await expect(openTaskWorkspaceDatabase()).rejects.toThrow('Task storage unavailable.');
  const sql = new DatabaseSync(join(directory, 'tear-task-breakdown.db'));
  expect(sql.prepare('PRAGMA user_version').get()).toMatchObject({ user_version: 1 });
  expect(sql.prepare("SELECT name FROM sqlite_master WHERE name='task_templates'").all()).toEqual([]);
  expect(sql.prepare('SELECT revision FROM tasks').get()).toMatchObject({ revision: 7 }); sql.close();
  failCommit = false; expect((await (await openTaskWorkspaceDatabase()).readWorkspace()).tasks[0].steps[0].completed).toBe(true);
});
it('stores reusable content without progress and reopens independent copies offline', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  try {
    const db = await openTaskWorkspaceDatabase(); const [task] = await db.save(draft);
    const saved = await db.createTemplate(task); const template = saved.templates[0];
    expect(template.steps).toEqual([{ id: 'a', title: 'Etapa A' }, { id: 'b', title: 'Etapa B' }]);
    expect(saved.tasks).toEqual([task]);
    const copied = await db.createTaskFromTemplate(template); const copy = copied.tasks[1];
    expect(copy.id).not.toBe(task.id); expect(copy.steps.every(step => !step.completed)).toBe(true);
    expect(copy.steps.map(step => step.id)).not.toEqual(task.steps.map(step => step.id));
    await db.save({ title: 'Cópia alterada', steps: [{ ...copy.steps[0], title: 'Só a cópia', completed: true }] }, copy);
    const edited = await db.saveTemplate({ title: 'Modelo alterado', steps: [template.steps[1]] }, template);
    expect(edited.tasks[0]).toEqual(task); expect(edited.tasks[1].title).toBe('Cópia alterada');
    await db.removeTemplate(edited.templates[0]); expect((await db.list())[1].title).toBe('Cópia alterada');
    connections[0].close(); const reopened = await openTaskWorkspaceDatabase();
    expect((await reopened.readWorkspace()).templates).toEqual([]); expect((await reopened.list())[1].steps[0].completed).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  } finally { fetch.mockRestore(); }
});
it('keeps a model after removing its source task and supports empty models/copies', async () => {
  const db = await openTaskWorkspaceDatabase(); const [task] = await db.save({ title: 'Vazia', steps: [] });
  const { templates: [template] } = await db.createTemplate(task); await db.remove(task.id, task.revision);
  const copied = await db.createTaskFromTemplate(template); expect(copied.tasks[0].steps).toEqual([]); expect(copied.templates).toEqual([template]);
});
it('rejects stale or removed source/template operations and queues copies after edits', async () => {
  const db = await openTaskWorkspaceDatabase(); const [task] = await db.save(draft);
  await db.complete(task.id, 'a', false, task.revision); await expect(db.createTemplate(task)).rejects.toThrow('Task changed.');
  const [current] = await db.list(); const { templates: [template] } = await db.createTemplate(current);
  const editing = db.saveTemplate({ ...template, title: 'Atualizado' }, template);
  const staleCopy = db.createTaskFromTemplate(template); const updated = await editing;
  await expect(staleCopy).rejects.toThrow('Template changed.');
  await expect(db.removeTemplate(template)).rejects.toThrow();
  await db.removeTemplate(updated.templates[0]);
  await expect(db.saveTemplate(template, updated.templates[0])).rejects.toThrow();
  await expect(db.createTaskFromTemplate(updated.templates[0])).rejects.toThrow();
  expect((await db.readWorkspace()).tasks).toHaveLength(1);
});
it.each(['commit', 'readback'])('rolls back model creation/edit/delete/copy on failed %s without losing confirmed data', async failure => {
  const db = await openTaskWorkspaceDatabase(); const [task] = await db.save(draft);
  const initial = await db.createTemplate(task); const template = initial.templates[0];
  if (failure === 'commit') failCommit = true; else failReadback = true;
  await expect(db.createTemplate(task)).rejects.toThrow();
  await expect(db.saveTemplate({ ...template, title: 'Não salvar' }, template)).rejects.toThrow();
  await expect(db.removeTemplate(template)).rejects.toThrow();
  await expect(db.createTaskFromTemplate(template)).rejects.toThrow();
  failCommit = false; failReadback = false; expect(await db.readWorkspace()).toEqual(initial);
});
it('rejects invalid template order/overflow and does not recreate missing schema2 tables', async () => {
  const db = await openTaskWorkspaceDatabase(); const [task] = await db.save(draft);
  const { templates: [template] } = await db.createTemplate(task);
  connections[0].prepare('UPDATE task_templates SET revision=?').run(Number.MAX_SAFE_INTEGER);
  const current = (await db.readWorkspace()).templates[0]; await expect(db.saveTemplate(template, current)).rejects.toThrow('Invalid template revision.');
  connections[0].exec('UPDATE task_template_steps SET position=7 WHERE position=0'); await expect(db.readWorkspace()).rejects.toThrow('Invalid template storage.');
  connections[0].exec('DROP TABLE task_template_steps'); await expect(openTaskWorkspaceDatabase()).rejects.toThrow('Task storage unavailable.');
  expect(connections[0].prepare("SELECT name FROM sqlite_master WHERE name='task_template_steps'").all()).toEqual([]);
  expect((await db.list())[0]).toEqual(task);
});
it('removes owned children explicitly even when a transaction connection does not enforce foreign keys', async () => {
  const db = await openTaskDatabase(); const [first] = await db.save(draft);
  const second = (await db.save({ ...draft, title: 'Outra tarefa' }))[1];
  connections[0].exec('PRAGMA foreign_keys=OFF');
  expect(await db.remove(first.id, first.revision)).toEqual([second]);
  expect(connections[0].prepare('SELECT COUNT(*) AS count FROM task_steps WHERE task_id=?').get(first.id)).toEqual({ count: 0 });
  expect((await db.list())[0].steps).toEqual(second.steps);
});

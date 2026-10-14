/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { openTaskDatabase } from '../../../src/features/task-breakdown/task-database';
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
  connections[0].exec('PRAGMA user_version=2'); await expect(openTaskDatabase()).rejects.toThrow('Task storage unavailable.');
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
it('removes owned children explicitly even when a transaction connection does not enforce foreign keys', async () => {
  const db = await openTaskDatabase(); const [first] = await db.save(draft);
  const second = (await db.save({ ...draft, title: 'Outra tarefa' }))[1];
  connections[0].exec('PRAGMA foreign_keys=OFF');
  expect(await db.remove(first.id, first.revision)).toEqual([second]);
  expect(connections[0].prepare('SELECT COUNT(*) AS count FROM task_steps WHERE task_id=?').get(first.id)).toEqual({ count: 0 });
  expect((await db.list())[0].steps).toEqual(second.steps);
});

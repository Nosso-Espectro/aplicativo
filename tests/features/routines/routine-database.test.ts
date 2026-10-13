/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { openRoutineDatabase } from '../../../src/features/routines/routine-database';
import { normalizedRoutine } from '../../../src/features/routines/routine-model';
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
let directory: string;
let connections: DatabaseSync[];
let failRead: boolean;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'tear-routine-test-')); connections = []; failRead = false;
  jest.mocked(openDatabaseAsync).mockImplementation(async () => {
    const sql = new DatabaseSync(join(directory, 'routines.db')); connections.push(sql);
    const adapter = {
      execAsync: async (statement: string) => { sql.exec(statement); },
      runAsync: async (statement: string, ...params: (string | number | null)[]) => sql.prepare(statement).run(...params),
      getAllAsync: async (statement: string, ...params: (string | number | null)[]) => {
        if (failRead && statement === 'SELECT id, name FROM routines ORDER BY rowid') throw new Error('synthetic read failure');
        return sql.prepare(statement).all(...params);
      },
      closeAsync: async () => { sql.close(); },
      withExclusiveTransactionAsync: async (operation: (tx: SQLiteDatabase) => Promise<void>) => {
        sql.exec('BEGIN');
        try { await operation(adapter as unknown as SQLiteDatabase); sql.exec('COMMIT'); }
        catch (error) { sql.exec('ROLLBACK'); throw error; }
      },
    };
    return adapter as unknown as SQLiteDatabase;
  });
});
afterEach(() => {
  for (const connection of connections) { try { connection.close(); } catch {} }
  rmSync(directory, { recursive: true, force: true });
});
it('creates and reopens a named empty routine — RF-001/RF-004', async () => {
  const db = await openRoutineDatabase();
  expect(await db.list()).toEqual([]);
  const saved = await db.save({ name: '  Manhã  ', steps: [] });
  expect(saved[0].name).toBe('Manhã'); expect(saved[0].steps).toEqual([]);
  const reopened = await openRoutineDatabase();
  expect(await reopened.list()).toEqual(saved);
});
it('persists parameterized titles, optional images, stable IDs and edits/removal without affecting another routine — RF-002/RF-003', async () => {
  const db = await openRoutineDatabase();
  const steps = [{ id: 'step-a', title: "Teste'); DROP TABLE routines; --", imageUri: null }, { id: 'step-b', title: '  Depois  ', imageUri: 'file:///private/routine-images/test.png' }];
  const first = (await db.save({ name: 'Teste', steps }))[0];
  const all = await db.save({ name: 'Outra', steps: [] });
  const edited = await db.save({ name: 'Editada', steps: [{ ...first.steps[1], title: 'Atualizada' }] }, first.id);
  expect(edited[0].steps).toEqual([{ ...first.steps[1], title: 'Atualizada' }]);
  expect(edited[1]).toEqual(all[1]);
  expect(await (await openRoutineDatabase()).list()).toEqual(edited);
});
it('rolls back all changes on result-read failure, preserves last commit and supports retry', async () => {
  const db = await openRoutineDatabase();
  const first = (await db.save({ name: 'Salva', steps: [{ id: 'a', title: 'Etapa', imageUri: null }] }))[0];
  failRead = true;
  await expect(db.save({ name: 'Editada', steps: [] }, first.id)).rejects.toThrow();
  failRead = false;
  expect(await db.list()).toEqual([first]);
  expect((await db.save({ name: 'Editada', steps: [] }, first.id))[0].name).toBe('Editada');
});
it('rejects invalid names, titles, duplicate IDs and updates to missing routines', async () => {
  const db = await openRoutineDatabase();
  await expect(db.save({ name: ' ', steps: [] })).rejects.toThrow();
  await expect(db.save({ name: 'Teste', steps: [{ id: 'a', title: ' ', imageUri: null }] })).rejects.toThrow();
  expect(() => normalizedRoutine({ name: 'Teste', steps: Array(2).fill({ id: 'a', title: 'Etapa', imageUri: null }) })).toThrow();
  await expect(db.save({ name: 'Teste', steps: [] }, 'unknown')).rejects.toThrow();
  expect(await db.list()).toEqual([]);
});
it('migrates a populated v1 database without changing identities, titles, images or order', async () => {
  const old = new DatabaseSync(join(directory, 'routines.db')); connections.push(old);
  old.exec(`CREATE TABLE routines (id TEXT PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE routine_steps (id TEXT PRIMARY KEY, routine_id TEXT NOT NULL REFERENCES routines(id), title TEXT NOT NULL, image_uri TEXT, position INTEGER NOT NULL, UNIQUE(routine_id, position));
    INSERT INTO routines VALUES ('old-routine', 'Teste');
    INSERT INTO routine_steps VALUES ('old-step', 'old-routine', 'Etapa', 'file:///private/routine-images/keep.png', 0);
    PRAGMA user_version = 1;`);
  const db = await openRoutineDatabase();
  const expected = [{ id: 'old-routine', name: 'Teste', steps: [{ id: 'old-step', title: 'Etapa', imageUri: 'file:///private/routine-images/keep.png', completed: false }] }];
  expect(await db.list()).toEqual(expected);
  expect(old.prepare('PRAGMA user_version').get()).toEqual({ user_version: 2 });
  expect(await (await openRoutineDatabase()).list()).toEqual(expected);
});
it('reorders, reopens and edits without resetting persisted status or copying content between IDs — RF-005/RF-006/RF-007', async () => {
  const db = await openRoutineDatabase();
  const first = (await db.save({ name: 'Teste', steps: [
    { id: 'a', title: 'Primeira', imageUri: 'file:///private/routine-images/keep.png' },
    { id: 'b', title: 'Segunda', imageUri: null },
  ] }))[0];
  connections[0].prepare('UPDATE routine_steps SET completed = 1 WHERE id = ?').run('a');
  await db.save({ name: 'Outra', steps: [] });
  const swapped = await db.save({ name: first.name, steps: [...first.steps].reverse() }, first.id);
  expect(swapped[0].steps).toEqual([first.steps[1], { ...first.steps[0], completed: true }]);
  expect(swapped[1].name).toBe('Outra');
  expect(await (await openRoutineDatabase()).list()).toEqual(swapped);
  const edited = await db.save({ name: 'Editada', steps: [{ ...swapped[0].steps[1], title: 'Atualizada', completed: false }, { id: 'new', title: 'Nova', imageUri: null }] }, first.id);
  expect(edited[0].steps[0].completed).toBe(true);
  expect(edited[0].steps[1].completed).toBe(false);
});
it('keeps previous order, images and status after a failed reorder commit and allows retry', async () => {
  const db = await openRoutineDatabase();
  const first = (await db.save({ name: 'Teste', steps: [{ id: 'a', title: 'Uma', imageUri: null }, { id: 'b', title: 'Duas', imageUri: null }] }))[0];
  connections[0].prepare('UPDATE routine_steps SET completed = 1 WHERE id = ?').run('a');
  const before = await db.list();
  failRead = true;
  await expect(db.save({ name: first.name, steps: [...first.steps].reverse() }, first.id)).rejects.toThrow();
  failRead = false;
  expect(await db.list()).toEqual(before);
  const retried = await db.save({ name: first.name, steps: [...first.steps].reverse() }, first.id);
  expect(retried[0].steps.map((step) => [step.id, step.completed])).toEqual([['b', false], ['a', true]]);
});
it('refuses a future schema without downgrading or modifying its records', async () => {
  const db = await openRoutineDatabase();
  const saved = await db.save({ name: 'Teste', steps: [] });
  connections[0].exec('PRAGMA user_version = 3;');
  await expect(openRoutineDatabase()).rejects.toThrow('Routine storage unavailable.');
  expect(connections[0].prepare('PRAGMA user_version').get()).toEqual({ user_version: 3 });
  expect(await db.list()).toEqual(saved);
});

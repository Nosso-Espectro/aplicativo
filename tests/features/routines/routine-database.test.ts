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
      getAllAsync: async (statement: string) => { if (failRead) throw new Error('synthetic read failure'); return sql.prepare(statement).all(); },
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

/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { openCardDatabase } from '../../../../src/features/communication/storage/card-database';
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
let directory: string;
let connections: DatabaseSync[];
let sql: DatabaseSync;
let failRead: boolean;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'tear-card-test-'));
  connections = []; failRead = false;
  jest.mocked(openDatabaseAsync).mockImplementation(async () => {
    sql = new DatabaseSync(join(directory, 'test.db')); connections.push(sql);
    const adapter = {
      execAsync: async (statement: string) => { sql.exec(statement); },
      runAsync: async (statement: string, ...params: (string | null)[]) => sql.prepare(statement).run(...params),
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
it('creates, edits and reopens persisted cards using parameterized SQL', async () => {
  const db = await openCardDatabase();
  const title = "Teste'); DROP TABLE cards; --";
  const created = await db.save({ title, categoryId: 'needs', imageUri: null });
  expect(created).toHaveLength(1); expect(created[0].title).toBe(title);
  const id = created[0].id;
  expect(id).toMatch(/^custom-[a-f0-9]+$/);
  await db.save({ title: 'Atualizado', categoryId: 'feelings', imageUri: 'file:///private/test.png' }, id);
  sql.close(); connections = [];
  const reopened = await openCardDatabase();
  expect(await reopened.list()).toEqual([{ id, title: 'Atualizado', categoryId: 'feelings', imageUri: 'file:///private/test.png' }]);
});
it('deleting a custom card cascades only its favorites and preserves other rows', async () => {
  const db = await openCardDatabase();
  const first = (await db.save({ title: 'Primeiro', categoryId: 'needs', imageUri: null }))[0];
  const rows = await db.save({ title: 'Segundo', categoryId: 'requests', imageUri: null });
  sql.prepare('INSERT INTO favorites VALUES (?, ?)').run(first.id, 0);
  sql.prepare('INSERT INTO favorites VALUES (?, ?)').run(rows[1].id, 1);
  expect(await db.remove(first.id)).toEqual([rows[1]]);
  expect(sql.prepare('SELECT card_id FROM favorites ORDER BY position').all()).toEqual([{ card_id: rows[1].id }]);
});
it('rejects initial-card mutations and unknown categories without changing saved cards', async () => {
  const db = await openCardDatabase();
  await expect(db.remove('yes')).rejects.toThrow();
  await expect(db.save({ title: 'Teste', categoryId: 'needs', imageUri: null }, 'yes')).rejects.toThrow();
  await expect(db.save({ title: 'Teste', categoryId: 'unknown' as 'needs', imageUri: null })).rejects.toThrow();
  expect(await db.list()).toEqual([]);
});
it('rolls back the mutation when reading its result fails, then permits retry', async () => {
  const db = await openCardDatabase();
  failRead = true;
  await expect(db.save({ title: 'Teste', categoryId: 'needs', imageUri: null })).rejects.toThrow();
  failRead = false;
  expect(await db.list()).toEqual([]);
  expect(await db.save({ title: 'Teste', categoryId: 'needs', imageUri: null })).toHaveLength(1);
});

it('persists favorite sequence, ignores duplicate marking and places refavorited cards last — RF-017/RF-019', async () => {
  const db = await openCardDatabase();
  expect(await db.listFavorites()).toEqual([]);
  expect(await db.setFavorite('yes', true)).toEqual(['yes']);
  expect(await db.setFavorite('help', true)).toEqual(['yes', 'help']);
  expect(await db.setFavorite('yes', true)).toEqual(['yes', 'help']);
  expect(await db.setFavorite('yes', false)).toEqual(['help']);
  expect(await db.setFavorite('yes', true)).toEqual(['help', 'yes']);
  sql.close(); connections = [];
  const reopened = await openCardDatabase();
  expect(await reopened.listFavorites()).toEqual(['help', 'yes']);
});
it('preserves saved favorites after a transaction failure and permits retry', async () => {
  const db = await openCardDatabase();
  await db.setFavorite('yes', true);
  failRead = true;
  await expect(db.setFavorite('help', true)).rejects.toThrow();
  failRead = false;
  expect(await db.listFavorites()).toEqual(['yes']);
  expect(await db.setFavorite('help', true)).toEqual(['yes', 'help']);
});
it('supports custom favorites and cascades deletion without affecting other favorites', async () => {
  const db = await openCardDatabase();
  const custom = (await db.save({ title: 'Teste', categoryId: 'needs', imageUri: null }))[0];
  await db.setFavorite('help', true);
  await db.setFavorite(custom.id, true);
  await db.setFavorite('yes', true);
  await db.save({ title: 'Editado', categoryId: 'requests', imageUri: null }, custom.id);
  expect(await db.listFavorites()).toEqual(['help', custom.id, 'yes']);
  expect((await db.list())[0].title).toBe('Editado');
  await db.remove(custom.id);
  expect(await db.listFavorites()).toEqual(['help', 'yes']);
  await expect(db.setFavorite(custom.id, true)).rejects.toThrow();
  expect(await db.listFavorites()).toEqual(['help', 'yes']);
});

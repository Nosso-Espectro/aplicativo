import { openDatabaseAsync } from 'expo-sqlite';
import { openHistoryDatabase } from '../../../src/features/history/history-database';
import { historyDeletion, type HistoryRecord } from '../../../src/features/history/history-model';
import { historySQLiteFixture } from './sqlite-fixture';

jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
let fixture: ReturnType<typeof historySQLiteFixture>;
const checkIn: HistoryRecord = { id: 'check', type: 'check-in', savedAt: 1000, answers: { thirst: 'yes' } };
const routine: HistoryRecord = { id: 'routine', type: 'routine', savedAt: 2000, name: 'Teste local', steps: 2 };
beforeEach(() => {
  fixture = historySQLiteFixture();
  jest.mocked(openDatabaseAsync).mockImplementation(name => fixture.open(name));
});
afterEach(() => { fixture.close(); jest.restoreAllMocks(); });
async function seed() { const db = await openHistoryDatabase(); await db.save(checkIn); await db.save(routine); return db; }

it('migrates schema1 without losing records and supports durable individual deletion offline', async () => {
  const legacy = await fixture.open('tear-history.db');
  await legacy.execAsync(`CREATE TABLE history_records(id TEXT PRIMARY KEY NOT NULL,saved_at INTEGER NOT NULL,content TEXT NOT NULL);
    CREATE INDEX history_date ON history_records(saved_at DESC); PRAGMA user_version=1;`);
  await legacy.runAsync('INSERT INTO history_records VALUES(?,?,?)', checkIn.id, checkIn.savedAt, JSON.stringify({ type: checkIn.type, answers: checkIn.answers }));
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  const db = await openHistoryDatabase(); expect(await db.list()).toEqual([checkIn]);
  expect(fixture.connections[0].prepare('PRAGMA user_version').get()).toEqual({ user_version: 2 });
  await db.save(routine);
  expect(await db.remove({ kind: 'record', id: checkIn.id })).toEqual([routine]);
  expect(await (await openHistoryDatabase()).list()).toEqual([routine]);
  expect(fetch).not.toHaveBeenCalled();
});
it('removes all types atomically and returns the confirmed empty derived list', async () => {
  const db = await seed();
  expect(await db.remove({ kind: 'all', ids: [checkIn.id, routine.id] })).toEqual([]);
  expect(await (await openHistoryDatabase()).list()).toEqual([]);
});
it('retains only technical deletion IDs and rejects old save retries across reopening', async () => {
  const db = await seed(); await db.remove({ kind: 'record', id: checkIn.id });
  const reopened = await openHistoryDatabase();
  await expect(reopened.save(checkIn)).rejects.toThrow('History intent deleted.');
  expect(fixture.connections[0].prepare('SELECT * FROM history_deleted_ids').all()).toEqual([{ id: checkIn.id }]);
  expect(await reopened.list()).toEqual([routine]);
  await reopened.save({ ...checkIn, id: 'new-explicit-intent' });
  expect(await reopened.list()).toHaveLength(2);
});
it('rolls back both content deletion and technical receipts when result reading fails', async () => {
  const db = await seed(); fixture.failResult(true);
  await expect(db.remove({ kind: 'all', ids: [checkIn.id, routine.id] })).rejects.toThrow();
  fixture.failResult(false);
  expect(await db.list()).toEqual([routine, checkIn]);
  expect(fixture.connections[0].prepare('SELECT * FROM history_deleted_ids').all()).toEqual([]);
  expect(await db.remove({ kind: 'record', id: checkIn.id })).toEqual([routine]);
});
it('rejects a whole-history confirmation if another record was added after review', async () => {
  const db = await seed(); await db.save({ ...checkIn, id: 'newer' });
  await expect(db.remove({ kind: 'all', ids: [checkIn.id, routine.id] })).rejects.toThrow('History changed.');
  expect(await db.list()).toHaveLength(3);
  expect(fixture.connections[0].prepare('SELECT * FROM history_deleted_ids').all()).toEqual([]);
});
it('rejects a whole-history confirmation if a record was removed, without affecting the others', async () => {
  const db = await seed(); await db.remove({ kind: 'record', id: checkIn.id });
  await expect(db.remove({ kind: 'all', ids: [checkIn.id, routine.id] })).rejects.toThrow('History changed.');
  expect(await db.list()).toEqual([routine]);
});
it('serializes deletion before a queued stale save and preserves a separate new explicit save', async () => {
  const db = await seed();
  const removing = db.remove({ kind: 'all', ids: [checkIn.id, routine.id] });
  const retry = db.save(checkIn).catch(error => error as Error);
  const next = db.save({ ...routine, id: 'new-intent' });
  expect(await removing).toEqual([]); expect(await retry).toBeInstanceOf(Error); await next;
  expect((await db.list()).map(record => record.id)).toEqual(['new-intent']);
});
it('copies the reviewed selection before waiting in FIFO', async () => {
  const db = await seed(); const ids = [checkIn.id, routine.id];
  const pending = db.remove({ kind: 'all', ids }); ids.pop();
  expect(await pending).toEqual([]);
});
it('rejects a missing individual target and repeat deletion without changing unrelated data', async () => {
  const db = await seed(); await expect(db.remove({ kind: 'record', id: 'missing' })).rejects.toThrow();
  await db.remove({ kind: 'record', id: checkIn.id });
  await expect(db.remove({ kind: 'record', id: checkIn.id })).rejects.toThrow(); expect(await db.list()).toEqual([routine]);
});
it.each([{ kind: 'all', ids: [] }, { kind: 'all', ids: ['a', 'a'] }, { kind: 'record', id: '../invalid' }] as const)(
  'rejects invalid destructive selections %p', selection => expect(() => historyDeletion(selection)).toThrow());
it('rolls migration back on malformed legacy data without discarding the legacy row', async () => {
  const legacy = await fixture.open('tear-history.db');
  await legacy.execAsync(`CREATE TABLE history_records(id TEXT PRIMARY KEY NOT NULL,saved_at INTEGER NOT NULL,content TEXT NOT NULL);
    INSERT INTO history_records VALUES('legacy',1000,'broken'); PRAGMA user_version=1;`);
  await expect(openHistoryDatabase()).rejects.toThrow('History storage unavailable.');
  expect(fixture.connections[0].prepare('PRAGMA user_version').get()).toEqual({ user_version: 1 });
  expect(fixture.connections[0].prepare('SELECT id FROM history_records').all()).toEqual([{ id: 'legacy' }]);
  expect(fixture.connections[0].prepare("SELECT name FROM sqlite_master WHERE name='history_deleted_ids'").all()).toEqual([]);
});

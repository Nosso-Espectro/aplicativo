import { openDatabaseAsync } from 'expo-sqlite';
import { openHistoryDatabase } from '../../../src/features/history/history-database';
import { historyContent, historyRecord, type HistoryRecord } from '../../../src/features/history/history-model';
import { historySQLiteFixture } from './sqlite-fixture';

jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
let fixture: ReturnType<typeof historySQLiteFixture>;
const first: HistoryRecord = { id: 'one', savedAt: 1000, type: 'check-in', answers: { thirst: 'yes', temperature: 'comfortable' } };
const routine: HistoryRecord = { id: 'two', savedAt: 2000, type: 'routine', name: "Teste'); DROP TABLE history_records; --", steps: 2 };
beforeEach(() => {
  fixture = historySQLiteFixture();
  jest.mocked(openDatabaseAsync).mockImplementation(name => fixture.open(name));
});
afterEach(() => { fixture.close(); jest.restoreAllMocks(); });

it('opens an empty local schema and reopens confirmed snapshots without network', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  const db = await openHistoryDatabase(); expect(await db.list()).toEqual([]);
  await db.save(first); await db.save(routine);
  expect(await (await openHistoryDatabase()).list()).toEqual([routine, first]);
  expect(fetch).not.toHaveBeenCalled(); expect(openDatabaseAsync).toHaveBeenCalledWith('tear-history.db');
});
it('orders by action timestamp descending and breaks ties by insertion descending', async () => {
  const db = await openHistoryDatabase();
  const last = { ...first, id: 'last', savedAt: 2000 };
  await db.save(routine); await db.save(first); await db.save(last);
  expect((await db.list()).map(item => item.id)).toEqual(['last', 'two', 'one']);
});
it('deduplicates retries and rejects a changed intent without altering the original', async () => {
  const db = await openHistoryDatabase();
  await Promise.all([db.save(first), db.save(first), db.save(first)]);
  expect(await db.list()).toEqual([first]);
  await expect(db.save({ ...first, savedAt: 3000 })).rejects.toThrow('History intent changed.');
  expect(await db.list()).toEqual([first]);
  await db.save(routine); expect(await db.list()).toEqual([routine, first]);
});
it('captures input before FIFO wait and never retains source objects or extra data', async () => {
  const db = await openHistoryDatabase();
  const input = { ...first, answers: { ...first.answers }, imageUri: 'file:///not-stored', sourceId: 'not-stored' };
  const pending = db.save(input); input.answers.thirst = 'no';
  await pending; expect(await db.list()).toEqual([first]);
  const content = fixture.connections[0].prepare('SELECT content FROM history_records').get();
  expect(JSON.stringify(content)).not.toMatch(/not-stored|imageUri|sourceId/);
});
it('rolls back when result verification fails, preserves prior commits and retries', async () => {
  const db = await openHistoryDatabase(); await db.save(first);
  fixture.failResult(true); await expect(db.save(routine)).rejects.toThrow();
  fixture.failResult(false); expect(await db.list()).toEqual([first]);
  await db.save(routine); expect(await db.list()).toEqual([routine, first]);
});
it.each([
  { type: 'check-in', answers: {} }, { type: 'check-in', answers: { unknown: 'yes' } },
  { type: 'check-in', answers: { temperature: 'yes' } }, { type: 'check-in', answers: { thirst: 'hot' } },
  { type: 'routine', name: ' ', steps: 1 }, { type: 'routine', name: 'Teste', steps: 0 },
  { type: 'routine', name: 'Teste', steps: 1.5 }, { type: 'other' }, null,
])('rejects malformed or empty content %p', input => {
  expect(() => historyContent(input)).toThrow();
});
it.each([{ ...first, id: '../invalid' }, { ...first, savedAt: NaN }, { ...first, savedAt: -1 }, { ...first, savedAt: Infinity }])(
  'rejects invalid identity or timestamp %p', input => expect(() => historyRecord(input)).toThrow());
it('fails closed on unknown schema and malformed stored payload without resetting data', async () => {
  const db = await openHistoryDatabase(); await db.save(first);
  fixture.connections[0].exec('PRAGMA user_version=2');
  await expect(openHistoryDatabase()).rejects.toThrow('History storage unavailable.');
  fixture.connections[0].exec('PRAGMA user_version=1');
  fixture.connections[0].prepare('UPDATE history_records SET content=?').run('{broken');
  await expect(db.list()).rejects.toThrow();
  expect(fixture.connections[0].prepare('SELECT COUNT(*) AS total FROM history_records').get()).toEqual({ total: 1 });
});

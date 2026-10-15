import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { historyDeletion, historyRecord, type HistoryDeletion, type HistoryRecord } from './history-model';

async function readRecords(db: SQLiteDatabase): Promise<HistoryRecord[]> {
  const [{ user_version: version }] = await db.getAllAsync<{ user_version: number }>('PRAGMA user_version');
  if (version !== 2) throw new Error('Unsupported history schema.');
  const rows = await db.getAllAsync<{ id: string; saved_at: number; content: string }>(
    'SELECT id,saved_at,content FROM history_records ORDER BY saved_at DESC,rowid DESC');
  return rows.map(row => historyRecord({ ...JSON.parse(row.content), id: row.id, savedAt: row.saved_at }));
}

export async function openHistoryDatabase() {
  const db = await openDatabaseAsync('tear-history.db');
  try {
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.withExclusiveTransactionAsync(async tx => {
      const [{ user_version: version }] = await tx.getAllAsync<{ user_version: number }>('PRAGMA user_version');
      if (![0, 1, 2].includes(version)) throw new Error('Unsupported history schema.');
      if (version === 0) await tx.execAsync(`CREATE TABLE history_records (
        id TEXT PRIMARY KEY NOT NULL,saved_at INTEGER NOT NULL CHECK(saved_at>=0),content TEXT NOT NULL
      ); CREATE INDEX history_date ON history_records(saved_at DESC); PRAGMA user_version=1;`);
      if (version < 2) await tx.execAsync('CREATE TABLE history_deleted_ids (id TEXT PRIMARY KEY NOT NULL); PRAGMA user_version=2;');
      await readRecords(tx);
    });
  } catch { await db.closeAsync(); throw new Error('History storage unavailable.'); }
  let pending: Promise<unknown> = Promise.resolve();
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const next = pending.then(operation); pending = next.catch(() => undefined); return next;
  }
  return {
    list: () => enqueue(async () => {
      let saved!: HistoryRecord[];
      await db.withExclusiveTransactionAsync(async tx => { saved = await readRecords(tx); });
      return saved;
    }),
    save: (input: HistoryRecord) => {
      const record = historyRecord(input);
      return enqueue(async () => {
        await db.withExclusiveTransactionAsync(async tx => {
          const deleted = await tx.getAllAsync<{ id: string }>('SELECT id FROM history_deleted_ids WHERE id=?', record.id);
          if (deleted.length > 0) throw new Error('History intent deleted.');
          const existing = (await readRecords(tx)).find(item => item.id === record.id);
          if (existing) {
            if (JSON.stringify(existing) !== JSON.stringify(record)) throw new Error('History intent changed.');
            return;
          }
          const { id, savedAt, ...content } = record;
          await tx.runAsync('INSERT INTO history_records(id,saved_at,content) VALUES(?,?,?)', id, savedAt, JSON.stringify(content));
          if (!(await readRecords(tx)).some(item => item.id === id)) throw new Error('History write unconfirmed.');
        });
      });
    },
    remove: (input: HistoryDeletion) => {
      const selection = historyDeletion(input);
      return enqueue(async () => {
        let saved!: HistoryRecord[];
        await db.withExclusiveTransactionAsync(async tx => {
          const current = await readRecords(tx);
          const ids = selection.kind === 'record' ? [selection.id] : selection.ids;
          const targets = new Set(ids);
          if (ids.some(id => !current.some(record => record.id === id))
            || (selection.kind === 'all' && current.length !== targets.size)) throw new Error('History changed.');
          for (const id of ids) {
            await tx.runAsync('INSERT INTO history_deleted_ids(id) VALUES(?)', id);
            await tx.runAsync('DELETE FROM history_records WHERE id=?', id);
          }
          saved = await readRecords(tx);
          if (saved.some(record => targets.has(record.id))) throw new Error('History deletion unconfirmed.');
        });
        return saved;
      });
    },
  };
}
export type HistoryDatabase = Awaited<ReturnType<typeof openHistoryDatabase>>;

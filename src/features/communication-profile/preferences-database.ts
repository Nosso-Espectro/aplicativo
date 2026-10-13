import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { emptyPreferences, normalizedPreferences, type CommunicationPreferences } from './preferences';

async function readPreferences(db: SQLiteDatabase): Promise<CommunicationPreferences> {
  const [row] = await db.getAllAsync<{ communication: string; instructions: string; extra_time: number | null }>('SELECT communication, instructions, extra_time FROM communication_preferences WHERE id = 1');
  return row ? { communication: row.communication, instructions: row.instructions, extraTime: row.extra_time === null ? null : row.extra_time === 1 } : { ...emptyPreferences };
}
export async function openPreferencesDatabase() {
  const db = await openDatabaseAsync('tear-profile.db');
  try {
    await db.withExclusiveTransactionAsync(async (tx) => {
      const [{ user_version: version }] = await tx.getAllAsync<{ user_version: number }>('PRAGMA user_version');
      if (version > 1) throw new Error('Unsupported profile schema.');
      await tx.execAsync(`CREATE TABLE IF NOT EXISTS communication_preferences (
        id INTEGER PRIMARY KEY CHECK(id = 1), communication TEXT NOT NULL,
        instructions TEXT NOT NULL, extra_time INTEGER CHECK(extra_time IS NULL OR extra_time IN (0, 1))
      ); PRAGMA user_version = 1;`);
    });
  } catch {
    await db.closeAsync(); throw new Error('Profile storage unavailable.');
  }
  let pending: Promise<unknown> = Promise.resolve();
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const next = pending.then(operation); pending = next.catch(() => undefined); return next;
  }
  return {
    read: () => enqueue(() => readPreferences(db)),
    save: (input: CommunicationPreferences) => enqueue(async () => {
      const draft = normalizedPreferences(input);
      let saved = { ...emptyPreferences };
      await db.withExclusiveTransactionAsync(async (tx) => {
        await tx.runAsync(`INSERT INTO communication_preferences (id, communication, instructions, extra_time) VALUES (1, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET communication = excluded.communication, instructions = excluded.instructions, extra_time = excluded.extra_time`,
        draft.communication, draft.instructions, draft.extraTime === null ? null : Number(draft.extraTime));
        saved = await readPreferences(tx);
      });
      return saved;
    }),
  };
}

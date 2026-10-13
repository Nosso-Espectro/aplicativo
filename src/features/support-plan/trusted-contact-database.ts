import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { emptyTrustedContact, normalizedTrustedContact, type TrustedContact } from './trusted-contact';

async function readContact(db: SQLiteDatabase): Promise<TrustedContact> {
  const [row] = await db.getAllAsync<TrustedContact>('SELECT name, phone, message FROM trusted_contact WHERE id = 1');
  return row ? normalizedTrustedContact(row) : { ...emptyTrustedContact };
}
export async function openTrustedContactDatabase() {
  const db = await openDatabaseAsync('tear-trusted-contact.db');
  try {
    await db.withExclusiveTransactionAsync(async (tx) => {
      const [{ user_version: version }] = await tx.getAllAsync<{ user_version: number }>('PRAGMA user_version');
      if (version > 1) throw new Error('Unsupported trusted contact schema.');
      await tx.execAsync(`CREATE TABLE IF NOT EXISTS trusted_contact (
        id INTEGER PRIMARY KEY CHECK(id = 1), name TEXT NOT NULL, phone TEXT NOT NULL, message TEXT NOT NULL
      ); PRAGMA user_version = 1;`);
    });
  } catch { await db.closeAsync(); throw new Error('Trusted contact storage unavailable.'); }
  let pending: Promise<unknown> = Promise.resolve();
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const next = pending.then(operation); pending = next.catch(() => undefined); return next;
  }
  return {
    read: () => enqueue(() => readContact(db)),
    save: (input: TrustedContact) => enqueue(async () => {
      const draft = normalizedTrustedContact(input); let saved = { ...emptyTrustedContact };
      await db.withExclusiveTransactionAsync(async (tx) => {
        await tx.runAsync(`INSERT INTO trusted_contact (id, name, phone, message) VALUES (1, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET name = excluded.name, phone = excluded.phone, message = excluded.message`,
        draft.name, draft.phone, draft.message);
        saved = await readContact(tx);
      });
      return saved;
    }),
  };
}

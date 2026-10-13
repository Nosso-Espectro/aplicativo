import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { defaultLowStimulationPreference, normalizedLowStimulationPreference, type LowStimulationPreference } from './low-stimulation';

async function readPreference(db: SQLiteDatabase): Promise<LowStimulationPreference> {
  const [row] = await db.getAllAsync<{ enabled: number }>('SELECT enabled FROM display_preference WHERE id = 1');
  if (!row) return { ...defaultLowStimulationPreference };
  if (row.enabled !== 0 && row.enabled !== 1) throw new Error('Invalid display preference.');
  return { enabled: row.enabled === 1 };
}

export async function openDisplayPreferencesDatabase() {
  const db = await openDatabaseAsync('tear-display-preferences.db');
  try {
    await db.withExclusiveTransactionAsync(async (tx) => {
      const [{ user_version: version }] = await tx.getAllAsync<{ user_version: number }>('PRAGMA user_version');
      if (version > 1) throw new Error('Unsupported display preference schema.');
      await tx.execAsync(`CREATE TABLE IF NOT EXISTS display_preference (
        id INTEGER PRIMARY KEY CHECK(id = 1), enabled INTEGER NOT NULL CHECK(enabled IN (0, 1))
      ); PRAGMA user_version = 1;`);
    });
  } catch { await db.closeAsync(); throw new Error('Display preference storage unavailable.'); }
  let pending: Promise<unknown> = Promise.resolve();
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const next = pending.then(operation); pending = next.catch(() => undefined); return next;
  }
  return {
    read: () => enqueue(() => readPreference(db)),
    save: (input: LowStimulationPreference) => enqueue(async () => {
      const draft = normalizedLowStimulationPreference(input); let saved = { ...defaultLowStimulationPreference };
      await db.withExclusiveTransactionAsync(async (tx) => {
        await tx.runAsync(`INSERT INTO display_preference (id, enabled) VALUES (1, ?)
          ON CONFLICT(id) DO UPDATE SET enabled = excluded.enabled`, draft.enabled ? 1 : 0);
        saved = await readPreference(tx);
      });
      return saved;
    }),
  };
}

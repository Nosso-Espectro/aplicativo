import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { emptyPreferences, normalizedPreferences, type CommunicationPreferences } from './preferences';
import { emptySupportPreferences, normalizedSupportPreferences, supportForPlan, type SupportField, type SupportPreferences } from './support-preferences';
import { buildProfileSummary, normalizedSummarySelection, type SummaryField } from './profile-summary';

async function readSummarySelection(db: SQLiteDatabase): Promise<SummaryField[]> {
  const rows = await db.getAllAsync<{ field: SummaryField }>('SELECT field FROM summary_selection');
  return normalizedSummarySelection(rows.map((row) => row.field));
}

async function readSupport(db: SQLiteDatabase): Promise<SupportPreferences> {
  const [row] = await db.getAllAsync<SupportPreferences>(`SELECT sound, light, touch, temperature, other,
    helpful_strategies AS helpfulStrategies, avoid_strategies AS avoidStrategies FROM support_preferences WHERE id = 1`);
  return row ? normalizedSupportPreferences(row) : { ...emptySupportPreferences };
}

async function readPreferences(db: SQLiteDatabase): Promise<CommunicationPreferences> {
  const [row] = await db.getAllAsync<{ communication: string; instructions: string; extra_time: number | null }>('SELECT communication, instructions, extra_time FROM communication_preferences WHERE id = 1');
  return row ? { communication: row.communication, instructions: row.instructions, extraTime: row.extra_time === null ? null : row.extra_time === 1 } : { ...emptyPreferences };
}
export async function openPreferencesDatabase() {
  const db = await openDatabaseAsync('tear-profile.db');
  try {
    await db.withExclusiveTransactionAsync(async (tx) => {
      const [{ user_version: version }] = await tx.getAllAsync<{ user_version: number }>('PRAGMA user_version');
      if (version > 3) throw new Error('Unsupported profile schema.');
      await tx.execAsync(`CREATE TABLE IF NOT EXISTS communication_preferences (
        id INTEGER PRIMARY KEY CHECK(id = 1), communication TEXT NOT NULL,
        instructions TEXT NOT NULL, extra_time INTEGER CHECK(extra_time IS NULL OR extra_time IN (0, 1))
      ); CREATE TABLE IF NOT EXISTS support_preferences (
        id INTEGER PRIMARY KEY CHECK(id = 1), sound TEXT NOT NULL, light TEXT NOT NULL,
        touch TEXT NOT NULL, temperature TEXT NOT NULL, other TEXT NOT NULL,
        helpful_strategies TEXT NOT NULL, avoid_strategies TEXT NOT NULL
      ); CREATE TABLE IF NOT EXISTS summary_selection (
        field TEXT PRIMARY KEY NOT NULL
      ); PRAGMA user_version = 3;`);
    });
  } catch {
    await db.closeAsync(); throw new Error('Profile storage unavailable.');
  }
  let pending: Promise<unknown> = Promise.resolve();
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const next = pending.then(operation); pending = next.catch(() => undefined); return next;
  }
  return {
    readSummarySelection: () => enqueue(() => readSummarySelection(db)),
    saveSummarySelection: (input: readonly SummaryField[]) => enqueue(async () => {
      const draft = normalizedSummarySelection(input);
      let saved: SummaryField[] = [];
      await db.withExclusiveTransactionAsync(async (tx) => {
        await tx.runAsync('DELETE FROM summary_selection');
        for (const field of draft) await tx.runAsync('INSERT INTO summary_selection (field) VALUES (?)', field);
        saved = await readSummarySelection(tx);
      });
      return saved;
    }),
    readProfileSummary: () => enqueue(async () => {
      let summary: ReturnType<typeof buildProfileSummary> = [];
      // Selection and current values must belong to the same committed profile state.
      await db.withExclusiveTransactionAsync(async (tx) => {
        const selected = await readSummarySelection(tx);
        summary = buildProfileSummary(await readPreferences(tx), await readSupport(tx), selected);
      });
      return summary;
    }),
    readSupport: () => enqueue(() => readSupport(db)),
    readSupportForPlan: (selected: readonly SupportField[] = []) => enqueue(async () => supportForPlan(await readSupport(db), selected)),
    saveSupport: (input: SupportPreferences) => enqueue(async () => {
      const draft = normalizedSupportPreferences(input);
      let saved = { ...emptySupportPreferences };
      await db.withExclusiveTransactionAsync(async (tx) => {
        await tx.runAsync(`INSERT INTO support_preferences (id, sound, light, touch, temperature, other, helpful_strategies, avoid_strategies)
          VALUES (1, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET sound = excluded.sound,
          light = excluded.light, touch = excluded.touch, temperature = excluded.temperature, other = excluded.other,
          helpful_strategies = excluded.helpful_strategies, avoid_strategies = excluded.avoid_strategies`,
        draft.sound, draft.light, draft.touch, draft.temperature, draft.other, draft.helpfulStrategies, draft.avoidStrategies);
        saved = await readSupport(tx);
      });
      return saved;
    }),
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

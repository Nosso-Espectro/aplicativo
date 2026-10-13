import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { type SupportField } from '../communication-profile/support-preferences';
import { emptySupportPlan, normalizedSupportPlan, type SuggestedOrientation, type SupportPlan } from './support-plan';

async function readPlan(db: SQLiteDatabase): Promise<SupportPlan> {
  const [row] = await db.getAllAsync<{ instructions: string }>('SELECT instructions FROM support_plan WHERE id = 1');
  const suggestions = await db.getAllAsync<{ id: SuggestedOrientation }>('SELECT id FROM plan_suggestions');
  const fields = await db.getAllAsync<{ id: SupportField }>('SELECT id FROM plan_profile_fields');
  return normalizedSupportPlan({ instructions: row?.instructions ?? '', suggestions: suggestions.map(({ id }) => id), profileFields: fields.map(({ id }) => id) });
}

export async function openSupportPlanDatabase() {
  const db = await openDatabaseAsync('tear-support-plan.db');
  try {
    await db.withExclusiveTransactionAsync(async (tx) => {
      const [{ user_version: version }] = await tx.getAllAsync<{ user_version: number }>('PRAGMA user_version');
      if (version > 1) throw new Error('Unsupported support plan schema.');
      await tx.execAsync(`CREATE TABLE IF NOT EXISTS support_plan (id INTEGER PRIMARY KEY CHECK(id = 1), instructions TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS plan_suggestions (id TEXT PRIMARY KEY NOT NULL);
        CREATE TABLE IF NOT EXISTS plan_profile_fields (id TEXT PRIMARY KEY NOT NULL);
        PRAGMA user_version = 1;`);
    });
  } catch { await db.closeAsync(); throw new Error('Support plan storage unavailable.'); }
  let pending: Promise<unknown> = Promise.resolve();
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const next = pending.then(operation); pending = next.catch(() => undefined); return next;
  }
  return {
    read: () => enqueue(async () => {
      let plan = normalizedSupportPlan(emptySupportPlan);
      await db.withExclusiveTransactionAsync(async (tx) => { plan = await readPlan(tx); });
      return plan;
    }),
    save: (input: SupportPlan) => enqueue(async () => {
      const draft = normalizedSupportPlan(input);
      let saved = normalizedSupportPlan(emptySupportPlan);
      await db.withExclusiveTransactionAsync(async (tx) => {
        await tx.runAsync(`INSERT INTO support_plan (id, instructions) VALUES (1, ?)
          ON CONFLICT(id) DO UPDATE SET instructions = excluded.instructions`, draft.instructions);
        await tx.runAsync('DELETE FROM plan_suggestions');
        await tx.runAsync('DELETE FROM plan_profile_fields');
        for (const id of draft.suggestions) await tx.runAsync('INSERT INTO plan_suggestions (id) VALUES (?)', id);
        for (const id of draft.profileFields) await tx.runAsync('INSERT INTO plan_profile_fields (id) VALUES (?)', id);
        saved = await readPlan(tx);
      });
      return saved;
    }),
  };
}

import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { normalizedRoutine, type Routine, type RoutineDraft } from './routine-model';

async function readRoutines(db: SQLiteDatabase): Promise<Routine[]> {
  const routines = await db.getAllAsync<{ id: string; name: string }>('SELECT id, name FROM routines ORDER BY rowid');
  const steps = await db.getAllAsync<{ id: string; routine_id: string; title: string; image_uri: string | null }>('SELECT * FROM routine_steps ORDER BY position');
  return routines.map((routine) => ({ ...routine, steps: steps.filter((step) => step.routine_id === routine.id)
    .map((step) => ({ id: step.id, title: step.title, imageUri: step.image_uri })) }));
}
export async function openRoutineDatabase() {
  const db = await openDatabaseAsync('tear-routines.db');
  try {
    await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
    await db.withExclusiveTransactionAsync(async (tx) => {
      await tx.execAsync(`
        CREATE TABLE IF NOT EXISTS routines (id TEXT PRIMARY KEY, name TEXT NOT NULL CHECK(length(trim(name)) > 0));
        CREATE TABLE IF NOT EXISTS routine_steps (
          id TEXT PRIMARY KEY, routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
          title TEXT NOT NULL CHECK(length(trim(title)) > 0), image_uri TEXT,
          position INTEGER NOT NULL CHECK(position >= 0), UNIQUE(routine_id, position)
        ); PRAGMA user_version = 1;`);
    });
  } catch {
    await db.closeAsync();
    throw new Error('Routine storage unavailable.');
  }
  let pending: Promise<unknown> = Promise.resolve();
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const next = pending.then(operation);
    pending = next.catch(() => undefined);
    return next;
  }
  return {
    list: () => enqueue(() => readRoutines(db)),
    save: (input: RoutineDraft, id?: string) => enqueue(async () => {
      const draft = normalizedRoutine(input);
      const routineId = id ?? `routine-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      let saved: Routine[] = [];
      await db.withExclusiveTransactionAsync(async (tx) => {
        if (id) {
          const result = await tx.runAsync('UPDATE routines SET name = ? WHERE id = ?', draft.name, id);
          if (result.changes !== 1) throw new Error('Routine unavailable.');
        } else await tx.runAsync('INSERT INTO routines (id, name) VALUES (?, ?)', routineId, draft.name);
        await tx.runAsync('DELETE FROM routine_steps WHERE routine_id = ?', routineId);
        for (const [position, step] of draft.steps.entries()) {
          await tx.runAsync('INSERT INTO routine_steps (id, routine_id, title, image_uri, position) VALUES (?, ?, ?, ?, ?)', step.id, routineId, step.title, step.imageUri, position);
        }
        saved = await readRoutines(tx);
      });
      return saved;
    }),
  };
}
export type RoutineDatabase = Awaited<ReturnType<typeof openRoutineDatabase>>;

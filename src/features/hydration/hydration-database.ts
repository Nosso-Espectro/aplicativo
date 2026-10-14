import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { hydrationIdentifier, initialHydrationConfig, nextHydrationRevision, normalizedHydrationConfig,
  validHydrationInterval, type HydrationConfig, type HydrationJournal } from './hydration-model';
type Row = { revision: number; interval_minutes: number; status: HydrationConfig['status']; identifier: string | null; journal: string | null };
const changed = () => new Error('Hydration configuration changed.');
async function read(db: SQLiteDatabase): Promise<HydrationConfig> {
  const rows = await db.getAllAsync<Row>('SELECT revision, interval_minutes, status, identifier, journal FROM hydration_config WHERE id = 1');
  if (rows.length !== 1) throw new Error('Invalid hydration storage.');
  const row = rows[0];
  let journal: HydrationJournal | null = null;
  if (row.journal !== null) {
    if (typeof row.journal !== 'string') throw new Error('Invalid hydration storage.');
    try { journal = JSON.parse(row.journal); } catch { throw new Error('Invalid hydration storage.'); }
    if (journal === null) throw new Error('Invalid hydration storage.');
  }
  return normalizedHydrationConfig({ revision: row.revision, intervalMinutes: row.interval_minutes, status: row.status, identifier: row.identifier, journal });
}
export async function openHydrationDatabase() {
  const db = await openDatabaseAsync('tear-hydration-reminders.db');
  try {
    await db.withExclusiveTransactionAsync(async tx => {
      const versions = await tx.getAllAsync<{ user_version: number }>('PRAGMA user_version');
      if (versions.length !== 1 || ![0, 1].includes(versions[0].user_version)) throw new Error('Unsupported hydration schema.');
      if (versions[0].user_version === 0) {
        await tx.execAsync(`CREATE TABLE hydration_config (
          id INTEGER PRIMARY KEY CHECK(id = 1), revision INTEGER NOT NULL CHECK(revision >= 0),
          interval_minutes INTEGER NOT NULL CHECK(interval_minutes BETWEEN 30 AND 720),
          status TEXT NOT NULL CHECK(status IN ('disabled', 'paused', 'active')), identifier TEXT, journal TEXT
        ); INSERT INTO hydration_config VALUES (1, 0, 60, 'disabled', NULL, NULL); PRAGMA user_version = 1;`);
      }
      await read(tx);
    });
  } catch { await db.closeAsync(); throw new Error('Hydration storage unavailable.'); }
  let pending: Promise<unknown> = Promise.resolve();
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const next = pending.then(operation); pending = next.catch(() => undefined); return next;
  }
  function mutate(expectedRevision: number, operation: (current: HydrationConfig) => HydrationConfig) {
    return enqueue(async () => {
      let saved = initialHydrationConfig();
      await db.withExclusiveTransactionAsync(async tx => {
        const current = await read(tx);
        if (current.revision !== expectedRevision) throw changed();
        const next = normalizedHydrationConfig(operation(current));
        const result = await tx.runAsync(`UPDATE hydration_config SET revision=?, interval_minutes=?, status=?, identifier=?, journal=? WHERE id=1 AND revision=?`,
          next.revision, next.intervalMinutes, next.status, next.identifier, next.journal ? JSON.stringify(next.journal) : null, expectedRevision);
        if (result.changes !== 1) throw changed();
        saved = await read(tx);
        if (JSON.stringify(saved) !== JSON.stringify(next)) throw new Error('Hydration readback failed.');
      });
      return saved;
    });
  }
  return {
    read: () => enqueue(() => read(db)),
    saveInterval: (minutes: number, expectedRevision: number) => mutate(expectedRevision, current => {
      if (!validHydrationInterval(minutes) || current.status === 'active' || current.journal) throw changed();
      return { ...current, intervalMinutes: minutes, revision: nextHydrationRevision(current.revision) };
    }),
    prepareActivation: (expectedRevision: number) => mutate(expectedRevision, current => {
      if (current.status === 'active' || current.journal) throw changed();
      const revision = nextHydrationRevision(current.revision);
      return { ...current, revision, journal: { kind: 'activate', identifier: hydrationIdentifier(revision) } };
    }),
    confirmActivation: (identifier: string, expectedRevision: number) => mutate(expectedRevision, current => {
      if (current.journal?.kind !== 'activate' || current.journal.identifier !== identifier) throw changed();
      return { ...current, revision: nextHydrationRevision(current.revision), status: 'active', identifier, journal: null };
    }),
    prepareCancellation: (nextStatus: 'disabled' | 'paused', expectedRevision: number) => mutate(expectedRevision, current => {
      if (!['disabled', 'paused'].includes(nextStatus)) throw changed();
      // A new revision takes over interrupted work and makes old activation commits stale.
      const identifier = current.journal?.identifier ?? current.identifier;
      return { ...current, revision: nextHydrationRevision(current.revision), journal: { kind: 'cancel', nextStatus, identifier } };
    }),
    // Call only after native cancellation has been confirmed, including an interrupted activation.
    confirmCancellation: (expectedRevision: number) => mutate(expectedRevision, current => {
      if (!current.journal) throw changed();
      const status = current.journal.kind === 'cancel' ? current.journal.nextStatus : 'paused';
      return { ...current, revision: nextHydrationRevision(current.revision), status, identifier: null, journal: null };
    }),
  };
}
export type HydrationDatabase = Awaited<ReturnType<typeof openHydrationDatabase>>;

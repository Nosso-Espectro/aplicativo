import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { hydrationIdentifier, initialHydrationConfig, nextHydrationRevision, normalizedHydrationConfig,
  legacyHydrationReceipt, validHydrationInterval, type HydrationConfig, type HydrationJournal } from './hydration-model';
import { normalizeHydrationReceipt, type HydrationReceipt } from './hydration-receipt';
import { normalizeQuietWindow, type QuietWindow } from './quiet-hours';
type Row = { revision: number; interval_minutes: number; status: HydrationConfig['status']; identifier: string | null; journal: string | null;
  quiet_window: string | null; receipt: string | null };
const changed = () => new Error('Hydration configuration changed.');
function json(value: string | null): unknown {
  if (value === null) return null;
  if (typeof value !== 'string') throw changed();
  const parsed: unknown = JSON.parse(value); if (parsed === null) throw changed(); return parsed;
}
async function assertSchema(db: SQLiteDatabase, expected: number) {
  const versions = await db.getAllAsync<{ user_version: number }>('PRAGMA user_version');
  if (versions.length !== 1 || versions[0].user_version !== expected) throw new Error('Unsupported hydration schema.');
}
async function read(db: SQLiteDatabase, legacy = false): Promise<HydrationConfig> {
  await assertSchema(db, legacy ? 1 : 2);
  const rows = await db.getAllAsync<Row>(`SELECT revision, interval_minutes, status, identifier, journal${legacy ? '' : ', quiet_window, receipt'} FROM hydration_config WHERE id = 1`);
  if (rows.length !== 1) throw new Error('Invalid hydration storage.');
  const row = rows[0];
  const journal = json(row.journal) as HydrationJournal | null;
  const quietWindow = legacy ? null : normalizeQuietWindow(json(row.quiet_window));
  const receipt = legacy ? null : json(row.receipt) as HydrationReceipt | null;
  if (journal && (typeof journal !== 'object' || Array.isArray(journal))) throw changed();
  if (legacy) {
    if (row.identifier !== null) legacyHydrationReceipt(row.identifier, row.interval_minutes);
    if (journal) {
      if ('receipt' in journal) throw changed();
      if (journal.identifier !== null) legacyHydrationReceipt(journal.identifier, row.interval_minutes);
    }
  } else if ((row.status === 'active' && !receipt) || (journal && (!('receipt' in journal) || journal.receipt === undefined
    || (journal.identifier !== null && journal.receipt === null)))) throw changed();
  const saved = normalizedHydrationConfig({ revision: row.revision, intervalMinutes: row.interval_minutes, status: row.status,
    identifier: row.identifier, journal, quietWindow, receipt });
  await assertSchema(db, legacy ? 1 : 2); return saved;
}
function acknowledged(config: HydrationConfig, receipt: HydrationReceipt | null, ids: readonly string[] | undefined) {
  const targets = receipt?.entries.map(entry => entry.identifier) ?? [];
  // Legacy single-interval callers already obtain native acknowledgement before committing.
  if (ids === undefined && !config.quietWindow && targets.length <= 1) return;
  if (!ids || ids.length !== targets.length || new Set(ids).size !== targets.length || targets.some(id => !ids.includes(id))) throw changed();
}
export async function openHydrationDatabase() {
  const db = await openDatabaseAsync('tear-hydration-reminders.db');
  try {
    await db.withExclusiveTransactionAsync(async tx => {
      const versions = await tx.getAllAsync<{ user_version: number }>('PRAGMA user_version');
      if (versions.length !== 1 || ![0, 1, 2].includes(versions[0].user_version)) throw new Error('Unsupported hydration schema.');
      if (versions[0].user_version === 0) {
        await tx.execAsync(`CREATE TABLE hydration_config (
          id INTEGER PRIMARY KEY CHECK(id = 1), revision INTEGER NOT NULL CHECK(revision >= 0),
          interval_minutes INTEGER NOT NULL CHECK(interval_minutes BETWEEN 30 AND 720),
          status TEXT NOT NULL CHECK(status IN ('disabled', 'paused', 'active')), identifier TEXT, journal TEXT, quiet_window TEXT, receipt TEXT
        ); INSERT INTO hydration_config VALUES (1, 0, 60, 'disabled', NULL, NULL, NULL, NULL); PRAGMA user_version = 2;`);
      } else if (versions[0].user_version === 1) {
        const current = await read(tx, true);
        await tx.execAsync('ALTER TABLE hydration_config ADD COLUMN quiet_window TEXT; ALTER TABLE hydration_config ADD COLUMN receipt TEXT;');
        const result = await tx.runAsync('UPDATE hydration_config SET journal=?, receipt=? WHERE id=1 AND revision=?',
          current.journal ? JSON.stringify(current.journal) : null, current.receipt ? JSON.stringify(current.receipt) : null, current.revision);
        await tx.execAsync('PRAGMA user_version = 2;');
        if (result.changes !== 1 || JSON.stringify(await read(tx)) !== JSON.stringify(current)) throw changed();
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
        const result = await tx.runAsync(`UPDATE hydration_config SET revision=?, interval_minutes=?, status=?, identifier=?, journal=?, quiet_window=?, receipt=? WHERE id=1 AND revision=?`,
          next.revision, next.intervalMinutes, next.status, next.identifier, next.journal ? JSON.stringify(next.journal) : null,
          next.quietWindow ? JSON.stringify(next.quietWindow) : null, next.receipt ? JSON.stringify(next.receipt) : null, expectedRevision);
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
    saveQuietWindow: (quiet: QuietWindow | null, expectedRevision: number) => {
      let copied: QuietWindow | null;
      try { copied = normalizeQuietWindow(quiet); } catch { return Promise.reject(changed()); }
      return mutate(expectedRevision, current => {
        if (current.status === 'active' || current.journal) throw changed();
        return { ...current, quietWindow: copied, revision: nextHydrationRevision(current.revision) };
      });
    },
    prepareActivation: (expectedRevision: number, planned?: HydrationReceipt) => {
      let copied: unknown;
      try { copied = planned === undefined ? undefined : JSON.parse(JSON.stringify(planned)); } catch { return Promise.reject(changed()); }
      return mutate(expectedRevision, current => {
        if (current.status === 'active' || current.journal) throw changed();
        const revision = nextHydrationRevision(current.revision);
        if (copied === undefined && current.quietWindow) throw changed();
        const receipt = copied === undefined ? legacyHydrationReceipt(hydrationIdentifier(revision), current.intervalMinutes)
          : normalizeHydrationReceipt(copied, current.intervalMinutes, current.quietWindow);
        return { ...current, revision, journal: { kind: 'activate', identifier: receipt.entries[0].identifier, receipt } };
      });
    },
    confirmActivation: (identifier: string, expectedRevision: number, confirmedIds?: readonly string[]) => {
      const ids = confirmedIds === undefined ? undefined : [...confirmedIds];
      return mutate(expectedRevision, current => {
        if (current.journal?.kind !== 'activate' || current.journal.identifier !== identifier) throw changed();
        const receipt = current.journal.receipt ?? null; if (!receipt) throw changed(); acknowledged(current, receipt, ids);
        return { ...current, revision: nextHydrationRevision(current.revision), status: 'active', identifier, receipt, journal: null };
      });
    },
    prepareCancellation: (nextStatus: 'disabled' | 'paused', expectedRevision: number) => mutate(expectedRevision, current => {
      if (!['disabled', 'paused'].includes(nextStatus)) throw changed();
      // A new revision takes over interrupted work and makes old activation commits stale.
      const identifier = current.journal?.identifier ?? current.identifier;
      const receipt = current.journal?.receipt ?? current.receipt;
      return { ...current, revision: nextHydrationRevision(current.revision), journal: { kind: 'cancel', nextStatus, identifier, receipt } };
    }),
    // Call only after native cancellation has been confirmed, including an interrupted activation.
    confirmCancellation: (expectedRevision: number, confirmedIds?: readonly string[]) => {
      const ids = confirmedIds === undefined ? undefined : [...confirmedIds];
      return mutate(expectedRevision, current => {
        if (!current.journal) throw changed();
        acknowledged(current, current.journal.receipt ?? null, ids);
        const status = current.journal.kind === 'cancel' ? current.journal.nextStatus : 'paused';
        return { ...current, revision: nextHydrationRevision(current.revision), status, identifier: null, receipt: null, journal: null };
      });
    },
  };
}
export type HydrationDatabase = Awaited<ReturnType<typeof openHydrationDatabase>>;

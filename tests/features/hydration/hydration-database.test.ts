/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { openHydrationDatabase } from '../../../src/features/hydration/hydration-database';
import { initialHydrationConfig, type HydrationConfig, type HydrationJournal } from '../../../src/features/hydration/hydration-model';
import { createDailyHydrationReceipt } from '../../../src/features/hydration/hydration-receipt';
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
let directory: string; let connections: DatabaseSync[]; let failCommit: boolean; let failReadback: boolean;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'tear-hydration-db-')); connections = []; failCommit = false; failReadback = false;
  jest.mocked(openDatabaseAsync).mockImplementation(async name => {
    const sql = new DatabaseSync(join(directory, name)); connections.push(sql); let written = false;
    const adapter = {
      execAsync: async (statement: string) => { sql.exec(statement); },
      runAsync: async (statement: string, ...params: (string | number | null)[]) => { written = true; return sql.prepare(statement).run(...params); },
      getAllAsync: async (statement: string) => { if (written && failReadback) throw new Error('synthetic readback'); return sql.prepare(statement).all(); },
      closeAsync: async () => sql.close(),
      withExclusiveTransactionAsync: async (operation: (tx: SQLiteDatabase) => Promise<void>) => {
        sql.exec('BEGIN'); written = false;
        try { await operation(adapter as unknown as SQLiteDatabase); if (failCommit) throw new Error('synthetic commit'); sql.exec('COMMIT'); }
        catch (error) { sql.exec('ROLLBACK'); throw error; }
      },
    }; return adapter as unknown as SQLiteDatabase;
  });
});
afterEach(() => { for (const sql of connections) try { sql.close(); } catch {} rmSync(directory, { recursive: true, force: true }); });
it('starts disabled and preserves configuration and pending journal across offline reopen', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline synthetic'));
  try {
    const db = await openHydrationDatabase(); expect(await db.read()).toEqual(initialHydrationConfig());
    const saved = await db.saveInterval(120, 0); const pending = await db.prepareActivation(saved.revision);
    expect(pending.status).toBe('disabled'); expect(pending.identifier).toBeNull(); expect(pending.journal).toMatchObject({ kind: 'activate' });
    connections[0].close(); const reopened = await openHydrationDatabase(); expect(await reopened.read()).toEqual(pending);
    expect((await reopened.confirmCancellation(pending.revision))).toMatchObject({ status: 'paused', intervalMinutes: 120, journal: null });
    expect(fetch).not.toHaveBeenCalled();
  } finally { fetch.mockRestore(); }
});
it('confirms only the exact planned activation receipt and keeps cancellation pending until acknowledgement', async () => {
  const db = await openHydrationDatabase(); const preparing = await db.prepareActivation(0);
  await expect(db.confirmActivation('tear-hydration-v1-2', preparing.revision)).rejects.toThrow();
  if (preparing.journal?.kind !== 'activate') throw new Error('Expected activation journal');
  const active = await db.confirmActivation(preparing.journal.identifier, preparing.revision);
  expect(active).toMatchObject({ status: 'active', identifier: preparing.journal.identifier, journal: null });
  const canceling = await db.prepareCancellation('paused', active.revision);
  expect(canceling).toMatchObject({ status: 'active', identifier: active.identifier, journal: { kind: 'cancel', nextStatus: 'paused' } });
  connections[0].close(); const reopened = await openHydrationDatabase(); expect(await reopened.read()).toEqual(canceling);
  expect(await reopened.confirmCancellation(canceling.revision)).toMatchObject({ status: 'paused', intervalMinutes: 60, identifier: null, journal: null });
});
it('preserves intervals on disable, rejects active edits and requires an explicit new activation generation', async () => {
  const db = await openHydrationDatabase(); const saved = await db.saveInterval(720, 0); const pending = await db.prepareActivation(saved.revision);
  if (pending.journal?.kind !== 'activate') throw new Error('Expected activation journal');
  const active = await db.confirmActivation(pending.journal.identifier, pending.revision);
  await expect(db.saveInterval(30, active.revision)).rejects.toThrow();
  const cancel = await db.prepareCancellation('disabled', active.revision); const disabled = await db.confirmCancellation(cancel.revision);
  expect(disabled).toMatchObject({ status: 'disabled', intervalMinutes: 720 });
  const changed = await db.saveInterval(30, disabled.revision); const next = await db.prepareActivation(changed.revision);
  expect(next.journal).not.toEqual(pending.journal); expect(next.status).toBe('disabled');
});
it('rejects stale and duplicate operations across independent database connections', async () => {
  const first = await openHydrationDatabase(); const second = await openHydrationDatabase();
  const changed = await second.saveInterval(30, 0); await expect(first.prepareActivation(0)).rejects.toThrow('Hydration configuration changed.');
  const pending = await first.prepareActivation(changed.revision);
  await expect(second.prepareActivation(changed.revision)).rejects.toThrow(); await expect(second.saveInterval(60, pending.revision)).rejects.toThrow();
  const takeover = await second.prepareCancellation('paused', pending.revision);
  expect(takeover.journal).toMatchObject({ kind: 'cancel', identifier: pending.journal?.identifier });
  if (pending.journal?.kind !== 'activate') throw new Error('Expected activation journal');
  await expect(first.confirmActivation(pending.journal.identifier, pending.revision)).rejects.toThrow();
  const recovered = await second.confirmCancellation(takeover.revision); await expect(first.confirmCancellation(pending.revision)).rejects.toThrow();
  expect(await first.read()).toEqual(recovered);
});
it.each(['commit', 'readback'])('rolls back failed %s without losing activation/cancellation recovery journal', async failure => {
  const db = await openHydrationDatabase(); const pending = await db.prepareActivation(0);
  if (pending.journal?.kind !== 'activate') throw new Error('Expected activation journal');
  if (failure === 'commit') failCommit = true; else failReadback = true;
  await expect(db.confirmActivation(pending.journal.identifier, pending.revision)).rejects.toThrow();
  failCommit = false; failReadback = false; expect(await db.read()).toEqual(pending);
  const active = await db.confirmActivation(pending.journal.identifier, pending.revision); const cancel = await db.prepareCancellation('disabled', active.revision);
  if (failure === 'commit') failCommit = true; else failReadback = true;
  await expect(db.confirmCancellation(cancel.revision)).rejects.toThrow(); failCommit = false; failReadback = false;
  expect(await db.read()).toEqual(cancel); expect((await db.confirmCancellation(cancel.revision)).status).toBe('disabled');
});
it('keeps its FIFO usable after invalid input and rejects malformed/corrupt data without resetting it', async () => {
  const db = await openHydrationDatabase(); await expect(db.saveInterval(29, 0)).rejects.toThrow();
  const saving = db.saveInterval(30, 0); const reading = db.read(); expect(await reading).toEqual(await saving);
  connections[0].exec(`UPDATE hydration_config SET journal='not JSON'`); await expect(db.read()).rejects.toThrow();
  await expect(openHydrationDatabase()).rejects.toThrow('Hydration storage unavailable.');
  expect(connections[0].prepare('SELECT journal FROM hydration_config').get()).toEqual({ journal: 'not JSON' });
});
it('rejects future schema, missing v1 tables and revision overflow without recreating or erasing data', async () => {
  const db = await openHydrationDatabase(); const saved = await db.saveInterval(120, 0);
  connections[0].exec('PRAGMA user_version=3'); await expect(openHydrationDatabase()).rejects.toThrow('Hydration storage unavailable.');
  await expect(db.read()).rejects.toThrow(); await expect(db.saveQuietWindow(null, saved.revision)).rejects.toThrow();
  expect(connections[0].prepare('SELECT interval_minutes FROM hydration_config').get()).toEqual({ interval_minutes: 120 });
  connections[0].exec('PRAGMA user_version=2'); expect(await db.read()).toEqual(saved);
  connections[0].prepare('UPDATE hydration_config SET revision=?').run(Number.MAX_SAFE_INTEGER);
  await expect(db.prepareActivation(Number.MAX_SAFE_INTEGER)).rejects.toThrow(); expect((await db.read()).intervalMinutes).toBe(120);
  connections[0].exec('DROP TABLE hydration_config; PRAGMA user_version=1;'); await expect(openHydrationDatabase()).rejects.toThrow('Hydration storage unavailable.');
  expect(connections[0].prepare("SELECT name FROM sqlite_master WHERE name='hydration_config'").all()).toEqual([]);
});
function seedV1({ revision = 0, intervalMinutes = 120, status = 'disabled', identifier = null, journal = null }: {
  revision?: number; intervalMinutes?: number; status?: HydrationConfig['status']; identifier?: string | null; journal?: HydrationJournal | null;
} = {}) {
  const sql = new DatabaseSync(join(directory, 'tear-hydration-reminders.db')); connections.push(sql);
  sql.exec(`CREATE TABLE hydration_config (
    id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL CHECK(revision>=0),
    interval_minutes INTEGER NOT NULL CHECK(interval_minutes BETWEEN 30 AND 720),
    status TEXT NOT NULL CHECK(status IN ('disabled','paused','active')), identifier TEXT, journal TEXT
  ); PRAGMA user_version=1;`);
  sql.prepare('INSERT INTO hydration_config VALUES (1,?,?,?,?,?)').run(revision, intervalMinutes, status, identifier, journal ? JSON.stringify(journal) : null);
  return sql;
}
const quiet = { startMinute: 1320, endMinute: 420 };
function batch(generation: number) { return createDailyHydrationReceipt(generation, 60, quiet, 'UTC', 100000,
  [{ hour: 8, minute: 0 }, { hour: 9, minute: 0 }]); }
it.each([
  { status: 'disabled' as const, revision: 0, identifier: null, journal: null },
  { status: 'active' as const, revision: 2, identifier: 'tear-hydration-v1-1', journal: null },
  { status: 'disabled' as const, revision: 1, identifier: null, journal: { kind: 'activate' as const, identifier: 'tear-hydration-v1-1' } },
  { status: 'active' as const, revision: 3, identifier: 'tear-hydration-v1-1', journal: { kind: 'cancel' as const, nextStatus: 'disabled' as const, identifier: 'tear-hydration-v1-1' } },
])('migrates v1 state $status/revision$revision while preserving interval and exact legacy pending/active targets', async original => {
  const sql = seedV1(original); const db = await openHydrationDatabase(); const migrated = await db.read();
  expect(migrated).toMatchObject({ ...original, intervalMinutes: 120, quietWindow: null });
  expect(sql.prepare('PRAGMA user_version').get()).toEqual({ user_version: 2 });
  if (original.identifier) expect(migrated.receipt?.entries).toEqual([{ identifier: original.identifier, kind: 'interval', intervalMinutes: 120 }]);
  if (original.journal) expect(migrated.journal?.receipt?.entries[0].identifier).toBe(original.journal.identifier);
  expect(await (await openHydrationDatabase()).read()).toEqual(migrated);
});
it.each(['commit', 'readback'])('rolls back a failed migration %s without partially upgrading schema or changing legacy journal', async failure => {
  const journal = { kind: 'activate' as const, identifier: 'tear-hydration-v1-1' };
  const sql = seedV1({ revision: 1, journal }); if (failure === 'commit') failCommit = true; else failReadback = true;
  await expect(openHydrationDatabase()).rejects.toThrow('Hydration storage unavailable.');
  expect(sql.prepare('PRAGMA user_version').get()).toEqual({ user_version: 1 });
  expect(sql.prepare('SELECT revision,journal FROM hydration_config').get()).toEqual({ revision: 1, journal: JSON.stringify(journal) });
  expect(sql.prepare('PRAGMA table_info(hydration_config)').all().map(column => column.name)).not.toContain('quiet_window');
  failCommit = false; failReadback = false; expect((await (await openHydrationDatabase()).read()).journal?.receipt?.entries[0].identifier).toBe(journal.identifier);
});
it('rejects corrupt v1 journals and modern identities instead of inventing migration data', async () => {
  const sql = seedV1({ revision: 1, journal: { kind: 'activate', identifier: 'tear-hydration-v2-1-0' } });
  await expect(openHydrationDatabase()).rejects.toThrow(); expect(sql.prepare('PRAGMA user_version').get()).toEqual({ user_version: 1 });
  sql.exec("UPDATE hydration_config SET journal='not JSON'"); await expect(openHydrationDatabase()).rejects.toThrow();
  expect(sql.prepare('SELECT journal FROM hydration_config').get()).toEqual({ journal: 'not JSON' });
});
it('copies quiet drafts before FIFO work, saves only inactive settings and preserves them across reopen and interval edits', async () => {
  const db = await openHydrationDatabase(); const input = { ...quiet }; const saving = db.saveQuietWindow(input, 0); input.startMinute = 0;
  const saved = await saving; expect(saved.quietWindow).toEqual(quiet); expect(saved.status).toBe('disabled');
  await expect(db.saveQuietWindow({ startMinute: 0, endMinute: 0 }, saved.revision)).rejects.toThrow();
  await expect(db.saveQuietWindow(null, 0)).rejects.toThrow();
  const changed = await db.saveInterval(120, saved.revision); expect(changed.quietWindow).toEqual(quiet);
  const reopened = await openHydrationDatabase(); expect(await reopened.read()).toEqual(changed);
  const cleared = await reopened.saveQuietWindow(null, changed.revision); expect(cleared).toMatchObject({ intervalMinutes: 120, status: 'disabled', quietWindow: null });
});
it('requires all exact batch acknowledgements before active/cancelled state and captures mutable inputs before queuing', async () => {
  const db = await openHydrationDatabase(); const saved = await db.saveQuietWindow(quiet, 0);
  await expect(db.prepareActivation(saved.revision)).rejects.toThrow();
  const receipt = batch(2); const ids = receipt.entries.map(entry => entry.identifier);
  const writing = db.prepareActivation(saved.revision, receipt); receipt.entries[0].identifier = 'foreign';
  const pending = await writing; expect(pending.journal?.receipt?.entries.map(entry => entry.identifier)).toEqual(ids);
  for (const acknowledgement of [undefined, [ids[0]], [ids[0], ids[0]], [ids[0], 'foreign']]) {
    await expect(db.confirmActivation(ids[0], pending.revision, acknowledgement)).rejects.toThrow();
    expect(await db.read()).toEqual(pending);
  }
  const partial = [ids[0]]; const premature = db.confirmActivation(ids[0], pending.revision, partial); partial.push(ids[1]);
  await expect(premature).rejects.toThrow();
  const confirmed = [...ids]; const activating = db.confirmActivation(ids[0], pending.revision, confirmed); confirmed.pop();
  const active = await activating; expect(active.status).toBe('active'); expect(active.receipt?.entries).toHaveLength(2);
  await expect(db.saveQuietWindow(null, active.revision)).rejects.toThrow(); await expect(db.saveInterval(30, active.revision)).rejects.toThrow();
  const cancel = await db.prepareCancellation('paused', active.revision);
  await expect(db.confirmCancellation(cancel.revision)).rejects.toThrow(); await expect(db.confirmCancellation(cancel.revision, [ids[0]])).rejects.toThrow();
  expect(await db.read()).toEqual(cancel); const paused = await db.confirmCancellation(cancel.revision, ids);
  expect(paused).toMatchObject({ status: 'paused', quietWindow: quiet, identifier: null, receipt: null, journal: null });
});
it('takes over a pending batch across connections without allowing an old confirmation to resurrect it', async () => {
  const first = await openHydrationDatabase(); const saved = await first.saveQuietWindow(quiet, 0);
  const receipt = batch(2); const ids = receipt.entries.map(entry => entry.identifier);
  const pending = await first.prepareActivation(saved.revision, receipt); const second = await openHydrationDatabase();
  const takeover = await second.prepareCancellation('paused', pending.revision);
  expect(takeover.journal?.receipt).toEqual(pending.journal?.receipt);
  await expect(first.confirmActivation(ids[0], pending.revision, ids)).rejects.toThrow();
  const paused = await second.confirmCancellation(takeover.revision, ids);
  const next = await first.prepareActivation(paused.revision, batch(paused.revision + 1));
  await expect(first.confirmActivation(ids[0], pending.revision, ids)).rejects.toThrow(); expect(await second.read()).toEqual(next);
});
it.each(['commit', 'readback'])('preserves the full batch journal after failed %s of confirmation or cancellation', async failure => {
  const db = await openHydrationDatabase(); const saved = await db.saveQuietWindow(quiet, 0); const receipt = batch(2);
  const ids = receipt.entries.map(entry => entry.identifier); const pending = await db.prepareActivation(saved.revision, receipt);
  if (failure === 'commit') failCommit = true; else failReadback = true;
  await expect(db.confirmActivation(ids[0], pending.revision, ids)).rejects.toThrow(); failCommit = false; failReadback = false;
  expect(await db.read()).toEqual(pending); const active = await db.confirmActivation(ids[0], pending.revision, ids);
  const cancel = await db.prepareCancellation('disabled', active.revision);
  if (failure === 'commit') failCommit = true; else failReadback = true;
  await expect(db.confirmCancellation(cancel.revision, ids)).rejects.toThrow(); failCommit = false; failReadback = false;
  expect(await db.read()).toEqual(cancel); expect((await db.confirmCancellation(cancel.revision, ids)).quietWindow).toEqual(quiet);
});
it('refuses missing or corrupted schema2 receipts rather than reconstructing confirmed native state', async () => {
  const db = await openHydrationDatabase(); const pending = await db.prepareActivation(0);
  if (pending.journal?.kind !== 'activate') throw new Error('Expected journal');
  await db.confirmActivation(pending.journal.identifier, pending.revision);
  connections[0].exec('UPDATE hydration_config SET receipt=NULL'); await expect(db.read()).rejects.toThrow();
  await expect(openHydrationDatabase()).rejects.toThrow();
  connections[0].exec(`UPDATE hydration_config SET status='disabled',identifier=NULL,revision=1,
    journal='{"kind":"activate","identifier":"tear-hydration-v1-1","receipt":0}'`);
  await expect(db.read()).rejects.toThrow();
  expect(connections[0].prepare('SELECT receipt FROM hydration_config').get()).toEqual({ receipt: null });
});
it('keeps other tool databases intact while persisting quiet settings and batch recovery records offline', async () => {
  const other = new DatabaseSync(join(directory, 'tear-transition-timer.db')); connections.push(other);
  other.exec("CREATE TABLE sentinel(value TEXT); INSERT INTO sentinel VALUES ('synthetic timer'); PRAGMA user_version=88;");
  const offline = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline synthetic'));
  try {
    const db = await openHydrationDatabase(); const saved = await db.saveQuietWindow(quiet, 0);
    const pending = await db.prepareActivation(saved.revision, batch(2));
    expect(await (await openHydrationDatabase()).read()).toEqual(pending);
    expect(other.prepare('SELECT * FROM sentinel').all()).toEqual([{ value: 'synthetic timer' }]);
    expect(other.prepare('PRAGMA user_version').get()).toEqual({ user_version: 88 }); expect(offline).not.toHaveBeenCalled();
  } finally { offline.mockRestore(); }
});

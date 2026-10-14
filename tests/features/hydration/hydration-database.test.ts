/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { openHydrationDatabase } from '../../../src/features/hydration/hydration-database';
import { initialHydrationConfig } from '../../../src/features/hydration/hydration-model';
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
  connections[0].exec('PRAGMA user_version=2'); await expect(openHydrationDatabase()).rejects.toThrow('Hydration storage unavailable.');
  expect(await db.read()).toEqual(saved); connections[0].exec('PRAGMA user_version=1');
  connections[0].prepare('UPDATE hydration_config SET revision=?').run(Number.MAX_SAFE_INTEGER);
  await expect(db.prepareActivation(Number.MAX_SAFE_INTEGER)).rejects.toThrow(); expect((await db.read()).intervalMinutes).toBe(120);
  connections[0].exec('DROP TABLE hydration_config'); await expect(openHydrationDatabase()).rejects.toThrow('Hydration storage unavailable.');
  expect(connections[0].prepare("SELECT name FROM sqlite_master WHERE name='hydration_config'").all()).toEqual([]);
});

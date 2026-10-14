/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { createHydrationController } from '../../../src/features/hydration/hydration-controller';
import { openHydrationDatabase } from '../../../src/features/hydration/hydration-database';
import { ownedHydrationIdentifier } from '../../../src/features/hydration/hydration-model';
import type { HydrationEngine, HydrationSchedule, HydrationOwned } from '../../../src/features/hydration/expo-hydration-engine';
import { createDailyHydrationReceipt } from '../../../src/features/hydration/hydration-receipt';
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
let directory: string; let connections: DatabaseSync[]; let failCommit: boolean;
let native: Map<string, number>; const controllers: ReturnType<typeof createHydrationController>[] = [];
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(yes => { resolve = yes; }); return { promise, resolve }; }
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'tear-hydration-controller-')); connections = []; failCommit = false; native = new Map();
  jest.mocked(openDatabaseAsync).mockImplementation(async name => {
    const sql = new DatabaseSync(join(directory, name)); connections.push(sql);
    const adapter = {
      execAsync: async (statement: string) => sql.exec(statement),
      runAsync: async (statement: string, ...params: (string | number | null)[]) => sql.prepare(statement).run(...params),
      getAllAsync: async (statement: string) => sql.prepare(statement).all(), closeAsync: async () => sql.close(),
      withExclusiveTransactionAsync: async (operation: (tx: SQLiteDatabase) => Promise<void>) => {
        sql.exec('BEGIN'); try { await operation(adapter as unknown as SQLiteDatabase); if (failCommit) throw new Error('synthetic commit'); sql.exec('COMMIT'); }
        catch (error) { sql.exec('ROLLBACK'); throw error; }
      },
    }; return adapter as unknown as SQLiteDatabase;
  });
});
afterEach(() => { controllers.splice(0).forEach(controller => controller.dispose()); for (const sql of connections) try { sql.close(); } catch {} rmSync(directory, { recursive: true, force: true }); });
async function harness() {
  const database = await openHydrationDatabase(); let owned = () => null as HydrationOwned; let received = (_identifier: string, _date: number) => {};
  const remove = jest.fn(); let time = 10000;
  const engine: HydrationEngine = {
    planDaily: jest.fn(async () => { throw new Error('Daily boundary not enabled in this interval harness'); }),
    scheduleDaily: jest.fn(async () => { throw new Error('Daily boundary not enabled in this interval harness'); }),
    verifyDaily: jest.fn(async () => { throw new Error('Daily boundary not enabled in this interval harness'); }),
    permission: jest.fn(async () => true), requestPermission: jest.fn(async () => true),
    inspect: jest.fn(async () => ({ scheduled: [...native].filter(([id]) => ownedHydrationIdentifier(id)).map(([identifier, intervalMinutes]) => ({ identifier, intervalMinutes })), presented: [] })),
    schedule: jest.fn(async (entry: HydrationSchedule) => { native.set(entry.identifier, entry.intervalMinutes); }),
    cancel: jest.fn(async (identifier: string) => { native.delete(identifier); }),
    onReceived: jest.fn((current, callback) => { owned = current; received = callback; return remove; }), dispose: jest.fn(),
  };
  const factory = jest.fn(() => engine);
  const controller = createHydrationController({ database: async () => database, factory, clock: () => time }); controllers.push(controller);
  return { database, engine, factory, controller, remove, time: (value: number) => { time = value; },
    revision: () => controller.getSnapshot().config!.revision,
    emit(identifier: string, date: number) { const ids = owned(); if (Array.isArray(ids) ? ids.includes(identifier) : identifier === ids) received(identifier, date); },
  };
}
it('loads disabled configuration without importing native capability, requesting permission or scheduling', async () => {
  const h = await harness(); await h.controller.reload(); expect(h.factory).not.toHaveBeenCalled();
  expect(h.controller.getSnapshot()).toMatchObject({ confirmed: true, config: { status: 'disabled', intervalMinutes: 60 }, error: null });
  expect(await h.controller.save(120, h.revision())).toBe(true); expect(h.factory).not.toHaveBeenCalled();
});
it('does not silently use a repeating interval when native daily capability is unavailable', async () => {
  const h = await harness(); await h.controller.reload(); await h.database.saveQuietWindow({ startMinute: 1320, endMinute: 420 }, h.revision());
  await h.controller.reload(); expect(await h.controller.activate(h.revision())).toBe(false);
  expect(h.engine.schedule).not.toHaveBeenCalled(); expect(h.engine.requestPermission).toHaveBeenCalledTimes(1);
  expect(h.engine.planDaily).toHaveBeenCalledTimes(1);
  expect(h.controller.getSnapshot().config).toMatchObject({ status: 'disabled', quietWindow: { startMinute: 1320, endMinute: 420 } });
});
const dailyQuiet = { startMinute: 1320, endMinute: 420 };
const dailyTime = new Date(2026, 9, 14, 12).getTime();
async function quietHarness() {
  const h = await harness(); h.time(dailyTime); await h.controller.reload();
  expect(await h.controller.saveQuiet(dailyQuiet, h.revision())).toBe(true);
  jest.mocked(h.engine.planDaily).mockImplementation(async (generation, intervalMinutes, quiet) =>
    createDailyHydrationReceipt(generation, intervalMinutes, quiet, new Intl.DateTimeFormat().resolvedOptions().timeZone,
      dailyTime + intervalMinutes * 60000, [{ hour: 13, minute: 0 }, { hour: 14, minute: 0 }]));
  jest.mocked(h.engine.scheduleDaily).mockImplementation(async (receipt, intervalMinutes) => {
    for (const item of receipt.entries) native.set(item.identifier, intervalMinutes);
    return receipt.entries.map(item => item.identifier);
  });
  jest.mocked(h.engine.verifyDaily).mockImplementation(async receipt => {
    if (receipt.entries.some(item => !native.has(item.identifier))) throw new Error('Missing synthetic native request');
    return receipt.entries.map(item => item.identifier);
  });
  return h;
}
it('records the whole daily plan before scheduling and publishes active only after all native IDs and DB confirm', async () => {
  const h = await quietHarness(); const gate = deferred<void>();
  jest.mocked(h.engine.scheduleDaily).mockImplementationOnce(async receipt => {
    expect(await h.database.read()).toMatchObject({ status: 'disabled', journal: { kind: 'activate', receipt } });
    await gate.promise; for (const item of receipt.entries) native.set(item.identifier, 60); return receipt.entries.map(item => item.identifier);
  });
  const activation = h.controller.activate(h.revision()); await new Promise(resolve => setTimeout(resolve, 0));
  expect(h.controller.getSnapshot()).toMatchObject({ busy: true, config: { status: 'disabled' } });
  expect(await h.controller.activate(h.revision())).toBe(false); gate.resolve(); expect(await activation).toBe(true);
  expect(h.engine.schedule).not.toHaveBeenCalled(); expect(h.controller.getSnapshot()).toMatchObject({ confirmed: true, config: { status: 'active', journal: null } });
  expect(h.controller.getSnapshot().config!.receipt!.entries).toHaveLength(2);
  expect(await h.controller.saveQuiet(null, h.revision())).toBe(false); expect(native.size).toBe(2);
});
it('rejects partial daily acknowledgement and compensates every operation ID before recovering inactive', async () => {
  const h = await quietHarness();
  jest.mocked(h.engine.scheduleDaily).mockImplementationOnce(async receipt => {
    for (const item of receipt.entries) native.set(item.identifier, 60); return [receipt.entries[0].identifier];
  });
  expect(await h.controller.activate(h.revision())).toBe(false); expect(native.size).toBe(0);
  expect(await h.database.read()).toMatchObject({ status: 'paused', journal: null, quietWindow: dailyQuiet });
  expect(h.engine.cancel).toHaveBeenCalledTimes(2);
});
it('preserves a durable batch journal when active commit and compensation commit fail', async () => {
  const h = await quietHarness();
  jest.mocked(h.engine.scheduleDaily).mockImplementationOnce(async receipt => {
    for (const item of receipt.entries) native.set(item.identifier, 60); failCommit = true; return receipt.entries.map(item => item.identifier);
  });
  expect(await h.controller.activate(h.revision())).toBe(false); expect(native.size).toBe(0);
  expect(await h.database.read()).toMatchObject({ status: 'disabled', journal: { kind: 'activate', receipt: { entries: expect.any(Array) } } });
  failCommit = false; await h.controller.reload(); expect(await h.database.read()).toMatchObject({ status: 'paused', journal: null });
});
it('keeps a batch cancel journal and possible alarms on native failure then retries only owned IDs', async () => {
  const h = await quietHarness(); await h.controller.activate(h.revision()); native.set('tear-transition-1-5-2', 5);
  jest.mocked(h.engine.cancel).mockRejectedValueOnce(new Error('Synthetic cancellation error'));
  expect(await h.controller.pause(h.revision())).toBe(false);
  expect(await h.database.read()).toMatchObject({ status: 'active', journal: { kind: 'cancel' } });
  await h.controller.reload(); expect(h.controller.getSnapshot()).toMatchObject({ confirmed: true, config: { status: 'paused', journal: null } });
  expect([...native.keys()]).toEqual(['tear-transition-1-5-2']); expect(h.engine.cancel).not.toHaveBeenCalledWith('tear-transition-1-5-2');
});
it('restores a verified daily batch without scheduling and pauses divergence without automatic resume', async () => {
  const h = await quietHarness(); await h.controller.activate(h.revision()); jest.clearAllMocks();
  await h.controller.reload(); expect(h.controller.getSnapshot().config!.status).toBe('active');
  expect(h.engine.verifyDaily).toHaveBeenCalledTimes(1); expect(h.engine.requestPermission).not.toHaveBeenCalled(); expect(h.engine.scheduleDaily).not.toHaveBeenCalled();
  jest.mocked(h.engine.verifyDaily).mockRejectedValueOnce(new Error('Synthetic timezone/next-date divergence'));
  await h.controller.reload(); expect(h.controller.getSnapshot().config!.status).toBe('paused'); expect(native.size).toBe(0);
  expect(h.engine.scheduleDaily).not.toHaveBeenCalled(); expect(h.engine.requestPermission).not.toHaveBeenCalled();
});
it('compensates a late whole batch after dispose and does not erase another owners newer batch', async () => {
  const old = await quietHarness(); const gate = deferred<void>(); let oldIds: string[] = [];
  jest.mocked(old.engine.scheduleDaily).mockImplementationOnce(async receipt => {
    oldIds = receipt.entries.map(item => item.identifier); await gate.promise;
    for (const id of oldIds) native.set(id, 60); return oldIds;
  });
  const activation = old.controller.activate(old.revision()); await new Promise(resolve => setTimeout(resolve, 0));
  const next = await quietHarness(); await next.controller.activate(next.revision()); const nextIds = next.controller.getSnapshot().config!.receipt!.entries.map(item => item.identifier);
  old.controller.dispose(); gate.resolve(); expect(await activation).toBe(false);
  expect(oldIds.every(id => !native.has(id))).toBe(true); expect(nextIds.every(id => native.has(id))).toBe(true);
  expect((await next.database.read()).receipt!.entries.map(item => item.identifier)).toEqual(nextIds);
});
it('accepts foreground events from every current batch ID only outside silence at delivery and current time', async () => {
  const h = await quietHarness(); await h.controller.activate(h.revision()); const ids = h.controller.getSnapshot().config!.receipt!.entries.map(item => item.identifier);
  h.time(dailyTime + 3600000); h.emit(ids[1], dailyTime + 3600000); expect(h.controller.getSnapshot().banner).toBe(true);
  h.controller.dismissBanner(); const silent = new Date(2026, 9, 14, 23).getTime(); h.time(silent);
  h.emit(ids[0], silent); expect(h.controller.getSnapshot().banner).toBe(false);
  const following = new Date(2026, 9, 15, 8).getTime(); h.time(following); h.emit(ids[0], silent); expect(h.controller.getSnapshot().banner).toBe(false);
  h.emit(ids[0], following); expect(h.controller.getSnapshot().banner).toBe(true); h.controller.dismissBanner();
  h.time(NaN); h.emit(ids[1], following + 1); expect(h.controller.getSnapshot().banner).toBe(false);
});
it('pauses a previously confirmed batch on a regressive controller clock without request or automatic scheduling', async () => {
  const h = await quietHarness(); await h.controller.activate(h.revision()); h.time(dailyTime - 1);
  jest.clearAllMocks(); await h.controller.reload();
  expect(h.controller.getSnapshot().config!.status).toBe('paused'); expect(native.size).toBe(0);
  expect(h.engine.requestPermission).not.toHaveBeenCalled(); expect(h.engine.scheduleDaily).not.toHaveBeenCalled();
  expect(await h.controller.activate(h.revision())).toBe(false); expect(h.engine.requestPermission).not.toHaveBeenCalled();
});
it('recovers an inactive leftover only on a failed-operation reconciliation without scheduling or touching foreign alarms', async () => {
  const h = await quietHarness(); const oldId = 'tear-hydration-v1-1'; native.set(oldId, 60); native.set('tear-transition-1-5-2', 5);
  jest.mocked(h.engine.planDaily).mockRejectedValueOnce(new Error('Synthetic leftover owned request'));
  expect(await h.controller.activate(h.revision())).toBe(false); expect(h.controller.getSnapshot().config!.status).toBe('disabled');
  jest.clearAllMocks(); await h.controller.reload();
  expect(h.controller.getSnapshot()).toMatchObject({ confirmed: true, config: { status: 'paused', journal: null, quietWindow: dailyQuiet } });
  expect([...native.keys()]).toEqual(['tear-transition-1-5-2']); expect(h.engine.requestPermission).not.toHaveBeenCalled(); expect(h.engine.scheduleDaily).not.toHaveBeenCalled();
});
it('refuses cancellation of a newer v2 generation before touching any existing older schedule', async () => {
  const h = await harness(); await h.controller.reload(); await h.controller.activate(h.revision());
  const current = h.controller.getSnapshot().config!.identifier!; native.set('tear-hydration-v2-99-0', 60);
  expect(await h.controller.pause(h.revision())).toBe(false); expect(h.engine.cancel).not.toHaveBeenCalled();
  expect(native.has(current)).toBe(true); expect(native.has('tear-hydration-v2-99-0')).toBe(true);
  expect(h.controller.getSnapshot()).toMatchObject({ confirmed: false, error: 'operation', config: { status: 'active', journal: { kind: 'cancel' } } });
});
it('publishes active only after native scheduling and database confirmation and rejects duplicate commands', async () => {
  const h = await harness(); await h.controller.reload(); const gate = deferred<void>(); let entry!: HydrationSchedule;
  jest.mocked(h.engine.schedule).mockImplementationOnce(async input => { entry = input; await gate.promise; native.set(input.identifier, input.intervalMinutes); });
  const activation = h.controller.activate(h.revision()); await new Promise(resolve => setTimeout(resolve, 0));
  expect(h.controller.getSnapshot()).toMatchObject({ busy: true, config: { status: 'disabled' } });
  expect((await h.database.read()).journal).toMatchObject({ kind: 'activate', identifier: entry.identifier });
  expect(await h.controller.activate(h.revision())).toBe(false); gate.resolve(); expect(await activation).toBe(true);
  expect(h.controller.getSnapshot()).toMatchObject({ busy: false, confirmed: true, config: { status: 'active', identifier: entry.identifier, journal: null } });
});
it('preserves interval on pause/disable, never cancels foreign requests and requires a new human activation', async () => {
  const h = await harness(); await h.controller.reload(); await h.controller.save(30, h.revision()); await h.controller.activate(h.revision());
  native.set('tear-transition-1-5-2', 5); const first = h.controller.getSnapshot().config!.identifier;
  expect(await h.controller.pause(h.revision())).toBe(true); expect(native.has('tear-transition-1-5-2')).toBe(true);
  expect(h.controller.getSnapshot().config).toMatchObject({ status: 'paused', intervalMinutes: 30 });
  await h.controller.activate(h.revision()); expect(h.controller.getSnapshot().config!.identifier).not.toBe(first);
  await h.controller.disable(h.revision()); expect(h.controller.getSnapshot().config).toMatchObject({ status: 'disabled', intervalMinutes: 30 });
  expect(h.engine.requestPermission).toHaveBeenCalledTimes(2); expect(h.engine.cancel).not.toHaveBeenCalledWith('tear-transition-1-5-2');
});
it('keeps denied permission inactive and permits explicit retry without losing the interval', async () => {
  const h = await harness(); await h.controller.reload(); await h.controller.save(120, h.revision());
  jest.mocked(h.engine.requestPermission).mockResolvedValueOnce(false);
  expect(await h.controller.activate(h.revision())).toBe(false); expect(h.controller.getSnapshot()).toMatchObject({ error: 'permission', confirmed: true, config: { status: 'disabled', intervalMinutes: 120 } });
  expect(h.engine.schedule).not.toHaveBeenCalled(); expect(await h.controller.activate(h.revision())).toBe(true);
});
it('cancels a late permission result before creating a journal or scheduling', async () => {
  const h = await harness(); await h.controller.reload(); const gate = deferred<boolean>(); jest.mocked(h.engine.requestPermission).mockReturnValueOnce(gate.promise);
  const activation = h.controller.activate(h.revision()); await new Promise(resolve => setTimeout(resolve, 0)); h.controller.cancelPending(); gate.resolve(true);
  expect(await activation).toBe(false); expect(h.engine.schedule).not.toHaveBeenCalled(); expect((await h.database.read()).journal).toBeNull();
  expect(h.controller.getSnapshot()).toMatchObject({ busy: false, error: null, config: { status: 'disabled' } });
});
it('compensates an in-flight schedule after disposal without publishing or leaving active state', async () => {
  const h = await harness(); await h.controller.reload(); const gate = deferred<void>();
  jest.mocked(h.engine.schedule).mockImplementationOnce(async entry => { await gate.promise; native.set(entry.identifier, entry.intervalMinutes); });
  const activation = h.controller.activate(h.revision()); await new Promise(resolve => setTimeout(resolve, 0));
  const listener = jest.fn(); h.controller.subscribe(listener); h.controller.dispose(); gate.resolve(); expect(await activation).toBe(false);
  expect(listener).not.toHaveBeenCalled(); expect(native.size).toBe(0); expect(await h.database.read()).toMatchObject({ status: 'paused', journal: null });
  expect(h.engine.dispose).toHaveBeenCalledTimes(1); expect(h.remove).toHaveBeenCalledTimes(1);
});
it('keeps a recovery journal when native cancellation fails instead of claiming pause', async () => {
  const h = await harness(); await h.controller.reload(); await h.controller.activate(h.revision());
  jest.mocked(h.engine.cancel).mockRejectedValueOnce(new Error('synthetic private cancellation'));
  expect(await h.controller.pause(h.revision())).toBe(false); expect(h.controller.getSnapshot()).toMatchObject({ confirmed: false, error: 'operation', config: { status: 'active', journal: { kind: 'cancel', nextStatus: 'paused' } } });
  expect(native.size).toBe(1); await h.controller.reload(); expect(native.size).toBe(0);
  expect(h.controller.getSnapshot()).toMatchObject({ confirmed: true, config: { status: 'paused', journal: null } });
});
it('compensates native work when the active commit fails and recovers the durable journal explicitly', async () => {
  const h = await harness(); await h.controller.reload();
  jest.mocked(h.engine.schedule).mockImplementationOnce(async entry => { native.set(entry.identifier, entry.intervalMinutes); failCommit = true; });
  expect(await h.controller.activate(h.revision())).toBe(false); expect(native.size).toBe(0);
  expect(await h.database.read()).toMatchObject({ status: 'disabled', journal: { kind: 'activate' } });
  failCommit = false; await h.controller.reload(); expect(h.controller.getSnapshot()).toMatchObject({ confirmed: true, config: { status: 'paused', journal: null } });
  expect(h.engine.schedule).toHaveBeenCalledTimes(1); expect(h.engine.requestPermission).toHaveBeenCalledTimes(1);
});
it('restores only a matching confirmed receipt and pauses missing/revoked schedules without auto-rescheduling', async () => {
  const h = await harness(); await h.controller.reload(); await h.controller.activate(h.revision()); h.controller.dispose();
  const restored = await harness(); await restored.controller.reload(); expect(restored.controller.getSnapshot()).toMatchObject({ confirmed: true, config: { status: 'active' } });
  expect(restored.engine.requestPermission).not.toHaveBeenCalled(); expect(restored.engine.schedule).not.toHaveBeenCalled();
  native.clear(); await restored.controller.reload(); expect(restored.controller.getSnapshot().config!.status).toBe('paused');
  expect(restored.engine.schedule).not.toHaveBeenCalled();
});
it('does not overwrite another owner cancellation journal or erase its newer active schedule after a late result', async () => {
  const old = await harness(); await old.controller.reload(); const gate = deferred<void>(); let oldId = '';
  jest.mocked(old.engine.schedule).mockImplementationOnce(async entry => { oldId = entry.identifier; await gate.promise; native.set(entry.identifier, entry.intervalMinutes); });
  const activation = old.controller.activate(old.revision()); await new Promise(resolve => setTimeout(resolve, 0));
  const current = await harness(); await current.controller.reload(); expect(current.controller.getSnapshot().config!.status).toBe('paused');
  await current.controller.activate(current.revision()); const currentId = current.controller.getSnapshot().config!.identifier!;
  gate.resolve(); expect(await activation).toBe(false); expect(native.has(oldId)).toBe(false); expect(native.has(currentId)).toBe(true);
  expect((await current.database.read()).identifier).toBe(currentId);
});
it('shows only new current foreground events without background replay, stale delivery or a retained history', async () => {
  const h = await harness(); await h.controller.reload(); await h.controller.activate(h.revision()); const id = h.controller.getSnapshot().config!.identifier!;
  h.emit(id, 11000); expect(h.controller.getSnapshot().banner).toBe(true); h.controller.dismissBanner(); h.emit(id, 11000); expect(h.controller.getSnapshot().banner).toBe(false);
  h.controller.foreground(false); h.emit(id, 12000); h.time(13000); h.controller.foreground(true); h.emit(id, 12000); expect(h.controller.getSnapshot().banner).toBe(false);
  h.emit(id, 14000); expect(h.controller.getSnapshot().banner).toBe(true); await h.controller.pause(h.revision()); h.emit(id, 15000); expect(h.controller.getSnapshot().banner).toBe(false);
  expect(JSON.stringify(await h.database.read())).not.toContain('14000');
});

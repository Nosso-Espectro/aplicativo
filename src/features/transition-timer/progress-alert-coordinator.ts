import type { ProgressAlertEngine } from './expo-progress-alert-engine';
import type { openProgressAlertDatabase, ProgressAlertSnapshot } from './progress-alert-database';
import { normalizedProgressAlerts, type ProgressAlertPreferences } from './progress-alerts';
import { progressAlertReconciliation } from './progress-alert-reconciliation';

type Store = Awaited<ReturnType<typeof openProgressAlertDatabase>>;
const unavailable = () => new Error('Timer alerts unavailable.');

export function createProgressAlertCoordinator(store: Store, createEngine: () => ProgressAlertEngine,
  clock: () => number = Date.now) {
  let disposed = false;
  let engine: ProgressAlertEngine | null = null;
  let snapshot: ProgressAlertSnapshot | null = null;
  let queue: Promise<unknown> = Promise.resolve();
  function alive() { if (disposed) throw unavailable(); }
  function capability() { alive(); return engine ??= createEngine(); }
  function enqueue<T>(operation: () => Promise<T>) {
    const next = queue.then(async () => { alive(); return operation(); }).catch(() => { throw unavailable(); });
    queue = next.catch(() => undefined); return next;
  }
  async function read() { const saved = await store.read(); alive(); snapshot = saved; return saved; }
  async function unchanged(expected: ProgressAlertSnapshot) {
    const saved = await read();
    if (saved.revision !== expected.revision) throw unavailable();
    return saved;
  }
  async function cancelOwned(current: ProgressAlertSnapshot) {
    for (const entry of current.pending) {
      await unchanged(current);
      await capability().cancel(entry);
      await unchanged(current);
      current = await store.forget(entry.identifier, current.revision); alive(); snapshot = current;
    }
    return current;
  }
  async function reconcile() {
    let current = await read();
    const observed = current.pending.length ? await capability().inspect(current.pending) : { scheduled: [], presented: [] };
    await unchanged(current);
    let plan = progressAlertReconciliation(current, clock(), observed);
    if (plan.elapsed.length) {
      current = await store.consumeElapsed(clock(), current.revision); alive(); snapshot = current;
    }
    for (const entry of plan.consumedOwned) {
      current = await store.consumeOwned(entry.identifier, current.revision); alive(); snapshot = current;
    }
    plan = progressAlertReconciliation(current, clock(), observed);
    for (const entry of plan.cancel) {
      await unchanged(current); await capability().cancel(entry); await unchanged(current);
      current = await store.forget(entry.identifier, current.revision); alive(); snapshot = current;
    }
    plan = progressAlertReconciliation(current, clock(), observed);
    if (!plan.reserve.length && !plan.scheduleExisting.length && !current.pending.length) return current;
    // Permission is queried only for previously confirmed system-alert preferences.
    if (!await capability().permission()) {
      await unchanged(current); await cancelOwned(current); throw unavailable();
    }
    await unchanged(current);
    for (const mark of plan.reserve) {
      current = await store.reserve(mark.minutes, mark.atMs, clock(), current.revision); alive(); snapshot = current;
    }
    const owned = progressAlertReconciliation(current, clock(), observed).scheduleExisting;
    for (const entry of owned) {
      await unchanged(current); await capability().schedule(entry);
      try { await unchanged(current); }
      catch {
        // A timer action may commit while the native scheduling RPC is pending.
        alive(); await capability().cancel(entry);
        const latest = await read();
        if (latest.pending.some(item => item.identifier === entry.identifier)) {
          snapshot = await store.forget(entry.identifier, latest.revision); alive();
        }
        throw unavailable();
      }
    }
    return current;
  }
  return {
    read: () => enqueue(read),
    reconcile: () => enqueue(reconcile),
    requestSystemPermission: () => enqueue(() => capability().requestPermission()),
    save: (input: ProgressAlertPreferences, expectedRevision: number, systemPermissionConfirmed = false) => {
      const preferences = normalizedProgressAlerts(input);
      return enqueue(async () => {
        let current = await read();
        if (current.revision !== expectedRevision) throw unavailable();
        if (preferences.systemNotifications && !current.preferences.systemNotifications) {
          if (!systemPermissionConfirmed || !await capability().permission()) throw unavailable();
          await unchanged(current);
        }
        current = await cancelOwned(current);
        current = await store.savePreferences(preferences, current.revision); alive(); snapshot = current;
        // Reconciliation errors do not turn a persisted preference into a false native-success signal.
        return reconcile();
      });
    },
    received: (identifier: string) => enqueue(async () => {
      const current = await read();
      const entry = current.pending.find(item => item.identifier === identifier);
      if (!entry || entry.sessionNumber !== current.sessionNumber) return current;
      snapshot = await store.consumeOwned(identifier, current.revision); alive();
      return reconcile();
    }),
    getSnapshot: () => snapshot,
    dispose: () => { if (disposed) return; disposed = true; engine?.dispose(); },
  };
}

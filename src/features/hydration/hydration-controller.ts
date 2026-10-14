import { createExpoHydrationEngine, type HydrationEngine } from './expo-hydration-engine';
import { openHydrationDatabase, type HydrationDatabase } from './hydration-database';
import { ownedHydrationIdentifier, type HydrationConfig } from './hydration-model';
import { hydrationReceiptGeneration, type HydrationReceipt } from './hydration-receipt';
import { isQuietAt, normalizeQuietWindow, type QuietWindow } from './quiet-hours';
export type HydrationState = {
  config: HydrationConfig | null; loading: boolean; busy: boolean; confirmed: boolean;
  error: 'storage' | 'permission' | 'operation' | null; banner: boolean;
};
type Intent = { canceled: boolean };
class PermissionDenied extends Error {}
export function createHydrationController({ database = openHydrationDatabase, factory = createExpoHydrationEngine, clock = Date.now }: {
  database?: () => Promise<HydrationDatabase>; factory?: () => HydrationEngine; clock?: () => number;
} = {}) {
  let state: HydrationState = { config: null, loading: true, busy: false, confirmed: false, error: null, banner: false };
  const listeners = new Set<() => void>();
  let clockFloor = -1;
  let disposed = false; let work = 0; let foreground = true; let enteredAt = readClock(); let receivedAt = -1;
  let dbPromise: Promise<HydrationDatabase> | null = null; let native: HydrationEngine | null = null;
  let unsubscribe: (() => void) | null = null; let intent: Intent | null = null;
  function readClock() {
    try {
      const value = clock();
      if (!Number.isSafeInteger(value) || value < 0 || value < clockFloor || !Number.isFinite(new Date(value).getTime())) return NaN;
      clockFloor = value; return value;
    } catch { return NaN; }
  }
  function update(patch: Partial<HydrationState>) { if (disposed) return; state = { ...state, ...patch }; listeners.forEach(listener => listener()); }
  function cleanup() {
    if (!disposed || work > 0) return;
    try { native?.dispose(); } catch { /* A detached capability cannot publish state. */ }
    native = null;
  }
  function db() {
    if (!dbPromise) dbPromise = database().catch(error => { dbPromise = null; throw error; });
    return dbPromise;
  }
  function engine() {
    if (!native) {
      if (disposed) throw new Error('Hydration owner unavailable.');
      const candidate = factory();
      try { unsubscribe = candidate.onReceived(() => state.confirmed && state.config?.status === 'active' && !state.busy && !state.config.journal
        ? state.config.receipt?.entries.map(entry => entry.identifier) ?? [] : [],
        (_identifier, date) => {
          if (disposed || !foreground || !Number.isSafeInteger(enteredAt) || date < enteredAt || date <= receivedAt) return;
          if (state.config?.quietWindow) {
            try {
              const now = readClock();
              if (now < enteredAt || date > now || isQuietAt(now, state.config.quietWindow) || isQuietAt(date, state.config.quietWindow)) return;
            } catch { return; }
          }
          receivedAt = date; update({ banner: true });
        }); native = candidate;
      } catch (error) { try { candidate.dispose(); } catch {} throw error; }
    }
    return native;
  }
  function alive(token: Intent) { return !disposed && !token.canceled; }
  async function cancelPrepared(storage: HydrationDatabase, prepared: HydrationConfig) {
    const capability = engine(); const observed = await capability.inspect();
    const target = prepared.journal?.receipt ?? prepared.receipt;
    const targets = target?.entries.map(entry => entry.identifier) ?? [];
    const ids = new Set([...observed.scheduled.map(entry => entry.identifier), ...observed.presented, ...targets]);
    // Recovery must not cancel a newer generation owned by another live controller.
    const owned = [...ids].filter(ownedHydrationIdentifier);
    if (owned.some(id => (hydrationReceiptGeneration(id) ?? Infinity) > prepared.revision)) throw new Error('Hydration ownership changed.');
    for (const id of owned) await capability.cancel(id);
    return storage.confirmCancellation(prepared.revision, targets);
  }
  async function recover(storage: HydrationDatabase, config: HydrationConfig, status: 'paused' | 'disabled') {
    const prepared = await storage.prepareCancellation(status, config.revision);
    return cancelPrepared(storage, prepared);
  }
  async function compensate(storage: HydrationDatabase, receipt: HydrationReceipt) {
    let failed = false;
    for (const entry of receipt.entries) try { await engine().cancel(entry.identifier); } catch { failed = true; }
    if (failed) throw new Error('Hydration cancellation unconfirmed.');
    const current = await storage.read();
    const identifier = receipt.entries[0].identifier;
    if ((!current.journal && current.identifier === identifier) || (current.journal?.kind === 'activate' && current.journal.identifier === identifier)) {
      const target = current.journal?.receipt ?? current.receipt;
      if (target?.generation !== receipt.generation || target.entries.length !== receipt.entries.length
        || target.entries.some((entry, index) => entry.identifier !== receipt.entries[index].identifier)) return current;
      const prepared = await storage.prepareCancellation('paused', current.revision);
      return storage.confirmCancellation(prepared.revision, receipt.entries.map(entry => entry.identifier));
    }
    return current;
  }
  async function reload() {
    if (disposed || state.busy) return;
    const reconcileInactive = state.error === 'operation' && native !== null;
    work++; update({ loading: true, busy: true, confirmed: false, error: null, banner: false });
    let storage: HydrationDatabase | null = null;
    try {
      storage = await db(); let config = await storage.read();
      if (disposed) return;
      if (config.journal) config = await recover(storage, config, config.journal.kind === 'cancel' ? config.journal.nextStatus : 'paused');
      else if (config.status === 'active') {
        const capability = engine(); const permission = await capability.permission(); const observed = await capability.inspect();
        if (disposed) return;
        let matching = observed.scheduled.length === 1 && observed.scheduled[0].identifier === config.identifier
          && observed.scheduled[0].intervalMinutes === config.intervalMinutes && observed.presented.every(id => id === config.identifier);
        if (config.quietWindow && config.receipt) {
          try {
            const ids = await capability.verifyDaily(config.receipt, config.intervalMinutes, config.quietWindow);
            matching = Number.isSafeInteger(readClock()) && ids.length === config.receipt.entries.length && new Set(ids).size === ids.length
              && config.receipt.entries.every(entry => ids.includes(entry.identifier)) && observed.presented.every(id => ids.includes(id));
          } catch { matching = false; }
        }
        if (!permission || !matching) config = await recover(storage, config, 'paused');
      } else if (reconcileInactive) {
        const observed = await engine().inspect();
        if (disposed) return;
        if (observed.scheduled.length || observed.presented.length) config = await recover(storage, config, 'paused');
      }
      update({ config, loading: false, busy: false, confirmed: true });
    } catch {
      let config = state.config;
      if (storage) try { config = await storage.read(); } catch {}
      update({ config, loading: false, busy: false, confirmed: false, error: storage ? 'operation' : 'storage' });
    } finally { work--; cleanup(); }
  }
  async function run(expectedRevision: number, operation: (storage: HydrationDatabase, config: HydrationConfig, token: Intent) => Promise<HydrationConfig>) {
    if (disposed || state.loading || state.busy || !state.config || state.config.revision !== expectedRevision) return false;
    const config = state.config; const token: Intent = { canceled: false }; intent = token;
    work++; update({ busy: true, error: null, banner: false });
    let storage: HydrationDatabase | null = null;
    try {
      storage = await db(); if (!alive(token)) return false;
      const saved = await operation(storage, config, token);
      update({ config: saved, confirmed: true, error: null }); return alive(token);
    } catch (error) {
      let config = state.config;
      if (storage) try { config = await storage.read(); } catch {}
      update({ config, confirmed: error instanceof PermissionDenied, error: error instanceof PermissionDenied ? 'permission' : storage ? 'operation' : 'storage' }); return false;
    } finally { if (intent === token) intent = null; update({ busy: false }); work--; cleanup(); }
  }
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    reload,
    save: (minutes: number, expectedRevision: number) => run(expectedRevision, (storage, _config, token) => {
      if (!alive(token)) throw new Error('Hydration intent canceled.'); return storage.saveInterval(minutes, expectedRevision);
    }),
    saveQuiet: (input: QuietWindow | null, expectedRevision: number) => {
      let quiet: QuietWindow | null;
      try { quiet = normalizeQuietWindow(input); } catch { return Promise.resolve(false); }
      return run(expectedRevision, (storage, _config, token) => {
        if (!alive(token)) throw new Error('Hydration intent canceled.'); return storage.saveQuietWindow(quiet, expectedRevision);
      });
    },
    activate: (expectedRevision: number) => run(expectedRevision, async (storage, config, token) => {
      if (config.status === 'active' || config.journal || !state.confirmed) throw new Error('Hydration configuration unavailable.');
      if (config.quietWindow && !Number.isSafeInteger(readClock())) throw new Error('Hydration clock unavailable.');
      const capability = engine(); const allowed = await capability.requestPermission();
      if (!alive(token)) return storage.read();
      if (!allowed) throw new PermissionDenied();
      const plan = config.quietWindow ? await capability.planDaily(expectedRevision + 1, config.intervalMinutes, config.quietWindow) : undefined;
      if (!alive(token)) return storage.read();
      const prepared = await storage.prepareActivation(expectedRevision, plan);
      if (prepared.journal?.kind !== 'activate' || !prepared.journal.receipt) throw new Error('Hydration journal unavailable.');
      const identifier = prepared.journal.identifier;
      const receipt = prepared.journal.receipt;
      try {
        if (!alive(token)) return compensate(storage, receipt);
        let confirmed: string[];
        if (prepared.quietWindow) confirmed = await capability.scheduleDaily(receipt, prepared.intervalMinutes, prepared.quietWindow);
        else { await capability.schedule({ identifier, intervalMinutes: prepared.intervalMinutes }); confirmed = [identifier]; }
        if (!alive(token)) return compensate(storage, receipt);
        const active = await storage.confirmActivation(identifier, prepared.revision, confirmed);
        if (!alive(token)) return compensate(storage, receipt);
        return active;
      } catch (error) { await compensate(storage, receipt); throw error; }
    }),
    pause: (expectedRevision: number) => run(expectedRevision, (storage, config) => recover(storage, config, 'paused')),
    disable: (expectedRevision: number) => run(expectedRevision, (storage, config) => recover(storage, config, 'disabled')),
    cancelPending() { if (intent) intent.canceled = true; },
    foreground(active: boolean) {
      foreground = active; if (active) enteredAt = readClock(); else update({ banner: false });
    },
    dismissBanner: () => update({ banner: false }),
    dispose() {
      if (disposed) return; disposed = true; if (intent) intent.canceled = true;
      try { unsubscribe?.(); } catch {}
      unsubscribe = null; listeners.clear(); cleanup();
    },
  };
}
export type HydrationController = ReturnType<typeof createHydrationController>;

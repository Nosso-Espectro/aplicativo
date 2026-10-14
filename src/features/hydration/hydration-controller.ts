import { createExpoHydrationEngine, type HydrationEngine } from './expo-hydration-engine';
import { openHydrationDatabase, type HydrationDatabase } from './hydration-database';
import { ownedHydrationIdentifier, type HydrationConfig } from './hydration-model';
import { hydrationReceiptGeneration } from './hydration-receipt';
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
  let disposed = false; let work = 0; let foreground = true; let enteredAt = readClock(); let receivedAt = -1;
  let dbPromise: Promise<HydrationDatabase> | null = null; let native: HydrationEngine | null = null;
  let unsubscribe: (() => void) | null = null; let intent: Intent | null = null;
  function readClock() { try { const value = clock(); return Number.isSafeInteger(value) && value >= 0 ? value : NaN; } catch { return NaN; } }
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
      try { unsubscribe = candidate.onReceived(() => state.confirmed && state.config?.status === 'active' && !state.busy && !state.config.journal ? state.config.identifier : null,
        (_identifier, date) => {
          if (disposed || !foreground || !Number.isSafeInteger(enteredAt) || date < enteredAt || date <= receivedAt) return;
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
  async function compensate(storage: HydrationDatabase, identifier: string) {
    await engine().cancel(identifier);
    const current = await storage.read();
    if ((!current.journal && current.identifier === identifier) || (current.journal?.kind === 'activate' && current.journal.identifier === identifier)) {
      const target = current.journal?.receipt ?? current.receipt;
      if (target?.entries.length !== 1) return current;
      const prepared = await storage.prepareCancellation('paused', current.revision);
      return storage.confirmCancellation(prepared.revision, [identifier]);
    }
    return current;
  }
  async function reload() {
    if (disposed || state.busy) return;
    work++; update({ loading: true, busy: true, confirmed: false, error: null, banner: false });
    let storage: HydrationDatabase | null = null;
    try {
      storage = await db(); let config = await storage.read();
      if (disposed) return;
      if (config.journal) config = await recover(storage, config, config.journal.kind === 'cancel' ? config.journal.nextStatus : 'paused');
      else if (config.status === 'active') {
        const capability = engine(); const permission = await capability.permission(); const observed = await capability.inspect();
        if (disposed) return;
        const matching = observed.scheduled.length === 1 && observed.scheduled[0].identifier === config.identifier
          && observed.scheduled[0].intervalMinutes === config.intervalMinutes && observed.presented.every(id => id === config.identifier);
        if (!permission || !matching) config = await recover(storage, config, 'paused');
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
    activate: (expectedRevision: number) => run(expectedRevision, async (storage, config, token) => {
      if (config.status === 'active' || config.journal || !state.confirmed || config.quietWindow) throw new Error('Hydration configuration unavailable.');
      const capability = engine(); const allowed = await capability.requestPermission();
      if (!alive(token)) return storage.read();
      if (!allowed) throw new PermissionDenied();
      const prepared = await storage.prepareActivation(expectedRevision);
      if (prepared.journal?.kind !== 'activate') throw new Error('Hydration journal unavailable.');
      const identifier = prepared.journal.identifier;
      try {
        if (!alive(token)) return compensate(storage, identifier);
        await capability.schedule({ identifier, intervalMinutes: prepared.intervalMinutes });
        if (!alive(token)) return compensate(storage, identifier);
        const active = await storage.confirmActivation(identifier, prepared.revision);
        if (!alive(token)) return compensate(storage, identifier);
        return active;
      } catch (error) { await compensate(storage, identifier); throw error; }
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

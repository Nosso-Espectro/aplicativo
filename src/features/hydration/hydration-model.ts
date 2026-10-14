import { validHydrationInterval } from './hydration-interval';
import { hydrationReceiptGeneration, normalizeHydrationReceipt, type HydrationReceipt } from './hydration-receipt';
import { normalizeQuietWindow, type QuietWindow } from './quiet-hours';
export { validHydrationInterval } from './hydration-interval';
export const hydrationPresets = [30, 60, 120] as const;
export const hydrationNamespace = 'tear-hydration-v1';
export type HydrationStatus = 'disabled' | 'paused' | 'active';
export type HydrationJournal =
  | { kind: 'activate'; identifier: string; receipt?: HydrationReceipt }
  | { kind: 'cancel'; nextStatus: 'disabled' | 'paused'; identifier: string | null; receipt?: HydrationReceipt | null };
export type HydrationConfig = {
  revision: number;
  intervalMinutes: number;
  status: HydrationStatus;
  identifier: string | null;
  journal: HydrationJournal | null;
  quietWindow: QuietWindow | null;
  receipt: HydrationReceipt | null;
};
const invalid = () => new Error('Invalid hydration configuration.');
export function initialHydrationConfig(): HydrationConfig {
  return { revision: 0, intervalMinutes: 60, status: 'disabled', identifier: null, journal: null, quietWindow: null, receipt: null };
}
export function hydrationIdentifier(revision: number) {
  if (!Number.isSafeInteger(revision) || revision < 1) throw invalid();
  return `${hydrationNamespace}-${revision}`;
}
export function ownedHydrationIdentifier(value: unknown): value is string {
  return typeof value === 'string' && hydrationReceiptGeneration(value) !== null;
}
export function legacyHydrationReceipt(identifier: string, intervalMinutes: number) {
  const generation = hydrationReceiptGeneration(identifier);
  if (generation === null || identifier !== hydrationIdentifier(generation)) throw invalid();
  return normalizeHydrationReceipt({ generation, timezone: null, notBeforeMs: null,
    entries: [{ identifier, kind: 'interval', intervalMinutes }] }, intervalMinutes, null);
}
export function normalizedHydrationConfig(input: HydrationConfig): HydrationConfig {
  if (!input || !Number.isSafeInteger(input.revision) || input.revision < 0 || !validHydrationInterval(input.intervalMinutes)
    || !['disabled', 'paused', 'active'].includes(input.status)) throw invalid();
  const quietWindow = normalizeQuietWindow(input.quietWindow);
  function receipt(value: HydrationReceipt | null | undefined, identifier: string | null) {
    if (identifier === null) { if (value !== null && value !== undefined) throw invalid(); return null; }
    const saved = value !== null && value !== undefined ? normalizeHydrationReceipt(value, input.intervalMinutes, quietWindow)
      : !quietWindow ? legacyHydrationReceipt(identifier, input.intervalMinutes) : null;
    if (!saved || saved.generation > input.revision || saved.entries[0].identifier !== identifier) throw invalid();
    return saved;
  }
  if (input.status === 'active' ? !ownedHydrationIdentifier(input.identifier) : input.identifier !== null || input.receipt !== null) throw invalid();
  const confirmed = receipt(input.receipt, input.identifier);
  let journal: HydrationJournal | null = null;
  if (input.journal !== null) {
    const pending = input.journal;
    if (pending?.kind === 'activate') {
      if (input.status === 'active' || !ownedHydrationIdentifier(pending.identifier)) throw invalid();
      const target = receipt(pending.receipt, pending.identifier);
      if (!target || target.generation !== input.revision) throw invalid();
      journal = { kind: 'activate', identifier: pending.identifier, receipt: target };
    } else if (pending?.kind === 'cancel' && ['disabled', 'paused'].includes(pending.nextStatus)) {
      if (pending.identifier !== null && !ownedHydrationIdentifier(pending.identifier)) throw invalid();
      const target = receipt(pending.receipt, pending.identifier);
      if (confirmed && JSON.stringify(confirmed) !== JSON.stringify(target)) throw invalid();
      journal = { kind: 'cancel', nextStatus: pending.nextStatus, identifier: pending.identifier, receipt: target };
    } else throw invalid();
  }
  return { revision: input.revision, intervalMinutes: input.intervalMinutes, status: input.status, identifier: input.identifier, journal,
    quietWindow, receipt: confirmed };
}
export function nextHydrationRevision(value: number) {
  if (!Number.isSafeInteger(value) || value < 0 || !Number.isSafeInteger(value + 1)) throw invalid();
  return value + 1;
}

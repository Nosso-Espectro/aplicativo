import { validHydrationInterval } from './hydration-interval';
export { validHydrationInterval } from './hydration-interval';
export const hydrationPresets = [30, 60, 120] as const;
export const hydrationNamespace = 'tear-hydration-v1';
export type HydrationStatus = 'disabled' | 'paused' | 'active';
export type HydrationJournal =
  | { kind: 'activate'; identifier: string }
  | { kind: 'cancel'; nextStatus: 'disabled' | 'paused'; identifier: string | null };
export type HydrationConfig = {
  revision: number;
  intervalMinutes: number;
  status: HydrationStatus;
  identifier: string | null;
  journal: HydrationJournal | null;
};
const invalid = () => new Error('Invalid hydration configuration.');
export function initialHydrationConfig(): HydrationConfig {
  return { revision: 0, intervalMinutes: 60, status: 'disabled', identifier: null, journal: null };
}
export function hydrationIdentifier(revision: number) {
  if (!Number.isSafeInteger(revision) || revision < 1) throw invalid();
  return `${hydrationNamespace}-${revision}`;
}
export function ownedHydrationIdentifier(value: unknown): value is string {
  if (typeof value !== 'string' || !/^tear-hydration-v1-[1-9]\d*$/.test(value)) return false;
  const revision = Number(value.slice(hydrationNamespace.length + 1));
  return Number.isSafeInteger(revision) && revision >= 1 && hydrationIdentifier(revision) === value;
}
export function normalizedHydrationConfig(input: HydrationConfig): HydrationConfig {
  if (!input || !Number.isSafeInteger(input.revision) || input.revision < 0 || !validHydrationInterval(input.intervalMinutes)
    || !['disabled', 'paused', 'active'].includes(input.status)) throw invalid();
  if (input.status === 'active' ? !ownedHydrationIdentifier(input.identifier) : input.identifier !== null) throw invalid();
  if (input.identifier && Number(input.identifier.slice(hydrationNamespace.length + 1)) > input.revision) throw invalid();
  let journal: HydrationJournal | null = null;
  if (input.journal !== null) {
    const pending = input.journal;
    if (pending?.kind === 'activate') {
      if (input.status === 'active' || !ownedHydrationIdentifier(pending.identifier) || pending.identifier !== hydrationIdentifier(input.revision)) throw invalid();
      journal = { kind: 'activate', identifier: pending.identifier };
    } else if (pending?.kind === 'cancel' && ['disabled', 'paused'].includes(pending.nextStatus)) {
      if (pending.identifier !== null && (!ownedHydrationIdentifier(pending.identifier)
        || Number(pending.identifier.slice(hydrationNamespace.length + 1)) > input.revision)) throw invalid();
      if (input.identifier !== null && pending.identifier !== input.identifier) throw invalid();
      journal = { kind: 'cancel', nextStatus: pending.nextStatus, identifier: pending.identifier };
    } else throw invalid();
  }
  return { revision: input.revision, intervalMinutes: input.intervalMinutes, status: input.status, identifier: input.identifier, journal };
}
export function nextHydrationRevision(value: number) {
  if (!Number.isSafeInteger(value) || value < 0 || !Number.isSafeInteger(value + 1)) throw invalid();
  return value + 1;
}

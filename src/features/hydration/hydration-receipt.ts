import { validHydrationInterval } from './hydration-interval';
import { isQuietMinute, normalizeQuietWindow, type HydrationDailyTime, type QuietWindow } from './quiet-hours';
export type HydrationReceiptEntry = { identifier: string } & ({ kind: 'interval'; intervalMinutes: number } | { kind: 'daily'; hour: number; minute: number });
export type HydrationReceipt = { generation: number; timezone: string | null; notBeforeMs: number | null; entries: HydrationReceiptEntry[] };
const invalid = () => new Error('Invalid hydration receipt.');
function validGeneration(value: unknown): value is number { return typeof value === 'number' && Number.isSafeInteger(value) && value >= 1; }
export function hydrationBatchIdentifier(generation: number, index: number) {
  if (!validGeneration(generation) || !Number.isInteger(index) || index < 0 || index >= 48) throw invalid();
  return `tear-hydration-v2-${generation}-${index}`;
}
export function hydrationReceiptGeneration(identifier: unknown): number | null {
  if (typeof identifier !== 'string') return null;
  const legacy = /^tear-hydration-v1-([1-9]\d*)$/.exec(identifier);
  if (legacy) { const generation = Number(legacy[1]); return validGeneration(generation) && String(generation) === legacy[1] ? generation : null; }
  const batch = /^tear-hydration-v2-([1-9]\d*)-(0|[1-9]\d*)$/.exec(identifier);
  if (!batch) return null;
  const generation = Number(batch[1]); const index = Number(batch[2]);
  return validGeneration(generation) && Number.isInteger(index) && index >= 0 && index < 48
    && hydrationBatchIdentifier(generation, index) === identifier ? generation : null;
}
function timezone(input: unknown) {
  if (typeof input !== 'string' || !input || input.length > 100) throw invalid();
  try { return new Intl.DateTimeFormat('en', { timeZone: input }).resolvedOptions().timeZone; } catch { throw invalid(); }
}
function deadline(input: unknown): number | null {
  if (input === null) return null;
  if (typeof input !== 'number' || !Number.isSafeInteger(input) || input < 0 || !Number.isFinite(new Date(input).getTime())) throw invalid();
  return input;
}
export function normalizeHydrationReceipt(input: unknown, intervalMinutes: number, window: QuietWindow | null): HydrationReceipt {
  const quiet = normalizeQuietWindow(window);
  if (!validHydrationInterval(intervalMinutes) || typeof input !== 'object' || !input || !('generation' in input) || !validGeneration(input.generation)
    || !('entries' in input) || !Array.isArray(input.entries) || !input.entries.length || input.entries.length > 48
    || !('timezone' in input) || !('notBeforeMs' in input)) throw invalid();
  const generation = input.generation; const notBeforeMs = deadline(input.notBeforeMs);
  const zone = quiet ? timezone(input.timezone) : null;
  if (quiet ? notBeforeMs === null : input.timezone !== null || input.entries.length !== 1) throw invalid();
  const entries: HydrationReceiptEntry[] = Array.from(input.entries).map((entry: unknown, index: number) => {
    if (typeof entry !== 'object' || !entry || !('identifier' in entry) || typeof entry.identifier !== 'string' || !('kind' in entry)
      || hydrationReceiptGeneration(entry.identifier) !== generation) throw invalid();
    const identifier = entry.identifier;
    if (!quiet) {
      if (entry.kind !== 'interval' || !('intervalMinutes' in entry) || entry.intervalMinutes !== intervalMinutes
        || ![hydrationBatchIdentifier(generation, 0), `tear-hydration-v1-${generation}`].includes(identifier)) throw invalid();
      return { identifier, kind: 'interval', intervalMinutes };
    }
    if (identifier !== hydrationBatchIdentifier(generation, index) || entry.kind !== 'daily'
      || !('hour' in entry) || typeof entry.hour !== 'number' || !Number.isInteger(entry.hour) || entry.hour < 0 || entry.hour > 23
      || !('minute' in entry) || typeof entry.minute !== 'number' || !Number.isInteger(entry.minute) || entry.minute < 0 || entry.minute > 59
      || isQuietMinute(entry.hour * 60 + entry.minute, quiet)) throw invalid();
    return { identifier, kind: 'daily', hour: entry.hour, minute: entry.minute };
  });
  if (quiet) {
    const minutes = entries.map(entry => entry.kind === 'daily' ? entry.hour * 60 + entry.minute : NaN).sort((a, b) => a - b);
    for (let i = 0; i < minutes.length; i++) {
      const next = i + 1 < minutes.length ? minutes[i + 1] : minutes[0] + 1440;
      if (next - minutes[i] < intervalMinutes) throw invalid();
    }
  }
  return { generation, timezone: zone, notBeforeMs, entries };
}
export function createDailyHydrationReceipt(generation: number, intervalMinutes: number, quiet: QuietWindow, zone: string, notBeforeMs: number, slots: HydrationDailyTime[]) {
  return normalizeHydrationReceipt({ generation, timezone: zone, notBeforeMs,
    entries: slots.map((slot, index) => ({ identifier: hydrationBatchIdentifier(generation, index), kind: 'daily', ...slot })) }, intervalMinutes, quiet);
}

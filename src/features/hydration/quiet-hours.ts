import { validHydrationInterval } from './hydration-model';
export type QuietWindow = { startMinute: number; endMinute: number };
export type HydrationDailyTime = { hour: number; minute: number };
const invalid = () => new Error('Invalid hydration quiet hours.');
const validMinute = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < 1440;
export function normalizeQuietWindow(input: unknown): QuietWindow | null {
  if (input === null) return null;
  if (typeof input !== 'object' || !input || Array.isArray(input) || !('startMinute' in input) || !('endMinute' in input)
    || !validMinute(input.startMinute) || !validMinute(input.endMinute) || input.startMinute === input.endMinute) throw invalid();
  return { startMinute: input.startMinute, endMinute: input.endMinute };
}
export function parseQuietTime(text: string): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(text)) return null;
  const [hour, minute] = text.split(':').map(Number); return hour * 60 + minute;
}
export function formatQuietTime(minute: number) {
  if (!validMinute(minute)) throw invalid();
  return `${Math.floor(minute / 60).toString().padStart(2, '0')}:${(minute % 60).toString().padStart(2, '0')}`;
}
export function isQuietMinute(minute: number, input: QuietWindow | null) {
  if (!validMinute(minute)) throw invalid();
  const quiet = normalizeQuietWindow(input); if (!quiet) return false;
  return quiet.startMinute < quiet.endMinute ? minute >= quiet.startMinute && minute < quiet.endMinute
    : minute >= quiet.startMinute || minute < quiet.endMinute;
}
function civilDate(nowMs: number) {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) throw invalid();
  const date = new Date(nowMs); if (!Number.isFinite(date.getTime())) throw invalid(); return date;
}
export function isQuietAt(nowMs: number, quiet: QuietWindow | null) {
  const date = civilDate(nowMs); return isQuietMinute(date.getHours() * 60 + date.getMinutes(), quiet);
}
export function planDailyHydration(intervalMinutes: number, input: QuietWindow, nowMs: number) {
  if (!validHydrationInterval(intervalMinutes)) throw invalid();
  const quiet = normalizeQuietWindow(input); if (!quiet) throw invalid();
  civilDate(nowMs);
  const notBeforeMs = nowMs + intervalMinutes * 60000; civilDate(notBeforeMs);
  const anchor = civilDate(Math.ceil(nowMs / 60000) * 60000);
  const anchorMinute = anchor.getHours() * 60 + anchor.getMinutes();
  const slots: HydrationDailyTime[] = [];
  // The final-to-first civil gap is at least one interval; filtering can only enlarge it.
  for (let offset = intervalMinutes; offset <= 1440; offset += intervalMinutes) {
    const minute = (anchorMinute + offset) % 1440;
    if (!isQuietMinute(minute, quiet)) slots.push({ hour: Math.floor(minute / 60), minute: minute % 60 });
  }
  // Native next-date confirmation must still omit dates before notBeforeMs or inside silence.
  return { notBeforeMs, slots };
}

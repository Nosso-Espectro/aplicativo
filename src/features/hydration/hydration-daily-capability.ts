import type { DailyTriggerInput, NotificationRequest } from 'expo-notifications';
import { hydrationNamespace, ownedHydrationIdentifier } from './hydration-model';
import { createDailyHydrationReceipt, normalizeHydrationReceipt, type HydrationReceipt } from './hydration-receipt';
import { isQuietAt, normalizeQuietWindow, planDailyHydration, type QuietWindow } from './quiet-hours';

const unavailable = () => new Error('Hydration daily capability unavailable.');
export function createHydrationDailyCapability({ notifications, platform, channelId, clock, alive }: {
  notifications: typeof import('expo-notifications'); platform: 'android' | 'ios'; channelId?: string;
  clock: () => number; alive: () => void;
}) {
  let clockFloor = -1;
  function zone() { return new Intl.DateTimeFormat().resolvedOptions().timeZone; }
  function timestamp() {
    const value = clock();
    if (!Number.isSafeInteger(value) || value < 0 || value < clockFloor || !Number.isFinite(new Date(value).getTime())) throw unavailable();
    clockFloor = value; return value;
  }
  function guard(start: number, timezone: string) {
    alive(); const now = timestamp(); if (now < start || zone() !== timezone) throw unavailable(); return now;
  }
  function trigger(hour: number, minute: number): DailyTriggerInput {
    return { type: notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, ...(channelId ? { channelId } : {}) };
  }
  function validNext(result: number | null, hour: number, minute: number, quiet: QuietWindow, notBefore: number, start: number, timezone: string) {
    const now = guard(start, timezone);
    if (typeof result !== 'number' || !Number.isSafeInteger(result) || result <= now || result < notBefore
      || result > now + 26 * 3600000) throw unavailable();
    const date = new Date(result);
    if (!Number.isFinite(date.getTime()) || date.getHours() !== hour || date.getMinutes() !== minute
      || date.getSeconds() !== 0 || date.getMilliseconds() !== 0 || isQuietAt(result, quiet)) throw unavailable();
    // Refuse civil-time transitions near this occurrence rather than guessing a DST fold/gap.
    const offset = new Date(now).getTimezoneOffset();
    if ([result - 3 * 3600000, result, result + 3 * 3600000].some(time => new Date(time).getTimezoneOffset() !== offset)) throw unavailable();
  }
  async function next(hour: number, minute: number, quiet: QuietWindow, notBefore: number, start: number, timezone: string) {
    validNext(await notifications.getNextTriggerDateAsync(trigger(hour, minute)), hour, minute, quiet, notBefore, start, timezone);
  }
  function matching(request: NotificationRequest, entry: HydrationReceipt['entries'][number], intervalMinutes: number) {
    if (entry.kind !== 'daily' || request.identifier !== entry.identifier) return false;
    const content = request.content.data;
    if (content?.owner !== hydrationNamespace || content.intervalMinutes !== intervalMinutes) return false;
    const actual = request.trigger;
    if (!actual || !('type' in actual)) return false;
    if (platform === 'android') return actual.type === 'daily' && actual.hour === entry.hour && actual.minute === entry.minute;
    if (actual.type !== 'calendar' || actual.repeats !== true || !('dateComponents' in actual)) return false;
    const parts = actual.dateComponents;
    if (!parts || typeof parts !== 'object' || !('hour' in parts) || !('minute' in parts) || parts.hour !== entry.hour || parts.minute !== entry.minute) return false;
    return Object.entries(parts).every(([key, value]) => {
      if (['hour', 'minute'].includes(key)) return true;
      if (['isLeapMonth', 'isRepeatedDay'].includes(key)) return value === false || value == null;
      if (['second', 'nanosecond'].includes(key)) return value === 0 || value == null;
      return value == null;
    });
  }
  function normalize(receipt: HydrationReceipt, intervalMinutes: number, quiet: QuietWindow) {
    const copy = normalizeHydrationReceipt(receipt, intervalMinutes, quiet);
    if (!copy.timezone || copy.notBeforeMs === null || copy.entries.some(entry => entry.kind !== 'daily')) throw unavailable();
    return copy;
  }
  async function room(size: number) {
    const requests = await notifications.getAllScheduledNotificationsAsync(); alive();
    if (requests.length + size > 48 || requests.some(request => ownedHydrationIdentifier(request.identifier))) throw unavailable();
  }
  async function verify(receipt: HydrationReceipt, intervalMinutes: number, quiet: QuietWindow) {
    const start = timestamp(); const timezone = receipt.timezone!; guard(start, timezone);
    const requests = await notifications.getAllScheduledNotificationsAsync(); guard(start, timezone);
    const owned = requests.filter(request => ownedHydrationIdentifier(request.identifier));
    if (owned.length !== receipt.entries.length || new Set(owned.map(request => request.identifier)).size !== owned.length) throw unavailable();
    for (const entry of receipt.entries) {
      const request = owned.find(item => item.identifier === entry.identifier);
      if (!request || !matching(request, entry, intervalMinutes) || entry.kind !== 'daily') throw unavailable();
      await next(entry.hour, entry.minute, quiet, receipt.notBeforeMs!, start, timezone);
    }
    guard(start, timezone); return receipt.entries.map(entry => entry.identifier);
  }
  return {
    plan: async (generation: number, intervalMinutes: number, input: QuietWindow) => {
      const quiet = normalizeQuietWindow(input); if (!quiet) throw unavailable();
      const start = timestamp(); const timezone = zone();
      const plan = planDailyHydration(intervalMinutes, quiet, start);
      if (!plan.slots.length) throw unavailable();
      createDailyHydrationReceipt(generation, intervalMinutes, quiet, timezone, plan.notBeforeMs, plan.slots);
      // A candidate too early is omitted; unknown/null native capability refuses the whole plan.
      const slots = [];
      for (const slot of plan.slots) {
        const date = await notifications.getNextTriggerDateAsync(trigger(slot.hour, slot.minute)); guard(start, timezone);
        if (typeof date === 'number' && Number.isSafeInteger(date) && date > start && date < plan.notBeforeMs) continue;
        validNext(date, slot.hour, slot.minute, quiet, plan.notBeforeMs, start, timezone); slots.push(slot);
      }
      const receipt = createDailyHydrationReceipt(generation, intervalMinutes, quiet, timezone, plan.notBeforeMs, slots);
      await room(receipt.entries.length); guard(start, timezone); return receipt;
    },
    verify: async (input: HydrationReceipt, intervalMinutes: number, quiet: QuietWindow) => verify(normalize(input, intervalMinutes, quiet), intervalMinutes, quiet),
    schedule: async (input: HydrationReceipt, intervalMinutes: number, quiet: QuietWindow) => {
      const receipt = normalize(input, intervalMinutes, quiet); const start = timestamp(); guard(start, receipt.timezone!);
      await room(receipt.entries.length); guard(start, receipt.timezone!);
      for (const entry of receipt.entries) {
        if (entry.kind !== 'daily') throw unavailable();
        await next(entry.hour, entry.minute, quiet, receipt.notBeforeMs!, start, receipt.timezone!);
      }
      const attempted: string[] = [];
      try {
        for (const entry of receipt.entries) {
          guard(start, receipt.timezone!); if (entry.kind !== 'daily') throw unavailable();
          attempted.push(entry.identifier);
          const returned = await notifications.scheduleNotificationAsync({ identifier: entry.identifier,
            content: { title: 'Água', body: 'Uma pausa para água, se desejar.', sound: false, vibrate: [],
              priority: notifications.AndroidNotificationPriority.LOW, data: { owner: hydrationNamespace, intervalMinutes } },
            trigger: trigger(entry.hour, entry.minute),
          });
          guard(start, receipt.timezone!); if (returned !== entry.identifier) throw unavailable();
        }
        return await verify(receipt, intervalMinutes, quiet);
      } catch {
        // Only attempted operation IDs are proven ours, even if the SDK returns another ID.
        for (const identifier of attempted) {
          try { await notifications.cancelScheduledNotificationAsync(identifier); } catch {}
          try { await notifications.dismissNotificationAsync(identifier); } catch {}
        }
        throw unavailable();
      }
    },
  };
}

import { Platform } from 'react-native';
import type { NotificationPermissionsStatus } from 'expo-notifications';
import { hydrationNamespace, ownedHydrationIdentifier, validHydrationInterval } from './hydration-model';
export type HydrationSchedule = { identifier: string; intervalMinutes: number };
const channelId = 'tear-hydration-reminders-v1';
const unavailable = () => new Error('Hydration notification capability unavailable.');
export function createExpoHydrationEngine() {
  const platform = Platform.OS;
  if (platform !== 'android' && platform !== 'ios') throw unavailable();
  if (platform === 'android' && (typeof Platform.Version !== 'number' || !Number.isSafeInteger(Platform.Version))) throw unavailable();
  const channels = platform === 'android' && typeof Platform.Version === 'number' && Platform.Version >= 26;
  // Load only for an explicit action or a previously consented receipt reconciliation.
  let notifications: typeof import('expo-notifications');
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    notifications = require('expo-notifications') as typeof import('expo-notifications');
  } catch { throw unavailable(); }
  let disposed = false;
  let pending: Promise<unknown> = Promise.resolve();
  const subscriptions = new Set<{ remove(): void }>();
  function alive() { if (disposed) throw unavailable(); }
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const next = pending.then(async () => { alive(); return operation(); }).catch(() => { throw unavailable(); });
    pending = next.catch(() => undefined); return next;
  }
  function authorized(status: NotificationPermissionsStatus) {
    if (platform === 'ios' && status.ios) return [notifications.IosAuthorizationStatus.AUTHORIZED,
      notifications.IosAuthorizationStatus.PROVISIONAL, notifications.IosAuthorizationStatus.EPHEMERAL].includes(status.ios.status);
    return status.granted === true;
  }
  async function allowed(status: NotificationPermissionsStatus) {
    if (!authorized(status)) return false;
    if (!channels) return true;
    const channel = await notifications.getNotificationChannelAsync(channelId);
    return !!channel && channel.importance !== notifications.AndroidImportance.NONE;
  }
  async function inspect() {
    const scheduled = await notifications.getAllScheduledNotificationsAsync();
    const presented = await notifications.getPresentedNotificationsAsync();
    return {
      scheduled: scheduled.filter(entry => ownedHydrationIdentifier(entry.identifier)).map(entry => {
        const trigger = entry.trigger;
        const minutes = trigger && 'type' in trigger && trigger.type === 'timeInterval'
          && 'repeats' in trigger && trigger.repeats === true && 'seconds' in trigger && typeof trigger.seconds === 'number'
          ? trigger.seconds / 60 : NaN;
        return { identifier: entry.identifier, intervalMinutes: entry.content.data?.owner === hydrationNamespace
          && validHydrationInterval(minutes) && entry.content.data.intervalMinutes === minutes ? minutes : null };
      }),
      presented: presented.map(entry => entry.request.identifier).filter(ownedHydrationIdentifier),
    };
  }
  async function cancel(identifier: string) {
    await notifications.cancelScheduledNotificationAsync(identifier);
    await notifications.dismissNotificationAsync(identifier);
    const observed = await inspect();
    if (observed.scheduled.some(entry => entry.identifier === identifier) || observed.presented.includes(identifier)) throw unavailable();
  }
  return {
    permission: () => enqueue(async () => { const result = await allowed(await notifications.getPermissionsAsync()); alive(); return result; }),
    requestPermission: () => enqueue(async () => {
      const current = await notifications.getPermissionsAsync(); alive();
      if (!authorized(current) && !current.canAskAgain) return false;
      if (channels) {
        const channel = await notifications.getNotificationChannelAsync(channelId); alive();
        if (channel?.importance === notifications.AndroidImportance.NONE) return false;
        if (!channel) {
          await notifications.setNotificationChannelAsync(channelId, {
            name: 'Lembretes de água', importance: notifications.AndroidImportance.LOW, sound: null,
            enableVibrate: false, vibrationPattern: [], bypassDnd: false, showBadge: false, enableLights: false,
            lockscreenVisibility: notifications.AndroidNotificationVisibility.PRIVATE,
          }); alive();
        }
      }
      const confirmed = authorized(current) ? current : await notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowSound: false, allowBadge: false, allowCriticalAlerts: false, allowProvisional: false, allowDisplayInCarPlay: false },
      }); alive(); const result = await allowed(confirmed); alive(); return result;
    }),
    inspect: () => enqueue(async () => { const result = await inspect(); alive(); return result; }),
    schedule: (entry: HydrationSchedule) => {
      if (!entry || !ownedHydrationIdentifier(entry.identifier) || !validHydrationInterval(entry.intervalMinutes)) return Promise.reject(unavailable());
      const input = { ...entry };
      return enqueue(async () => {
        if (!await allowed(await notifications.getPermissionsAsync())) throw unavailable(); alive();
        const identifier = await notifications.scheduleNotificationAsync({ identifier: input.identifier,
          content: { title: 'Água', body: 'Uma pausa para água, se desejar.', sound: false, vibrate: [],
            priority: notifications.AndroidNotificationPriority.LOW,
            data: { owner: hydrationNamespace, intervalMinutes: input.intervalMinutes } },
          trigger: { type: notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: input.intervalMinutes * 60,
            repeats: true, ...(channels ? { channelId } : {}) },
        });
        if (disposed || identifier !== input.identifier) {
          // This exact returned ID belongs to this schedule call, not a global cancellation.
          await notifications.cancelScheduledNotificationAsync(identifier);
          await cancel(input.identifier); throw unavailable();
        }
        const result = await inspect();
        if (disposed || !result.scheduled.some(item => item.identifier === input.identifier && item.intervalMinutes === input.intervalMinutes)) {
          await cancel(input.identifier); throw unavailable();
        }
      });
    },
    cancel: (identifier: string) => ownedHydrationIdentifier(identifier) ? enqueue(() => cancel(identifier)) : Promise.reject(unavailable()),
    onReceived: (owned: () => string | null, received: (identifier: string, date: number) => void) => {
      alive(); let active = true;
      const subscription = notifications.addNotificationReceivedListener(event => {
        if (!active || disposed || event.request.identifier !== owned() || !ownedHydrationIdentifier(event.request.identifier)) return;
        if (event.request.content.data?.owner !== hydrationNamespace || !Number.isFinite(event.date) || event.date < 0) return;
        // SDK57 forwards iOS epoch seconds unchanged; Android already emits milliseconds.
        const date = platform === 'ios' ? Math.round(event.date * 1000) : event.date;
        if (!Number.isSafeInteger(date)) return;
        received(event.request.identifier, date);
      });
      subscriptions.add(subscription);
      return () => { if (!active) return; active = false; try { subscription.remove(); } finally { subscriptions.delete(subscription); } };
    },
    dispose: () => {
      if (disposed) return; disposed = true;
      let failed = false;
      for (const subscription of subscriptions) try { subscription.remove(); } catch { failed = true; }
      subscriptions.clear(); if (failed) throw unavailable();
    },
  };
}
export type HydrationEngine = ReturnType<typeof createExpoHydrationEngine>;

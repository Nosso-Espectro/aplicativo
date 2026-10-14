import { Platform } from 'react-native';
import type { NotificationPermissionsStatus } from 'expo-notifications';
import { normalizedProgressNotification, type OwnedProgressNotification } from './progress-notification';

const channelId = 'tear-transition-alerts-v1';
const unavailable = () => new Error('Timer notification capability unavailable.');

export function createExpoProgressAlertEngine(clock: () => number = Date.now) {
  const platform = Platform.OS;
  if (platform !== 'android' && platform !== 'ios') throw unavailable();
  const version = platform === 'android' ? Platform.Version : null;
  if (platform === 'android' && (typeof version !== 'number' || !Number.isSafeInteger(version))) throw unavailable();
  const channelsSupported = platform === 'android' && typeof version === 'number' && version >= 26;
  // Load the capability only for consented restoration or an explicit system-alert action.
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
    if (!channelsSupported) return true;
    const channel = await notifications.getNotificationChannelAsync(channelId);
    return !!channel && channel.importance !== notifications.AndroidImportance.NONE;
  }
  async function inspect(entries: readonly OwnedProgressNotification[]) {
    if (!entries.length) return { scheduled: [], presented: [] };
    const ids = new Set(entries.map(entry => entry.identifier));
    const scheduled = await notifications.getAllScheduledNotificationsAsync();
    const presented = await notifications.getPresentedNotificationsAsync();
    return {
      scheduled: scheduled.map(entry => entry.identifier).filter(id => ids.has(id)),
      presented: presented.map(entry => entry.request.identifier).filter(id => ids.has(id)),
    };
  }
  async function cancel(entry: OwnedProgressNotification) {
    await notifications.cancelScheduledNotificationAsync(entry.identifier);
    await notifications.dismissNotificationAsync(entry.identifier);
    const observed = await inspect([entry]);
    if (observed.scheduled.length || observed.presented.length) throw unavailable();
  }
  return {
    permission: () => enqueue(async () => {
      const status = await notifications.getPermissionsAsync(); const result = await allowed(status); alive(); return result;
    }),
    requestPermission: () => enqueue(async () => {
      const status = await notifications.getPermissionsAsync(); alive();
      if (!authorized(status) && !status.canAskAgain) return false;
      if (channelsSupported) {
        const current = await notifications.getNotificationChannelAsync(channelId); alive();
        if (current?.importance === notifications.AndroidImportance.NONE) return false;
        if (!current) {
          await notifications.setNotificationChannelAsync(channelId, {
            name: 'Avisos do timer', importance: notifications.AndroidImportance.DEFAULT,
            sound: 'default', enableVibrate: true, bypassDnd: false, showBadge: false,
            enableLights: false, lockscreenVisibility: notifications.AndroidNotificationVisibility.PRIVATE,
          }); alive();
        }
      }
      const confirmed = authorized(status) ? status : await notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowSound: true, allowBadge: false, allowCriticalAlerts: false, allowProvisional: false, allowDisplayInCarPlay: false },
      });
      alive(); const result = await allowed(confirmed); alive(); return result;
    }),
    inspect: (input: readonly OwnedProgressNotification[]) => {
      const entries = input.map(normalizedProgressNotification);
      return enqueue(async () => { const result = await inspect(entries); alive(); return result; });
    },
    schedule: (input: OwnedProgressNotification) => {
      const entry = normalizedProgressNotification(input);
      return enqueue(async () => {
        const status = await notifications.getPermissionsAsync(); alive();
        if (!await allowed(status)) throw unavailable(); alive();
        const nowMs = clock();
        if (!Number.isSafeInteger(nowMs) || nowMs < 0 || entry.atMs <= nowMs) throw unavailable();
        const identifier = await notifications.scheduleNotificationAsync({
          identifier: entry.identifier,
          content: { title: 'Timer de transição', body: `Faltam ${entry.minutes} minutos.`, sound: platform === 'ios' ? status.ios?.allowsSound === true ? 'default' : false : 'default' },
          trigger: { type: notifications.SchedulableTriggerInputTypes.DATE, date: new Date(entry.atMs), ...(channelsSupported ? { channelId } : {}) },
        });
        if (disposed || identifier !== entry.identifier) { await cancel(entry); throw unavailable(); }
        const observed = await inspect([entry]);
        if (disposed) { await cancel(entry); throw unavailable(); }
        if (!observed.scheduled.length && !observed.presented.length) throw unavailable();
      });
    },
    cancel: (input: OwnedProgressNotification) => {
      const entry = normalizedProgressNotification(input);
      return enqueue(() => cancel(entry));
    },
    onReceived: (owned: () => readonly OwnedProgressNotification[], received: (identifier: string) => void) => {
      alive(); let active = true;
      const subscription = notifications.addNotificationReceivedListener(event => {
        if (active && !disposed && owned().some(entry => entry.identifier === event.request.identifier)) received(event.request.identifier);
      });
      subscriptions.add(subscription);
      return () => {
        if (!active) return;
        active = false;
        try { subscription.remove(); }
        catch { throw unavailable(); }
        finally { subscriptions.delete(subscription); }
      };
    },
    dispose: () => {
      if (disposed) return;
      disposed = true; let failed = false;
      for (const subscription of subscriptions) { try { subscription.remove(); } catch { failed = true; } }
      subscriptions.clear(); if (failed) throw unavailable();
    },
  };
}
export type ProgressAlertEngine = ReturnType<typeof createExpoProgressAlertEngine>;

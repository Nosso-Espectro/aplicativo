import { Platform } from 'react-native';
import type { NotificationRequestInput } from 'expo-notifications';
import { createExpoProgressAlertEngine } from '../../../src/features/transition-timer/expo-progress-alert-engine';
import { type OwnedProgressNotification } from '../../../src/features/transition-timer/progress-notification';

let mockScheduled = new Map<string, { identifier: string }>();
let mockPresented: { request: { identifier: string } }[] = [];
let mockChannel: { importance: number; sound?: string | null; enableVibrate?: boolean } | null = null;
let mockPermission = { granted: false, canAskAgain: true, ios: { status: 0, allowsSound: false } };
let mockListener: (event: { request: { identifier: string } }) => void;
const mockRemove = jest.fn(); const mockLoad = jest.fn();
const mockSDK = {
  AndroidImportance: { NONE: 0, DEFAULT: 3 }, AndroidNotificationVisibility: { PRIVATE: 0 },
  IosAuthorizationStatus: { AUTHORIZED: 2, PROVISIONAL: 3, EPHEMERAL: 4 }, SchedulableTriggerInputTypes: { DATE: 'date' },
  getPermissionsAsync: jest.fn(async () => mockPermission),
  requestPermissionsAsync: jest.fn(async () => { mockPermission.granted = true; return mockPermission; }),
  getNotificationChannelAsync: jest.fn(async () => mockChannel),
  setNotificationChannelAsync: jest.fn(async (_id, options) => { mockChannel = options; return mockChannel; }),
  scheduleNotificationAsync: jest.fn(async (input: NotificationRequestInput) => { mockScheduled.set(input.identifier!, { identifier: input.identifier! }); return input.identifier!; }),
  cancelScheduledNotificationAsync: jest.fn(async (id: string) => { mockScheduled.delete(id); }),
  dismissNotificationAsync: jest.fn(async (id: string) => { mockPresented = mockPresented.filter(entry => entry.request.identifier !== id); }),
  getAllScheduledNotificationsAsync: jest.fn(async () => [...mockScheduled.values()]),
  getPresentedNotificationsAsync: jest.fn(async () => mockPresented),
  addNotificationReceivedListener: jest.fn((listener: typeof mockListener) => { mockListener = listener; return { remove: mockRemove }; }),
};
jest.mock('expo-notifications', () => { mockLoad(); return mockSDK; });
const owned: OwnedProgressNotification = { identifier: 'tear-transition-1-5-2', sessionNumber: 1, minutes: 5, atMs: 10000 };
beforeEach(() => {
  jest.clearAllMocks(); mockScheduled = new Map(); mockPresented = []; mockChannel = null;
  mockPermission = { granted: false, canAskAgain: true, ios: { status: 0, allowsSound: false } };
  jest.replaceProperty(Platform, 'OS', 'android');
  jest.spyOn(Platform, 'Version', 'get').mockReturnValue(35);
});
afterEach(() => jest.restoreAllMocks());
async function granted() { const engine = createExpoProgressAlertEngine(() => 1000); await engine.requestPermission(); return engine; }
it('does not import the native SDK before factory creation or request permissions on construction/query', async () => {
  expect(mockLoad).not.toHaveBeenCalled(); const engine = createExpoProgressAlertEngine(); expect(mockLoad).toHaveBeenCalledTimes(1);
  expect(mockSDK.getPermissionsAsync).not.toHaveBeenCalled(); expect(await engine.permission()).toBe(false);
  expect(mockSDK.requestPermissionsAsync).not.toHaveBeenCalled(); expect(mockSDK.setNotificationChannelAsync).not.toHaveBeenCalled();
});
it('creates a normal private channel only on explicit request, without DND bypass, badges or lights', async () => {
  await granted(); expect(mockSDK.setNotificationChannelAsync).toHaveBeenCalledWith('tear-transition-alerts-v1', {
    name: 'Avisos do timer', importance: 3, sound: 'default', enableVibrate: true, bypassDnd: false, showBadge: false, enableLights: false, lockscreenVisibility: 0,
  });
  expect(mockSDK.requestPermissionsAsync).toHaveBeenCalledWith({ ios: { allowAlert: true, allowSound: true, allowBadge: false, allowCriticalAlerts: false, allowProvisional: false, allowDisplayInCarPlay: false } });
});
it('preserves existing customized channel sound/vibration and never rewrites it on repeated requests', async () => {
  mockChannel = { importance: 2, sound: null, enableVibrate: false }; mockPermission.granted = true;
  const engine = createExpoProgressAlertEngine(); expect(await engine.requestPermission()).toBe(true); expect(await engine.requestPermission()).toBe(true);
  expect(mockSDK.setNotificationChannelAsync).not.toHaveBeenCalled(); expect(mockSDK.requestPermissionsAsync).not.toHaveBeenCalled();
});
it('does not override an OS-blocked channel or re-prompt permanently denied permissions', async () => {
  mockChannel = { importance: 0 }; mockPermission.granted = true;
  const engine = createExpoProgressAlertEngine(); expect(await engine.requestPermission()).toBe(false); expect(await engine.permission()).toBe(false);
  mockChannel = null; mockPermission.granted = false; mockPermission.canAskAgain = false;
  expect(await engine.requestPermission()).toBe(false); expect(mockSDK.setNotificationChannelAsync).not.toHaveBeenCalled(); expect(mockSDK.requestPermissionsAsync).not.toHaveBeenCalled();
});
it('schedules a registered future ID with generic metadata, a one-off date and no tokens/URLs/personal payload', async () => {
  const engine = await granted(); await engine.schedule(owned);
  expect(mockSDK.scheduleNotificationAsync).toHaveBeenCalledWith({ identifier: owned.identifier,
    content: { title: 'Timer de transição', body: 'Faltam 5 minutos.', sound: 'default' }, trigger: { type: 'date', date: new Date(10000), channelId: 'tear-transition-alerts-v1' } });
  expect(await engine.inspect([owned])).toEqual({ scheduled: [owned.identifier], presented: [] });
});
it('refuses foreign/malformed IDs, invalid marks and late dates without scheduling anything', async () => {
  const engine = await granted();
  for (const invalid of [{ ...owned, identifier: 'other-app' }, { ...owned, sessionNumber: 2 }, { ...owned, minutes: 3 }, { ...owned, atMs: NaN }]) expect(() => engine.schedule(invalid as OwnedProgressNotification)).toThrow('Invalid owned notification.');
  await expect(engine.schedule({ ...owned, atMs: 1000 })).rejects.toThrow('Timer notification capability unavailable.');
  expect(mockSDK.scheduleNotificationAsync).not.toHaveBeenCalled(); expect(mockSDK.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
});
it('does not schedule or request permission after revocation or if the channel has disappeared', async () => {
  const engine = await granted(); mockPermission.granted = false;
  await expect(engine.schedule(owned)).rejects.toThrow(); mockPermission.granted = true; mockChannel = null;
  await expect(engine.schedule(owned)).rejects.toThrow(); expect(mockSDK.scheduleNotificationAsync).not.toHaveBeenCalled();
  expect(mockSDK.requestPermissionsAsync).toHaveBeenCalledTimes(1);
});
it('queries and cancels only exact owned IDs, leaving other requests and presented content alone', async () => {
  const engine = await granted(); await engine.schedule(owned);
  mockScheduled.set('other-app', { identifier: 'other-app' }); mockPresented = [{ request: { identifier: owned.identifier } }, { request: { identifier: 'other-app' } }];
  expect(await engine.inspect([owned])).toEqual({ scheduled: [owned.identifier], presented: [owned.identifier] });
  await engine.cancel(owned); expect(mockScheduled.has('other-app')).toBe(true); expect(mockPresented).toEqual([{ request: { identifier: 'other-app' } }]);
  expect(mockSDK.cancelScheduledNotificationAsync).toHaveBeenCalledWith(owned.identifier); expect(mockSDK.dismissNotificationAsync).toHaveBeenCalledWith(owned.identifier);
});
it('does not report cancellation success while native scheduled state still contains the owned request', async () => {
  const engine = await granted(); await engine.schedule(owned);
  mockSDK.cancelScheduledNotificationAsync.mockImplementationOnce(async () => {});
  await expect(engine.cancel(owned)).rejects.toThrow('Timer notification capability unavailable.');
  expect(mockScheduled.has(owned.identifier)).toBe(true); await engine.cancel(owned); expect(mockScheduled.has(owned.identifier)).toBe(false);
});
it('contains native errors generically and keeps the queue usable for explicit retry', async () => {
  const engine = await granted(); mockSDK.scheduleNotificationAsync.mockRejectedValueOnce(new Error('Synthetic internal error'));
  await expect(engine.schedule(owned)).rejects.toThrow('Timer notification capability unavailable.');
  await engine.schedule(owned); expect(mockScheduled.has(owned.identifier)).toBe(true);
});
it('serializes a cancellation after a pending schedule rather than cancelling before a late native effect', async () => {
  const engine = await granted(); let finish!: () => void;
  mockSDK.scheduleNotificationAsync.mockImplementationOnce(input => new Promise(resolve => { finish = () => { mockScheduled.set(input.identifier!, { identifier: input.identifier! }); resolve(input.identifier!); }; }));
  const schedule = engine.schedule(owned); await new Promise(resolve => setTimeout(resolve, 0));
  const cancel = engine.cancel(owned); expect(mockSDK.cancelScheduledNotificationAsync).not.toHaveBeenCalled(); finish();
  await schedule; await cancel; expect(mockScheduled.has(owned.identifier)).toBe(false);
});
it('cancels a schedule that finishes after dispose, but preserves already confirmed alarms across teardown', async () => {
  const engine = await granted(); let finish!: () => void;
  mockSDK.scheduleNotificationAsync.mockImplementationOnce(input => new Promise(resolve => { finish = () => { mockScheduled.set(input.identifier!, { identifier: input.identifier! }); resolve(input.identifier!); }; }));
  const schedule = engine.schedule(owned); const failed = expect(schedule).rejects.toThrow('Timer notification capability unavailable.');
  await new Promise(resolve => setTimeout(resolve, 0)); engine.dispose(); finish(); await failed; expect(mockScheduled.has(owned.identifier)).toBe(false);
  const next = await granted(); await next.schedule(owned); next.dispose(); expect(mockScheduled.has(owned.identifier)).toBe(true);
});
it('filters received events against current ownership and stops callbacks after unsubscribe/dispose', () => {
  const engine = createExpoProgressAlertEngine(); let entries = [owned]; const received = jest.fn(); const stop = engine.onReceived(() => entries, received);
  mockListener({ request: { identifier: 'other-app' } }); mockListener({ request: { identifier: owned.identifier } }); expect(received).toHaveBeenCalledTimes(1);
  entries = []; mockListener({ request: { identifier: owned.identifier } }); expect(received).toHaveBeenCalledTimes(1);
  stop(); stop(); entries = [owned]; mockListener({ request: { identifier: owned.identifier } }); expect(received).toHaveBeenCalledTimes(1);
  expect(mockRemove).toHaveBeenCalledTimes(1); engine.dispose(); mockListener({ request: { identifier: owned.identifier } }); expect(received).toHaveBeenCalledTimes(1);
});
it('keeps iOS provisional/ephemeral choices quiet when sound permission is disabled and never creates Android channels', async () => {
  jest.replaceProperty(Platform, 'OS', 'ios'); mockPermission.ios.status = 3;
  const engine = createExpoProgressAlertEngine(() => 1000); expect(await engine.permission()).toBe(true); await engine.schedule(owned);
  expect(mockSDK.scheduleNotificationAsync.mock.calls[0][0].content.sound).toBe(false);
  expect(mockSDK.setNotificationChannelAsync).not.toHaveBeenCalled(); expect(mockSDK.requestPermissionsAsync).not.toHaveBeenCalled();
  mockPermission.ios.status = 4; expect(await engine.permission()).toBe(true);
});
it('rejects the web preview locally without constructing an unsupported native engine', () => {
  jest.replaceProperty(Platform, 'OS', 'web'); expect(() => createExpoProgressAlertEngine()).toThrow('Timer notification capability unavailable.');
});
it('supports Android24/25 notifications without pretending channels exist on those platforms', async () => {
  jest.spyOn(Platform, 'Version', 'get').mockReturnValue(24); const engine = await granted(); await engine.schedule(owned);
  expect(mockSDK.getNotificationChannelAsync).not.toHaveBeenCalled(); expect(mockSDK.setNotificationChannelAsync).not.toHaveBeenCalled();
  expect(mockSDK.scheduleNotificationAsync.mock.calls[0][0].trigger).toEqual({ type: 'date', date: new Date(10000) });
});
it('uses authoritative iOS permission status, including quiet authorization, rather than overriding a denial', async () => {
  jest.replaceProperty(Platform, 'OS', 'ios'); mockPermission.ios.status = 2;
  const engine = createExpoProgressAlertEngine(); expect(await engine.permission()).toBe(true);
  mockPermission.granted = true; mockPermission.ios.status = 1; expect(await engine.permission()).toBe(false);
});
it('does not query native notification contents when the ledger has no owned IDs', async () => {
  const engine = createExpoProgressAlertEngine(); expect(await engine.inspect([])).toEqual({ scheduled: [], presented: [] });
  expect(mockSDK.getAllScheduledNotificationsAsync).not.toHaveBeenCalled(); expect(mockSDK.getPresentedNotificationsAsync).not.toHaveBeenCalled();
});

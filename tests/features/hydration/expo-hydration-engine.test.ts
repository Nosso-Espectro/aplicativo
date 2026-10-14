import { Platform } from 'react-native';
import type { NotificationRequestInput } from 'expo-notifications';
import { createExpoHydrationEngine } from '../../../src/features/hydration/expo-hydration-engine';
import { hydrationIdentifier, hydrationNamespace } from '../../../src/features/hydration/hydration-model';
let mockScheduled = new Map<string, NotificationRequestInput & { identifier: string }>();
let mockPresented: { request: { identifier: string } }[] = [];
let mockChannel: { importance: number; sound?: string | null; enableVibrate?: boolean } | null = null;
let mockPermission = { granted: false, canAskAgain: true, ios: { status: 0 } };
let mockListener: (event: { date: number; request: { identifier: string; content: { data: { owner: string } } } }) => void;
const mockRemove = jest.fn(); const mockLoad = jest.fn();
const mockSDK = {
  AndroidImportance: { NONE: 0, LOW: 4 }, AndroidNotificationVisibility: { PRIVATE: 0 }, AndroidNotificationPriority: { LOW: 'low' },
  IosAuthorizationStatus: { AUTHORIZED: 2, PROVISIONAL: 3, EPHEMERAL: 4 }, SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval' },
  getPermissionsAsync: jest.fn(async () => mockPermission),
  requestPermissionsAsync: jest.fn(async () => { mockPermission.granted = true; return mockPermission; }),
  getNotificationChannelAsync: jest.fn(async () => mockChannel),
  setNotificationChannelAsync: jest.fn(async (_id, input) => { mockChannel = input; return mockChannel; }),
  scheduleNotificationAsync: jest.fn(async (input: NotificationRequestInput) => { mockScheduled.set(input.identifier!, { ...input, identifier: input.identifier! }); return input.identifier!; }),
  cancelScheduledNotificationAsync: jest.fn(async (identifier: string) => { mockScheduled.delete(identifier); }),
  dismissNotificationAsync: jest.fn(async (identifier: string) => { mockPresented = mockPresented.filter(entry => entry.request.identifier !== identifier); }),
  getAllScheduledNotificationsAsync: jest.fn(async () => [...mockScheduled.values()]), getPresentedNotificationsAsync: jest.fn(async () => mockPresented),
  addNotificationReceivedListener: jest.fn((listener: typeof mockListener) => { mockListener = listener; return { remove: mockRemove }; }),
};
jest.mock('expo-notifications', () => { mockLoad(); return mockSDK; });
const entry = { identifier: hydrationIdentifier(1), intervalMinutes: 60 };
beforeEach(() => {
  jest.clearAllMocks(); mockScheduled = new Map(); mockPresented = []; mockChannel = null;
  mockPermission = { granted: false, canAskAgain: true, ios: { status: 0 } };
  jest.replaceProperty(Platform, 'OS', 'android'); jest.spyOn(Platform, 'Version', 'get').mockReturnValue(35);
});
afterEach(() => jest.restoreAllMocks());
async function granted() { const engine = createExpoHydrationEngine(); await engine.requestPermission(); return engine; }
it('loads SDK lazily and never requests permissions or creates channels on construction/query', async () => {
  expect(mockLoad).not.toHaveBeenCalled(); const engine = createExpoHydrationEngine(); expect(mockLoad).toHaveBeenCalledTimes(1);
  expect(mockSDK.getPermissionsAsync).not.toHaveBeenCalled(); expect(await engine.permission()).toBe(false);
  expect(mockSDK.requestPermissionsAsync).not.toHaveBeenCalled(); expect(mockSDK.setNotificationChannelAsync).not.toHaveBeenCalled();
});
it('requests quiet private presentation only explicitly and preserves customized or blocked channels', async () => {
  await granted(); expect(mockSDK.setNotificationChannelAsync).toHaveBeenCalledWith('tear-hydration-reminders-v1', {
    name: 'Lembretes de água', importance: 4, sound: null, enableVibrate: false, vibrationPattern: [], bypassDnd: false,
    showBadge: false, enableLights: false, lockscreenVisibility: 0,
  });
  expect(mockSDK.requestPermissionsAsync).toHaveBeenCalledWith({ ios: { allowAlert: true, allowSound: false, allowBadge: false, allowCriticalAlerts: false, allowProvisional: false, allowDisplayInCarPlay: false } });
  mockChannel = { importance: 3, sound: 'custom', enableVibrate: true }; jest.clearAllMocks(); const engine = createExpoHydrationEngine();
  expect(await engine.requestPermission()).toBe(true); expect(mockSDK.setNotificationChannelAsync).not.toHaveBeenCalled();
  mockChannel = { importance: 0 }; expect(await engine.requestPermission()).toBe(false);
});
it('keeps permanent denial inactive without re-prompting or scheduling', async () => {
  mockPermission.canAskAgain = false; const engine = createExpoHydrationEngine(); expect(await engine.requestPermission()).toBe(false);
  await expect(engine.schedule(entry)).rejects.toThrow(); expect(mockSDK.requestPermissionsAsync).not.toHaveBeenCalled(); expect(mockSDK.scheduleNotificationAsync).not.toHaveBeenCalled();
});
it('schedules a single registered relative repeating interval with only generic content and metadata', async () => {
  const engine = await granted(); await engine.schedule(entry);
  expect(mockSDK.scheduleNotificationAsync).toHaveBeenCalledWith({ identifier: entry.identifier,
    content: { title: 'Água', body: 'Uma pausa para água, se desejar.', sound: false, vibrate: [], priority: 'low', data: { owner: hydrationNamespace, intervalMinutes: 60 } },
    trigger: { type: 'timeInterval', seconds: 3600, repeats: true, channelId: 'tear-hydration-reminders-v1' },
  });
  expect(await engine.inspect()).toEqual({ scheduled: [entry], presented: [] });
});
it('rejects foreign identifiers and invalid intervals without native effects', async () => {
  const engine = await granted();
  await expect(engine.schedule({ ...entry, identifier: 'tear-transition-1-5-2' })).rejects.toThrow();
  await expect(engine.schedule({ ...entry, intervalMinutes: 29 })).rejects.toThrow();
  await expect(engine.cancel('other-app')).rejects.toThrow(); expect(mockSDK.scheduleNotificationAsync).not.toHaveBeenCalled();
  expect(mockSDK.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
});
it('filters unrelated content before inspection and cancels only exact owned requests', async () => {
  const engine = await granted(); await engine.schedule(entry);
  mockScheduled.set('tear-transition-1-5-2', { identifier: 'tear-transition-1-5-2', trigger: null,
    get content(): never { throw new Error('Must not read other module content'); } });
  mockPresented = [{ request: { identifier: entry.identifier } }, { request: { identifier: 'other-app' } }];
  expect(await engine.inspect()).toEqual({ scheduled: [entry], presented: [entry.identifier] });
  await engine.cancel(entry.identifier); expect(mockScheduled.has('tear-transition-1-5-2')).toBe(true);
  expect(mockPresented).toEqual([{ request: { identifier: 'other-app' } }]);
});
it('returns unconfirmed interval for malformed owned metadata/trigger and refuses schedule success', async () => {
  const engine = await granted(); await engine.schedule(entry);
  mockScheduled.set(entry.identifier, { identifier: entry.identifier, content: { data: { owner: hydrationNamespace, intervalMinutes: 60 } }, trigger: { channelId: 'only-a-channel' } });
  expect((await engine.inspect()).scheduled).toEqual([{ identifier: entry.identifier, intervalMinutes: null }]);
  mockSDK.scheduleNotificationAsync.mockImplementationOnce(async input => { mockScheduled.set(input.identifier!, { ...input, identifier: input.identifier!, trigger: null }); return input.identifier!; });
  await expect(engine.schedule(entry)).rejects.toThrow(); expect(mockScheduled.has(entry.identifier)).toBe(false);
});
it('does not pretend cancellation succeeded when the native request is still present', async () => {
  const engine = await granted(); await engine.schedule(entry); mockSDK.cancelScheduledNotificationAsync.mockImplementationOnce(async () => {});
  await expect(engine.cancel(entry.identifier)).rejects.toThrow(); expect(mockScheduled.has(entry.identifier)).toBe(true);
  await engine.cancel(entry.identifier); expect(mockScheduled.has(entry.identifier)).toBe(false);
});
it('contains native errors without private details and keeps the queue usable for explicit retry', async () => {
  const engine = await granted(); mockSDK.scheduleNotificationAsync.mockRejectedValueOnce(new Error('synthetic private detail'));
  await expect(engine.schedule(entry)).rejects.toThrow('Hydration notification capability unavailable.');
  await engine.schedule(entry); expect(mockScheduled.has(entry.identifier)).toBe(true);
});
it('serializes cancellation after a pending schedule and compensates a late schedule after dispose', async () => {
  const engine = await granted(); let finish!: () => void;
  mockSDK.scheduleNotificationAsync.mockImplementationOnce(input => new Promise(resolve => { finish = () => { mockScheduled.set(input.identifier!, { ...input, identifier: input.identifier! }); resolve(input.identifier!); }; }));
  const scheduling = engine.schedule(entry); await new Promise(resolve => setTimeout(resolve, 0));
  const canceling = engine.cancel(entry.identifier); expect(mockSDK.cancelScheduledNotificationAsync).not.toHaveBeenCalled(); finish();
  await scheduling; await canceling; expect(mockScheduled.has(entry.identifier)).toBe(false);
  mockSDK.scheduleNotificationAsync.mockImplementationOnce(input => new Promise(resolve => { finish = () => { mockScheduled.set(input.identifier!, { ...input, identifier: input.identifier! }); resolve(input.identifier!); }; }));
  const late = engine.schedule(entry); const failed = expect(late).rejects.toThrow(); await new Promise(resolve => setTimeout(resolve, 0));
  engine.dispose(); finish(); await failed; expect(mockScheduled.has(entry.identifier)).toBe(false);
});
it.each(['tear-transition-1-5-2', 'tear-hydration-v1-99', 'tear-hydration-v2-99-0'])('never cancels divergent returned identifier %s or a newer owner', async returned => {
  const engine = await granted();
  mockScheduled.set(returned, { identifier: returned, content: {}, trigger: null });
  mockSDK.scheduleNotificationAsync.mockImplementationOnce(async input => {
    mockScheduled.set(input.identifier!, { ...input, identifier: input.identifier! }); return returned;
  });
  await expect(engine.schedule(entry)).rejects.toThrow();
  expect(mockScheduled.has(returned)).toBe(true); expect(mockScheduled.has(entry.identifier)).toBe(false);
  expect(mockSDK.cancelScheduledNotificationAsync).toHaveBeenCalledWith(entry.identifier);
  expect(mockSDK.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith(returned);
});
it('preserves already confirmed alarms across dispose and processes only current owned received events', async () => {
  const engine = await granted(); await engine.schedule(entry); let owned: string | null = entry.identifier; const received = jest.fn();
  const stop = engine.onReceived(() => owned, received);
  mockListener({ date: 1000, request: { identifier: 'other-app', get content(): never { throw new Error('Foreign content'); } } });
  mockListener({ date: 1000, request: { identifier: entry.identifier, content: { data: { owner: hydrationNamespace } } } }); expect(received).toHaveBeenCalledWith(entry.identifier, 1000);
  owned = null; mockListener({ date: 2000, request: { identifier: entry.identifier, content: { data: { owner: hydrationNamespace } } } }); expect(received).toHaveBeenCalledTimes(1);
  stop(); stop(); expect(mockRemove).toHaveBeenCalledTimes(1); engine.dispose(); expect(mockScheduled.has(entry.identifier)).toBe(true);
});
it('uses authoritative iOS quiet authorization and supports Android24 without fictional channels', async () => {
  jest.replaceProperty(Platform, 'OS', 'ios'); mockPermission.ios.status = 3; const ios = createExpoHydrationEngine();
  expect(await ios.permission()).toBe(true); await ios.schedule(entry); expect(mockSDK.setNotificationChannelAsync).not.toHaveBeenCalled();
  mockPermission.ios.status = 1; mockPermission.granted = true; expect(await ios.permission()).toBe(false);
  jest.replaceProperty(Platform, 'OS', 'android'); jest.spyOn(Platform, 'Version', 'get').mockReturnValue(24); jest.clearAllMocks();
  const android = createExpoHydrationEngine(); await android.schedule(entry); expect(mockSDK.getNotificationChannelAsync).not.toHaveBeenCalled();
  expect(mockSDK.scheduleNotificationAsync.mock.calls[0][0].trigger).toEqual({ type: 'timeInterval', seconds: 3600, repeats: true });
});
it.each(['ios', 'android'] as const)('normalizes %s received dates to epoch milliseconds and refuses invalid timestamps', platform => {
  jest.replaceProperty(Platform, 'OS', platform);
  const engine = createExpoHydrationEngine(); const received = jest.fn();
  engine.onReceived(() => entry.identifier, received);
  const event = (date: number) => ({ date, request: { identifier: entry.identifier, content: { data: { owner: hydrationNamespace } } } });
  const milliseconds = 1791987182123;
  mockListener(event(platform === 'ios' ? milliseconds / 1000 : milliseconds));
  expect(received).toHaveBeenCalledWith(entry.identifier, milliseconds);
  for (const invalid of [NaN, Infinity, -1, Number.MAX_SAFE_INTEGER + 1]) mockListener(event(invalid));
  if (platform === 'android') mockListener(event(milliseconds + 0.5));
  expect(received).toHaveBeenCalledTimes(1);
  engine.dispose();
});
it('rejects the web preview without requesting permission or scheduling anything', () => {
  jest.replaceProperty(Platform, 'OS', 'web'); expect(() => createExpoHydrationEngine()).toThrow();
  expect(mockSDK.getPermissionsAsync).not.toHaveBeenCalled(); expect(mockSDK.scheduleNotificationAsync).not.toHaveBeenCalled();
});

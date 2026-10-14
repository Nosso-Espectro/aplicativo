/** @jest-environment-options {"customExportConditions": ["node", "node-addons"]} */
/// <reference types="node" />
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import dependencies from '../../package.json';
import app from '../../app.json';
type Node = { $: Record<string, string> };
type Results = { android: { manifest: { manifest: { 'uses-permission': Node[]; application: (Node & { service?: Node[]; provider?: Node[]; 'meta-data'?: Node[] })[] } } }; ios: { entitlements: Record<string, unknown>; infoPlist: Record<string, unknown> } };
let results: Results;
beforeAll(() => {
  const root = resolve(__dirname, '../..');
  const native = ['android', 'ios'].map(name => resolve(root, name)); const before = native.map(path => existsSync(path));
  const output = execFileSync(process.execPath, [require.resolve('expo/bin/cli'), 'config', '--type', 'introspect', '--json'], {
    cwd: root, encoding: 'utf8', timeout: 30000, env: { ...process.env, EXPO_NO_TELEMETRY: '1' },
  });
  results = (JSON.parse(output) as { _internal: { modResults: Results } })._internal.modResults;
  expect(native.map(path => existsSync(path))).toEqual(before);
}, 35000);
it('pins the local-notification SDK and explicitly disables remote background support', () => {
  expect(dependencies.dependencies['expo-notifications']).toBe('57.0.22');
  expect(app.expo.plugins).toContainEqual(['expo-notifications', { enableBackgroundRemoteNotifications: false }]);
  expect(app.expo.plugins).toContain('./plugins/with-local-notifications.cjs');
  expect(JSON.stringify(app)).not.toContain('googleServicesFile');
});
it('declares notification capabilities but blocks exact-alarm and notification-policy privileges', () => {
  const permissions = results.android.manifest.manifest['uses-permission'];
  const active = permissions.filter(node => node.$['tools:node'] !== 'remove').map(node => node.$['android:name']);
  expect(active).toEqual(expect.arrayContaining(['android.permission.POST_NOTIFICATIONS', 'android.permission.VIBRATE', 'android.permission.RECEIVE_BOOT_COMPLETED']));
  for (const name of ['SCHEDULE_EXACT_ALARM', 'USE_EXACT_ALARM', 'ACCESS_NOTIFICATION_POLICY', 'RECORD_AUDIO']) expect(active).not.toContain(`android.permission.${name}`);
});
it('removes remote Firebase entry points and disables messaging/analytics auto-init in evaluated mods', () => {
  const application = results.android.manifest.manifest.application[0];
  expect(application.service).toContainEqual({ $: { 'android:name': 'expo.modules.notifications.service.ExpoFirebaseMessagingService', 'tools:node': 'remove' } });
  expect(application.provider).toContainEqual({ $: { 'android:name': 'com.google.firebase.provider.FirebaseInitProvider', 'tools:node': 'remove' } });
  for (const name of ['firebase_messaging_auto_init_enabled', 'firebase_analytics_collection_enabled']) expect(application['meta-data']).toContainEqual({ $: { 'android:name': name, 'android:value': 'false' } });
  expect(application.$['android:allowBackup']).toBe('false');
});
it('keeps iOS local-only without APNs entitlement or remote background mode and preserves background audio', () => {
  expect(results.ios.entitlements).not.toHaveProperty('aps-environment');
  expect(results.ios.infoPlist.UIBackgroundModes).toEqual(['audio']);
  expect(results.ios.infoPlist).not.toHaveProperty('NSMicrophoneUsageDescription');
});
it('preserves full Expo license texts and documents the upstream MIT license omitted from badgin npm', () => {
  const notices = readFileSync(resolve(__dirname, '../../docs/third-party-notices/expo-notifications.txt'), 'utf8');
  for (const module of ['expo-notifications', 'expo-application']) expect(notices).toContain(readFileSync(require.resolve(`${module}/LICENSE`), 'utf8').trim());
  expect(notices).toContain('Copyright (c) 2019 Julian Hundeloh'); expect(notices).toContain('bb02b4ba8ca6a4350fdffd025f24b07c8f962f68');
});

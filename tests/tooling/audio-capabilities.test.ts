/** @jest-environment-options {"customExportConditions": ["node", "node-addons"]} */
/// <reference types="node" />
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import app from '../../app.json';
import dependencies from '../../package.json';

type Node = { $: Record<string, string> };
type Results = {
  android: { manifest: { manifest: {
    'uses-permission': Node[];
    application: (Node & { service?: Node[] })[];
  } } };
  ios: { infoPlist: Record<string, unknown> };
};
let results: Results;
beforeAll(() => {
  const root = resolve(__dirname, '../..');
  const nativeDirectories = ['android', 'ios'].map(name => resolve(root, name));
  const before = nativeDirectories.map(path => existsSync(path));
  // Introspection evaluates real config-plugin mods in memory, not prebuild or compilation.
  const output = execFileSync(process.execPath, [require.resolve('expo/bin/cli'), 'config', '--type', 'introspect', '--json'], {
    cwd: root, encoding: 'utf8', timeout: 30000, env: { ...process.env, EXPO_NO_TELEMETRY: '1' },
  });
  results = (JSON.parse(output) as { _internal: { modResults: Results } })._internal.modResults;
  expect(nativeDirectories.map(path => existsSync(path))).toEqual(before);
}, 35000);

it('pins only the SDK-compatible audio/slider capabilities and explicitly opts out of recording', () => {
  expect(dependencies.dependencies['expo-audio']).toBe('57.0.5');
  expect(dependencies.dependencies['expo-asset']).toBe('57.0.19');
  expect(dependencies.dependencies['@react-native-community/slider']).toBe('5.2.0');
  expect(app.expo.plugins).toContainEqual(['expo-audio', {
    microphonePermission: false, recordAudioAndroid: false,
    enableBackgroundRecording: false, enableBackgroundPlayback: true,
  }]);
});

it('declares only the media foreground service, not an exported or recording service', () => {
  const services = results.android.manifest.manifest.application[0].service ?? [];
  expect(services.filter(service => service.$['android:name'].startsWith('expo.modules.audio.'))).toEqual([
    expect.objectContaining({ $: {
      'android:name': 'expo.modules.audio.service.AudioControlsService',
      'android:exported': 'false', 'android:foregroundServiceType': 'mediaPlayback',
    } }),
  ]);
});

it('blocks microphone permission and does not add recording foreground or notification permissions', () => {
  const permissions = results.android.manifest.manifest['uses-permission'];
  const effective = permissions.filter(permission => permission.$['tools:node'] !== 'remove')
    .map(permission => permission.$['android:name']);
  expect(effective).toEqual(expect.arrayContaining([
    'android.permission.MODIFY_AUDIO_SETTINGS', 'android.permission.FOREGROUND_SERVICE',
    'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
  ]));
  for (const name of ['RECORD_AUDIO', 'FOREGROUND_SERVICE_MICROPHONE', 'POST_NOTIFICATIONS']) {
    expect(effective).not.toContain(`android.permission.${name}`);
  }
  expect(permissions).toContainEqual({ $: { 'android:name': 'android.permission.RECORD_AUDIO', 'tools:node': 'remove' } });
  expect(results.android.manifest.manifest.application[0].$['android:allowBackup']).toBe('false');
});

it('allows iOS background audio without a microphone prompt or unrelated new mode', () => {
  expect(results.ios.infoPlist.UIBackgroundModes).toEqual(['audio']);
  expect(results.ios.infoPlist).not.toHaveProperty('NSMicrophoneUsageDescription');
  expect(results.ios.infoPlist.LSApplicationQueriesSchemes).toEqual(['whatsapp']);
});

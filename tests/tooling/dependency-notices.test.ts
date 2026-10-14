/** @jest-environment-options {"customExportConditions": ["node", "node-addons"]} */
/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';

const root = resolve(__dirname, '../..');
type Step = { name: string; run?: string; with?: { path?: string } };
const workflow = parse(readFileSync(resolve(root, '.github/workflows/mobile-quality.yml'), 'utf8')) as { jobs: Record<string, { steps: Step[] }> };
it('preserves both dependency license texts in the notices distributed with native artifacts', () => {
  const notices = readFileSync(resolve(root, 'docs/third-party-notices/libphonenumber-js.txt'), 'utf8');
  expect(notices).toContain('libphonenumber-js 1.13.15');
  for (const filename of ['LICENSE', 'LICENSE.Apache']) expect(notices).toContain(readFileSync(resolve(root, 'node_modules/libphonenumber-js', filename), 'utf8'));
});
it('preserves the audio package MIT license exactly and the slider upstream notice', () => {
  const audio = readFileSync(resolve(root, 'docs/third-party-notices/expo-audio.txt'), 'utf8');
  expect(audio).toContain('expo-audio 57.0.5');
  expect(audio).toContain(readFileSync(resolve(root, 'node_modules/expo-audio/LICENSE'), 'utf8').trim());
  expect(audio).toContain('expo-asset 57.0.20');
  expect(audio).toContain(readFileSync(resolve(root, 'node_modules/expo-asset/LICENSE'), 'utf8').trim());
  const slider = readFileSync(resolve(root, 'docs/third-party-notices/react-native-slider.txt'), 'utf8');
  expect(slider).toContain('@react-native-community/slider 5.2.0');
  expect(slider).toContain('a7c1169f292763efb43b3089cd7b513a9db94d8b/LICENSE.md');
  expect(slider).toContain('Copyright (c) 2019 react-native-community');
  expect(slider).toContain('Permission is hereby granted, free of charge');
});
it('preserves the clipboard package MIT license in the notices distributed with artifacts', () => {
  const notice = readFileSync(resolve(root, 'docs/third-party-notices/expo-clipboard.txt'), 'utf8');
  expect(notice).toContain('expo-clipboard 57.0.2');
  expect(notice).toContain(readFileSync(resolve(root, 'node_modules/expo-clipboard/LICENSE'), 'utf8').trim());
});
it('keeps Expo SDK patch licenses complete and manifest, lockfile and installed versions coherent', () => {
  const notice = readFileSync(resolve(root, 'docs/third-party-notices/expo-sdk-57.txt'), 'utf8');
  const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { dependencies: Record<string, string> };
  const lock = JSON.parse(readFileSync(resolve(root, 'package-lock.json'), 'utf8')) as { packages: Record<string, { version?: string; dependencies?: Record<string, string> }> };
  const versions = { expo: '57.0.29', 'expo-asset': '57.0.20', 'expo-constants': '57.0.22', 'expo-linking': '57.0.13', 'expo-notifications': '57.0.23', 'expo-router': '57.0.27' };
  for (const [name, version] of Object.entries(versions)) {
    expect(manifest.dependencies[name].replace(/^~/, '')).toBe(version);
    expect(lock.packages[''].dependencies?.[name]).toBe(manifest.dependencies[name]);
    expect(lock.packages[`node_modules/${name}`].version).toBe(version);
    const installed = JSON.parse(readFileSync(resolve(root, 'node_modules', name, 'package.json'), 'utf8')) as { version: string };
    expect(installed.version).toBe(version);
  }
  for (const name of ['expo', 'expo-constants', 'expo-linking', 'expo-modules-core', 'expo-modules-autolinking', '@expo/metro-runtime', '@expo/prebuild-config', 'expo/node_modules/@expo/cli']) {
    expect(notice).toContain(readFileSync(resolve(root, 'node_modules', name, 'LICENSE'), 'utf8').trim());
  }
  expect(notice).toContain('expo-router 57.0.27');
  expect(notice).toContain('@expo/ui 57.0.24');
  expect(notice).toContain('https://github.com/expo/expo/blob/sdk-57/LICENSE');
  const notifications = readFileSync(resolve(root, 'docs/third-party-notices/expo-notifications.txt'), 'utf8');
  expect(notifications).toContain('expo-notifications 57.0.23');
  expect(notifications).toContain(readFileSync(resolve(root, 'node_modules/expo-notifications/LICENSE'), 'utf8').trim());
});
it.each([
  { job: 'android-build', binary: 'build/android/*.apk', destination: 'build/android/THIRD_PARTY_NOTICES.txt', upload: 'Upload Android APK' },
  { job: 'ios-build', binary: 'build/tear-ios-simulator.zip', destination: 'build/THIRD_PARTY_NOTICES.txt', upload: 'Upload iOS simulator app' },
])('pairs the $job artifact with its notices without removing the existing binary path', ({ job, binary, destination, upload }) => {
  const steps = workflow.jobs[job].steps;
  const copyIndex = steps.findIndex((step) => step.name === 'Include third-party notices');
  const uploadIndex = steps.findIndex((step) => step.name === upload);
  expect(copyIndex).toBeGreaterThan(-1); expect(uploadIndex).toBeGreaterThan(copyIndex);
  expect(steps[copyIndex].run).toBe(`cat docs/third-party-notices/*.txt > ${destination}`);
  expect(steps[uploadIndex].with?.path?.trim().split('\n')).toEqual([binary, destination]);
});

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
it.each([
  { job: 'android-build', binary: 'build/android/*.apk', destination: 'build/android/THIRD_PARTY_NOTICES.txt', upload: 'Upload Android APK' },
  { job: 'ios-build', binary: 'build/tear-ios-simulator.zip', destination: 'build/THIRD_PARTY_NOTICES.txt', upload: 'Upload iOS simulator app' },
])('pairs the $job artifact with its notices without removing the existing binary path', ({ job, binary, destination, upload }) => {
  const steps = workflow.jobs[job].steps;
  const copyIndex = steps.findIndex((step) => step.name === 'Include third-party notices');
  const uploadIndex = steps.findIndex((step) => step.name === upload);
  expect(copyIndex).toBeGreaterThan(-1); expect(uploadIndex).toBeGreaterThan(copyIndex);
  expect(steps[copyIndex].run).toBe(`cp docs/third-party-notices/libphonenumber-js.txt ${destination}`);
  expect(steps[uploadIndex].with?.path?.trim().split('\n')).toEqual([binary, destination]);
});

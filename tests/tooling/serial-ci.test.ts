/** @jest-environment-options {"customExportConditions": ["node", "node-addons"]} */
/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';

type Step = { name: string; run?: string; 'continue-on-error'?: boolean };
type Workflow = { jobs: { quality: { steps: Step[]; 'continue-on-error'?: boolean } } };
it('runs the full CI suite serially without weakening lint, types, Doctor or failure propagation', () => {
  const workflow = parse(readFileSync(resolve(__dirname, '../../.github/workflows/mobile-quality.yml'), 'utf8')) as Workflow;
  const { quality } = workflow.jobs;
  const expected = { Lint: 'npm run lint', Typecheck: 'npm run typecheck', Tests: 'npm test -- --ci --runInBand', 'Expo Doctor': 'npx expo-doctor' };
  expect(quality['continue-on-error']).not.toBe(true);
  for (const [name, command] of Object.entries(expected)) {
    const steps = quality.steps.filter(step => step.name === name);
    expect(steps).toHaveLength(1);
    expect(steps[0].run).toBe(command);
    expect(steps[0]['continue-on-error']).not.toBe(true);
  }
});

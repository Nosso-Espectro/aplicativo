import { supportCardOrientations } from '../../../src/features/support-plan/support-card';
import { emptySupportPlan, type SupportPlan } from '../../../src/features/support-plan/support-plan';

it('keeps an empty plan empty without default suggestions', () => {
  expect(supportCardOrientations(emptySupportPlan)).toEqual([]);
});
it('presents saved free text first and only selected original suggestions in stable order', () => {
  expect(supportCardOrientations({ instructions: '  Orientação sintética\nSegunda linha  ', suggestions: ['quiet', 'no-touch', 'quiet'], profileFields: [] })).toEqual([
    { id: 'instructions', value: 'Orientação sintética\nSegunda linha' },
    { id: 'no-touch', value: 'Não me toque' }, { id: 'quiet', value: 'Preciso de silêncio' },
  ]);
});
it('does not turn profile reference IDs into values or invent stored profile text', () => {
  expect(supportCardOrientations({ ...emptySupportPlan, profileFields: ['light', 'helpfulStrategies'] })).toEqual([]);
});
it('does not mutate the stored plan and rejects unsupported suggestions generically', () => {
  const plan: SupportPlan = { instructions: ' Sintético ', suggestions: ['response-time'], profileFields: [] };
  const before = JSON.parse(JSON.stringify(plan)); supportCardOrientations(plan); expect(plan).toEqual(before);
  expect(() => supportCardOrientations({ ...plan, suggestions: ['unknown'] } as unknown as SupportPlan)).toThrow('Invalid support plan.');
});

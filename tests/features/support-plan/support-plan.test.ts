import { emptySupportPlan, hasSupportPlan, normalizedSupportPlan, suggestedOrientations, type SupportPlan } from '../../../src/features/support-plan/support-plan';
import { supportForPlan, emptySupportPreferences } from '../../../src/features/communication-profile/support-preferences';

it('starts empty with no suggested orientation or profile field chosen — spec004/RF-001', () => {
  const first = normalizedSupportPlan(emptySupportPlan); const second = normalizedSupportPlan(emptySupportPlan);
  expect(first).toEqual({ instructions: '', suggestions: [], profileFields: [] }); expect(hasSupportPlan(first)).toBe(false);
  first.suggestions.push('quiet'); expect(second.suggestions).toEqual([]); expect(emptySupportPlan.suggestions).toEqual([]);
});
it('includes exactly the four examples required by the backlog — spec004/RF-002', () => {
  expect(suggestedOrientations.map(({ label }) => label)).toEqual(['Não me toque', 'Fale pouco', 'Preciso de silêncio', 'Dê-me tempo para responder']);
});
it('preserves free orientation text, deduplicates choices and orders them predictably — spec004/RF-001', () => {
  const plan = normalizedSupportPlan({ instructions: '  Orientação sintética\nOutro parágrafo  ', suggestions: ['quiet', 'no-touch', 'quiet'],
    profileFields: ['helpfulStrategies', 'sound', 'sound'] });
  expect(plan).toEqual({ instructions: 'Orientação sintética\nOutro parágrafo', suggestions: ['no-touch', 'quiet'], profileFields: ['sound', 'helpfulStrategies'] });
  expect(hasSupportPlan(plan)).toBe(true);
});
it('allows editing and clearing each source independently — spec004/RF-003', () => {
  const plan = normalizedSupportPlan({ instructions: 'Texto', suggestions: ['few-words'], profileFields: ['sound'] });
  expect(normalizedSupportPlan({ ...plan, instructions: '' })).toEqual({ instructions: '', suggestions: ['few-words'], profileFields: ['sound'] });
  expect(hasSupportPlan({ ...emptySupportPlan, instructions: 'Orientação' })).toBe(true);
  expect(hasSupportPlan({ ...emptySupportPlan, suggestions: ['response-time'] })).toBe(true);
  expect(hasSupportPlan({ ...emptySupportPlan, profileFields: ['light'] })).toBe(true);
  expect(hasSupportPlan(emptySupportPlan)).toBe(false);
});
it('stores references only, reading current chosen support without copying unselected or removed data', () => {
  const plan = normalizedSupportPlan({ ...emptySupportPlan, profileFields: ['helpfulStrategies'] });
  const current = { ...emptySupportPreferences, sound: 'Não escolhido', helpfulStrategies: 'Pausa sintética' };
  expect(supportForPlan(current, plan.profileFields)).toEqual([{ field: 'helpfulStrategies', label: 'Estratégias que ajudam', value: 'Pausa sintética' }]);
  expect(supportForPlan(emptySupportPreferences, plan.profileFields)).toEqual([]);
  expect(plan).toEqual({ instructions: '', suggestions: [], profileFields: ['helpfulStrategies'] });
});
it('rejects malformed input with a generic error that contains no entered content', () => {
  for (const input of [null, { ...emptySupportPlan, instructions: null }, { ...emptySupportPlan, suggestions: ['private invalid'] },
    { ...emptySupportPlan, profileFields: ['private invalid'] }, { ...emptySupportPlan, profileFields: null }]) {
    expect(() => normalizedSupportPlan(input as unknown as SupportPlan)).toThrow('Invalid support plan.');
  }
});

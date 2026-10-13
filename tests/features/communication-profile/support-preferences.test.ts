import { emptySupportPreferences, normalizedSupportPreferences, supportForPlan, type SupportField } from '../../../src/features/communication-profile/support-preferences';
it('normalizes optional free text without mutating the original or imposing clinical categories', () => {
  const input = { ...emptySupportPreferences, sound: '  Teste de som  ', helpfulStrategies: 'Uma estratégia\nOutra estratégia' };
  expect(normalizedSupportPreferences(input)).toEqual({ ...input, sound: 'Teste de som' });
  expect(input.sound).toBe('  Teste de som  ');
});
it('returns no information for the plan until fields are explicitly selected', () => {
  expect(supportForPlan({ ...emptySupportPreferences, sound: 'Teste', avoidStrategies: 'Teste a evitar' })).toEqual([]);
});
it('returns only selected nonempty fields in selection order without duplicates', () => {
  expect(supportForPlan({ ...emptySupportPreferences, sound: 'Som', light: 'Luz', helpfulStrategies: 'Ajuda' }, ['helpfulStrategies', 'other', 'sound', 'sound'])).toEqual([
    { field: 'helpfulStrategies', label: 'Estratégias que ajudam', value: 'Ajuda' },
    { field: 'sound', label: 'Som', value: 'Som' },
  ]);
});
it('reflects editing/removal on the next read rather than retaining a copied plan snapshot', () => {
  const current = { ...emptySupportPreferences, sound: 'Anterior' };
  expect(supportForPlan(current, ['sound'])[0].value).toBe('Anterior');
  expect(supportForPlan({ ...current, sound: 'Atual' }, ['sound'])[0].value).toBe('Atual');
  expect(supportForPlan({ ...current, sound: '' }, ['sound'])).toEqual([]);
});
it('rejects unrecognized selection fields without exposing input content', () => {
  expect(() => supportForPlan(emptySupportPreferences, ['private-content' as SupportField])).toThrow('Invalid support selection.');
});

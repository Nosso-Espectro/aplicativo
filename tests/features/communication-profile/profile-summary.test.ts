import { emptyPreferences } from '../../../src/features/communication-profile/preferences';
import { emptySupportPreferences } from '../../../src/features/communication-profile/support-preferences';
import { buildProfileSummary, normalizedSummarySelection, type SummaryField } from '../../../src/features/communication-profile/profile-summary';

it('reveals no data until explicit selection', () => {
  expect(buildProfileSummary({ ...emptyPreferences, communication: 'Texto sintético' }, { ...emptySupportPreferences, sound: 'Som sintético' })).toEqual([]);
});
it('includes only chosen nonempty current values in stable order without duplicates', () => {
  const result = buildProfileSummary({ ...emptyPreferences, communication: ' Texto ', instructions: 'Não escolhido' },
    { ...emptySupportPreferences, sound: ' Som ', light: '' }, ['sound', 'light', 'communication', 'sound']);
  expect(result.map((entry) => [entry.field, entry.value])).toEqual([['communication', 'Texto'], ['sound', 'Som']]);
});
it('distinguishes explicitly false additional time from uninformed', () => {
  expect(buildProfileSummary({ ...emptyPreferences, extraTime: false }, emptySupportPreferences, ['extraTime'])[0].value).toBe('Não preciso de tempo adicional.');
  expect(buildProfileSummary(emptyPreferences, emptySupportPreferences, ['extraTime'])).toEqual([]);
});
it('reflects editing and removal without retaining an old content snapshot', () => {
  expect(buildProfileSummary(emptyPreferences, { ...emptySupportPreferences, helpfulStrategies: 'Pausa' }, ['helpfulStrategies'])[0].value).toBe('Pausa');
  expect(buildProfileSummary(emptyPreferences, emptySupportPreferences, ['helpfulStrategies'])).toEqual([]);
});
it('rejects unknown selection fields without exposing supplied content', () => {
  expect(() => normalizedSummarySelection(['private input' as SummaryField])).toThrow('Invalid summary selection.');
});

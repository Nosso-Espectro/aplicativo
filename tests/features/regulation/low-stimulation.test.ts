import { defaultLowStimulationPreference, lowStimulationPresentation, normalizedLowStimulationPreference, type LowStimulationPreference } from '../../../src/features/regulation/low-stimulation';

it('starts voluntarily disabled and does not mutate shared defaults when a copy is edited — spec005/RF-004', () => {
  const copy = normalizedLowStimulationPreference(defaultLowStimulationPreference); copy.enabled = true;
  expect(defaultLowStimulationPreference).toEqual({ enabled: false });
  expect(normalizedLowStimulationPreference(defaultLowStimulationPreference)).toEqual({ enabled: false });
});
it.each([
  { enabled: false, reduceMotion: false, showBrandImage: true, navigationAnimation: 'default' },
  { enabled: true, reduceMotion: false, showBrandImage: false, navigationAnimation: 'none' },
  { enabled: false, reduceMotion: true, showBrandImage: true, navigationAnimation: 'none' },
  { enabled: true, reduceMotion: true, showBrandImage: false, navigationAnimation: 'none' },
])('maps mode=$enabled and system motion=$reduceMotion independently — RF-001', ({ enabled, reduceMotion, showBrandImage, navigationAnimation }) => {
  const preference = { enabled };
  expect(lowStimulationPresentation(preference, reduceMotion)).toEqual({ showBrandImage, navigationAnimation });
  expect(preference).toEqual({ enabled });
});
it('rejects ambiguous/corrupted flags instead of enabling a mode through coercion', () => {
  for (const input of [null, {}, { enabled: 1 }, { enabled: 'false' }]) {
    expect(() => normalizedLowStimulationPreference(input as LowStimulationPreference)).toThrow('Invalid display preference.');
  }
  expect(() => lowStimulationPresentation(defaultLowStimulationPreference, 'false' as unknown as boolean)).toThrow('Invalid motion preference.');
});

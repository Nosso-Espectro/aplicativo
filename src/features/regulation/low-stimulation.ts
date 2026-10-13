export type LowStimulationPreference = { enabled: boolean };
export const defaultLowStimulationPreference: LowStimulationPreference = { enabled: false };

export function normalizedLowStimulationPreference(input: LowStimulationPreference): LowStimulationPreference {
  if (!input || typeof input.enabled !== 'boolean') throw new Error('Invalid display preference.');
  return { enabled: input.enabled };
}

export function lowStimulationPresentation(input: LowStimulationPreference, reduceMotion = false) {
  const { enabled } = normalizedLowStimulationPreference(input);
  if (typeof reduceMotion !== 'boolean') throw new Error('Invalid motion preference.');
  return { showBrandImage: !enabled, navigationAnimation: enabled || reduceMotion ? 'none' as const : 'default' as const };
}

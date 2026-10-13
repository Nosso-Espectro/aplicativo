export const soundOptions = [
  { id: 'white', label: 'Ruído branco' },
  { id: 'brown', label: 'Ruído marrom' },
  { id: 'rain', label: 'Chuva sintetizada' },
  { id: 'ocean', label: 'Oceano sintetizado' },
] as const;
export type SoundId = typeof soundOptions[number]['id'];
export type SoundSettings = { selectedSoundId: SoundId | null; volume: number; backgroundPlayback: boolean };
export const initialSoundSettings: SoundSettings = { selectedSoundId: null, volume: 0.25, backgroundPlayback: false };

export function normalizedSoundSettings(input: SoundSettings): SoundSettings {
  if (!input || (input.selectedSoundId !== null && !soundOptions.some((sound) => sound.id === input.selectedSoundId))
    || typeof input.volume !== 'number' || !Number.isFinite(input.volume) || input.volume < 0 || input.volume > 1
    || typeof input.backgroundPlayback !== 'boolean') throw new Error('Invalid sound settings.');
  return { selectedSoundId: input.selectedSoundId, volume: input.volume, backgroundPlayback: input.backgroundPlayback };
}
export function selectSoundSettings(current: SoundSettings, id: SoundId): SoundSettings {
  return normalizedSoundSettings({ ...normalizedSoundSettings(current), selectedSoundId: id });
}
export function withSoundVolume(current: SoundSettings, volume: number): SoundSettings {
  return normalizedSoundSettings({ ...normalizedSoundSettings(current), volume });
}
export function withBackgroundPlayback(current: SoundSettings, enabled: boolean): SoundSettings {
  return normalizedSoundSettings({ ...normalizedSoundSettings(current), backgroundPlayback: enabled });
}

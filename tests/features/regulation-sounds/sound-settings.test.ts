import { initialSoundSettings, normalizedSoundSettings, selectSoundSettings, soundOptions, withBackgroundPlayback, withSoundVolume, type SoundId, type SoundSettings } from '../../../src/features/regulation-sounds/sound-settings';

it('defines four distinct choices with honest synthesis labels — spec011/RF-001 model only', () => {
  expect(soundOptions.map((sound) => sound.id)).toEqual(['white', 'brown', 'rain', 'ocean']);
  expect(new Set(soundOptions.map((sound) => sound.id)).size).toBe(4);
  expect(soundOptions.map((sound) => sound.label)).toEqual(['Ruído branco', 'Ruído marrom', 'Chuva sintetizada', 'Oceano sintetizado']);
});
it('starts without a selection or background opt-in and clones defaults rather than mutating them', () => {
  expect(initialSoundSettings).toEqual({ selectedSoundId: null, volume: 0.25, backgroundPlayback: false });
  const draft = normalizedSoundSettings(initialSoundSettings); draft.volume = 0;
  expect(initialSoundSettings.volume).toBe(0.25);
});
it('selects only a known ID, keeps choices independent of playback status and preserves other preferences', () => {
  const original = withBackgroundPlayback(withSoundVolume(initialSoundSettings, 0.5), true);
  const selected = selectSoundSettings(original, 'rain');
  expect(selected).toEqual({ selectedSoundId: 'rain', volume: 0.5, backgroundPlayback: true });
  expect(original.selectedSoundId).toBeNull();
  expect(() => selectSoundSettings(original, 'https://invalid.example/audio' as SoundId)).toThrow('Invalid sound settings.');
});
it('accepts local gain endpoints including zero without changing selection/background — spec011/RF-002', () => {
  const selected = selectSoundSettings(initialSoundSettings, 'brown');
  expect(withSoundVolume(selected, 0)).toEqual({ ...selected, volume: 0 });
  expect(withSoundVolume(selected, 1)).toEqual({ ...selected, volume: 1 });
  expect(selected.volume).toBe(0.25);
});
it('rejects non-finite, out-of-range and coerced gain values without leaking their contents', () => {
  for (const value of [NaN, Infinity, -0.01, 1.01, 'private invalid gain', true]) {
    expect(() => withSoundVolume(initialSoundSettings, value as unknown as number)).toThrow('Invalid sound settings.');
  }
});
it('requires an explicit boolean background choice without selecting or representing audio as playing', () => {
  expect(withBackgroundPlayback(initialSoundSettings, true)).toEqual({ selectedSoundId: null, volume: 0.25, backgroundPlayback: true });
  expect(() => withBackgroundPlayback(initialSoundSettings, 'true' as unknown as boolean)).toThrow('Invalid sound settings.');
  for (const input of [null, {}, { ...initialSoundSettings, selectedSoundId: false }, { ...initialSoundSettings, backgroundPlayback: 1 }]) {
    expect(() => normalizedSoundSettings(input as unknown as SoundSettings)).toThrow('Invalid sound settings.');
  }
});

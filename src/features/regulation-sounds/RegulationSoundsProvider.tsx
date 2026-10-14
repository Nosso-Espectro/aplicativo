import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { createSoundController, type SoundEngineFactory, type SoundState } from './sound-controller';
import { createExpoSoundEngine } from './expo-sound-engine';

export type SpeechLease = { ready: Promise<void>; release(): void };
type Controller = ReturnType<typeof createSoundController>;
type Value = { controller: Controller; state: SoundState };
const Context = createContext<Value | null>(null);
const noSoundLease = () => ({ ready: Promise.resolve(), release() {} });

export function RegulationSoundsProvider({ children, factory = createExpoSoundEngine }: { children: ReactNode; factory?: SoundEngineFactory }) {
  const [value, setValue] = useState<Value | null>(null);
  useEffect(() => {
    // Own each controller within the effect, including StrictMode's cleanup/replay.
    const controller = createSoundController(factory);
    controller.foreground(AppState.currentState === 'active');
    const changed = () => setValue({ controller, state: controller.getSnapshot() });
    changed();
    const unsubscribe = controller.subscribe(changed);
    const subscription = AppState.addEventListener('change', status => controller.foreground(status === 'active'));
    return () => { unsubscribe(); subscription.remove(); controller.dispose(); };
  }, [factory]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useRegulationSounds() { return useContext(Context); }
export function useSoundSpeechGuard(): () => SpeechLease {
  return useContext(Context)?.controller.beginSpeech ?? noSoundLease;
}

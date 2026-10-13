import type { AudioStatus } from 'expo-audio';
import type { SoundEngineFactory, SoundStatus } from './sound-controller';

const sources = {
  white: require('../../../assets/regulation-sounds/white.wav'),
  brown: require('../../../assets/regulation-sounds/brown.wav'),
  rain: require('../../../assets/regulation-sounds/rain.wav'),
  ocean: require('../../../assets/regulation-sounds/ocean.wav'),
};
function observed(status: AudioStatus): SoundStatus {
  return { loaded: status.isLoaded, playing: status.playing, buffering: status.isBuffering, failed: status.error !== null && status.error !== undefined };
}

export const createExpoSoundEngine: SoundEngineFactory = async (id, changed) => {
  // Import only after an explicit play, so a missing native capability stays local.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const audio = require('expo-audio') as typeof import('expo-audio');
  const player = audio.createAudioPlayer(sources[id], { downloadFirst: false, keepAudioSessionActive: false });
  let subscription: { remove(): void } | undefined;
  let disposed = false;
  function dispose() {
    if (disposed) return;
    disposed = true;
    try { subscription?.remove(); }
    finally {
      try { player.pause(); }
      finally {
        try { player.clearLockScreenControls(); }
        finally { player.release(); }
      }
    }
  }
  try {
    player.loop = true;
    subscription = player.addListener('playbackStatusUpdate', status => changed(observed(status)));
    return {
      configure: background => audio.setAudioModeAsync({
        playsInSilentMode: background, shouldPlayInBackground: background, interruptionMode: 'doNotMix',
        allowsRecording: false, allowsBackgroundRecording: false, shouldRouteThroughEarpiece: false,
      }),
      play: () => player.play(), pause: () => player.pause(), volume: value => { player.volume = value; },
      lockScreen: enabled => player.setActiveForLockScreen(enabled, enabled ? { title: 'Som contínuo', artist: 'TEAr' } : undefined),
      status: () => observed(player.currentStatus), dispose,
    };
  } catch {
    dispose();
    throw new Error('Sound capability unavailable.');
  }
};

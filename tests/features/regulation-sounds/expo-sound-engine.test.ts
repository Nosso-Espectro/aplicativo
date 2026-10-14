import type { SoundEngineFactory, SoundStatus } from '../../../src/features/regulation-sounds/sound-controller';
jest.mock('../../../assets/regulation-sounds/white.wav', () => 2701);
jest.mock('../../../assets/regulation-sounds/brown.wav', () => 2702);
jest.mock('../../../assets/regulation-sounds/rain.wav', () => 2703);
jest.mock('../../../assets/regulation-sounds/ocean.wav', () => 2704);

let mockModuleLoads = 0;
let mockChanged: (status: unknown) => void;
let mockPlayer: ReturnType<typeof playerFixture>;
const mockConfigure = jest.fn(async (_mode: unknown) => {});
const mockRemove = jest.fn();
jest.mock('expo-audio', () => {
  mockModuleLoads++;
  return { createAudioPlayer: jest.fn(() => mockPlayer), setAudioModeAsync: mockConfigure };
});
function playerFixture() {
  return {
    loop: false, volume: 1,
    currentStatus: { isLoaded: true, playing: false, isBuffering: false, error: null as string | null },
    play: jest.fn(), pause: jest.fn(), clearLockScreenControls: jest.fn(), release: jest.fn(),
    setActiveForLockScreen: jest.fn(),
    addListener: jest.fn((_event: string, callback: (status: unknown) => void) => { mockChanged = callback; return { remove: mockRemove }; }),
  };
}
function loadAdapter() {
  return jest.requireActual<{ createExpoSoundEngine: SoundEngineFactory }>('../../../src/features/regulation-sounds/expo-sound-engine').createExpoSoundEngine;
}
beforeEach(() => {
  jest.resetModules(); jest.clearAllMocks(); mockModuleLoads = 0; mockPlayer = playerFixture();
});

it('does not import native audio before explicit creation or autoplay on creation', async () => {
  const create = loadAdapter(); expect(mockModuleLoads).toBe(0);
  const engine = await create('white', jest.fn());
  expect(mockModuleLoads).toBe(1); expect(mockPlayer.loop).toBe(true);
  expect(mockPlayer.play).not.toHaveBeenCalled(); expect(mockConfigure).not.toHaveBeenCalled();
  expect(engine.status()).toEqual({ loaded: true, playing: false, buffering: false, failed: false });
});
it('uses only bundled WAV sources, no download-first or persistent audio-session flag', async () => {
  const create = loadAdapter();
  for (const id of ['white', 'brown', 'rain', 'ocean'] as const) {
    const engine = await create(id, jest.fn()); engine.dispose();
  }
  const audio = jest.requireMock('expo-audio') as { createAudioPlayer: jest.Mock };
  expect(audio.createAudioPlayer.mock.calls.map(call => call[0])).toEqual([2701, 2702, 2703, 2704]);
  for (const call of audio.createAudioPlayer.mock.calls) {
    expect(call[1]).toEqual({ downloadFirst: false, keepAudioSessionActive: false });
  }
});
it('configures own-session background/silence only from the supplied option and never permits recording', async () => {
  const engine = await loadAdapter()('rain', jest.fn());
  await engine.configure(false); await engine.configure(true);
  expect(mockConfigure.mock.calls.map(call => call[0])).toEqual([false, true].map(background => ({
    playsInSilentMode: background, shouldPlayInBackground: background, interruptionMode: 'doNotMix',
    allowsRecording: false, allowsBackgroundRecording: false, shouldRouteThroughEarpiece: false,
  })));
});
it('publishes only fixed generic metadata and local gain without voice text or artwork', async () => {
  const engine = await loadAdapter()('ocean', jest.fn());
  engine.lockScreen(true); engine.lockScreen(false); engine.volume(0);
  expect(mockPlayer.setActiveForLockScreen.mock.calls).toEqual([[true, { title: 'Som contínuo', artist: 'TEAr' }], [false, undefined]]);
  expect(mockPlayer.volume).toBe(0); expect(mockPlayer.play).not.toHaveBeenCalled();
});
it('reduces native error detail to a boolean and propagates observed loaded/playing/buffering state', async () => {
  const changed = jest.fn<void, [SoundStatus]>(); await loadAdapter()('brown', changed);
  expect(mockPlayer.addListener).toHaveBeenCalledWith('playbackStatusUpdate', expect.any(Function));
  mockChanged({ isLoaded: false, playing: false, isBuffering: true, error: 'synthetic private native detail' });
  expect(changed).toHaveBeenLastCalledWith({ loaded: false, playing: false, buffering: true, failed: true });
  expect(JSON.stringify(changed.mock.calls)).not.toContain('synthetic private');
});
it('removes listener, pauses, clears system controls and releases the shared object exactly once', async () => {
  const engine = await loadAdapter()('white', jest.fn()); engine.dispose(); engine.dispose();
  for (const method of [mockRemove, mockPlayer.pause, mockPlayer.clearLockScreenControls, mockPlayer.release]) expect(method).toHaveBeenCalledTimes(1);
  expect(mockRemove.mock.invocationCallOrder[0]).toBeLessThan(mockPlayer.release.mock.invocationCallOrder[0]);
});
it('still releases when pause or media control cleanup fails', async () => {
  const engine = await loadAdapter()('white', jest.fn());
  mockPlayer.pause.mockImplementation(() => { throw new Error('synthetic'); });
  mockPlayer.clearLockScreenControls.mockImplementation(() => { throw new Error('synthetic'); });
  expect(() => engine.dispose()).toThrow(); expect(mockPlayer.release).toHaveBeenCalledTimes(1);
});
it('cleans a player whose initialization fails without returning a partially configured engine', async () => {
  Object.defineProperty(mockPlayer, 'loop', { set() { throw new Error('synthetic'); } });
  await expect(loadAdapter()('white', jest.fn())).rejects.toThrow('Sound capability unavailable.');
  expect(mockPlayer.release).toHaveBeenCalledTimes(1); expect(mockPlayer.play).not.toHaveBeenCalled();
});

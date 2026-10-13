import { createSoundController, type SoundEngine, type SoundEngineFactory, type SoundStatus } from '../../../src/features/regulation-sounds/sound-controller';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const cleanups: (() => void)[] = [];
afterEach(() => { cleanups.splice(0).forEach(cleanup => cleanup()); jest.useRealTimers(); });
function harness() {
  let changed: (status: SoundStatus) => void = () => {};
  let observed: SoundStatus = { loaded: true, playing: false, buffering: false, failed: false };
  const engine: SoundEngine = {
    configure: jest.fn(async () => {}), play: jest.fn(), pause: jest.fn(() => { observed = { ...observed, playing: false }; }),
    volume: jest.fn(), lockScreen: jest.fn(), dispose: jest.fn(), status: () => observed,
  };
  const factory = jest.fn<ReturnType<SoundEngineFactory>, Parameters<SoundEngineFactory>>(async (_id, callback) => { changed = callback; return engine; });
  const controller = createSoundController(factory);
  cleanups.push(() => controller.dispose());
  return { controller, factory, engine,
    emit(patch: Partial<SoundStatus>) { observed = { ...observed, ...patch }; changed(observed); },
  };
}

it('does not initialize or play on construction, selection, gain or background choice', async () => {
  const h = harness();
  h.controller.select('rain'); h.controller.volume(0); await h.controller.background(true);
  expect(h.factory).not.toHaveBeenCalled();
  expect(h.controller.getSnapshot()).toMatchObject({ phase: 'idle', pending: false,
    settings: { selectedSoundId: 'rain', volume: 0, backgroundPlayback: true } });
});
it('requires a selected sound and observes playing only after native status', async () => {
  const h = harness(); await h.controller.play(); expect(h.factory).not.toHaveBeenCalled();
  h.controller.select('white'); await h.controller.play();
  expect(h.engine.play).toHaveBeenCalledTimes(1);
  expect(h.engine.configure).toHaveBeenCalledWith(false);
  expect(h.engine.volume).toHaveBeenCalledWith(0.25);
  expect(h.controller.getSnapshot()).toMatchObject({ phase: 'loading', pending: true });
  await h.controller.play(); expect(h.engine.play).toHaveBeenCalledTimes(1);
  h.emit({ playing: true }); expect(h.controller.getSnapshot()).toMatchObject({ phase: 'playing', pending: false });
});
it('pauses explicitly and refuses late native resume until another explicit play', async () => {
  const h = harness(); h.controller.select('white'); await h.controller.play(); h.emit({ playing: true });
  h.controller.pause(); expect(h.controller.getSnapshot().phase).toBe('paused');
  expect(h.engine.lockScreen).toHaveBeenLastCalledWith(false);
  h.emit({ playing: true }); expect(h.controller.getSnapshot().phase).toBe('paused');
  await h.controller.play(); h.emit({ playing: true }); expect(h.controller.getSnapshot().phase).toBe('playing');
});
it('cancels loading, disposes a late player and blocks duplicate initialization', async () => {
  const h = harness(); const load = deferred<SoundEngine>(); h.factory.mockImplementation(() => load.promise);
  h.controller.select('brown'); const pending = h.controller.play(); await h.controller.play();
  expect(h.factory).toHaveBeenCalledTimes(1);
  h.controller.pause(); load.resolve(h.engine); await pending;
  expect(h.engine.dispose).toHaveBeenCalledTimes(1); expect(h.engine.play).not.toHaveBeenCalled();
  expect(h.controller.getSnapshot()).toMatchObject({ phase: 'idle', pending: false });
});
it('changing selection disposes the old player and never starts the new choice', async () => {
  const h = harness(); h.controller.select('white'); await h.controller.play(); h.emit({ playing: true });
  h.controller.select('ocean'); h.emit({ playing: true });
  expect(h.engine.dispose).toHaveBeenCalledTimes(1); expect(h.factory).toHaveBeenCalledTimes(1);
  expect(h.controller.getSnapshot()).toMatchObject({ phase: 'idle', settings: { selectedSoundId: 'ocean' } });
});
it('ignores load failure after cancellation without changing the newer choice', async () => {
  const h = harness(); const load = deferred<SoundEngine>(); h.factory.mockImplementation(() => load.promise);
  h.controller.select('white'); const pending = h.controller.play(); h.controller.select('rain');
  load.reject(new Error('synthetic private error')); await pending;
  expect(h.controller.getSnapshot()).toMatchObject({ phase: 'idle', settings: { selectedSoundId: 'rain' } });
});
it('preserves choices on failure and explicitly retries with a new player', async () => {
  const h = harness(); h.controller.select('brown'); h.controller.volume(0.4);
  h.factory.mockRejectedValueOnce(new Error('synthetic private error')); await h.controller.play();
  expect(h.controller.getSnapshot()).toMatchObject({ phase: 'error', pending: false, settings: { selectedSoundId: 'brown', volume: 0.4 } });
  expect(JSON.stringify(h.controller.getSnapshot())).not.toContain('synthetic private error');
  await h.controller.play(); expect(h.factory).toHaveBeenCalledTimes(2); h.emit({ playing: true });
  expect(h.controller.getSnapshot().phase).toBe('playing');
});
it('native error releases resources and never looks like playback', async () => {
  const h = harness(); h.controller.select('white'); await h.controller.play(); h.emit({ failed: true });
  expect(h.engine.dispose).toHaveBeenCalledTimes(1);
  expect(h.controller.getSnapshot()).toMatchObject({ phase: 'error', pending: false });
});
it('volume zero changes local gain without play or resume, and invalid gain leaves state intact', async () => {
  const h = harness(); h.controller.select('white'); await h.controller.play(); h.emit({ playing: true }); h.controller.pause();
  h.controller.volume(0); expect(h.engine.volume).toHaveBeenLastCalledWith(0); expect(h.engine.play).toHaveBeenCalledTimes(1);
  expect(() => h.controller.volume(NaN)).toThrow(); expect(h.controller.getSnapshot().settings.volume).toBe(0);
});
it('gain failure keeps the confirmed setting and releases the unsafe engine', async () => {
  const h = harness(); h.controller.select('rain'); await h.controller.play(); h.emit({ playing: true });
  jest.mocked(h.engine.volume).mockImplementation(() => { throw new Error('synthetic'); }); h.controller.volume(0.8);
  expect(h.controller.getSnapshot()).toMatchObject({ phase: 'error', settings: { volume: 0.25 } });
  expect(h.engine.dispose).toHaveBeenCalledTimes(1);
});
it('pauses on background by default and does not resume when foreground returns', async () => {
  const h = harness(); h.controller.select('rain'); await h.controller.play(); h.emit({ playing: true });
  h.controller.foreground(false); h.controller.foreground(true);
  expect(h.engine.play).toHaveBeenCalledTimes(1); expect(h.controller.getSnapshot().phase).toBe('paused');
});
it('only the explicit opt-in permits background and lockscreen; disabling never resumes', async () => {
  const h = harness(); h.controller.select('ocean'); await h.controller.background(true); await h.controller.play(); h.emit({ playing: true });
  expect(h.engine.configure).toHaveBeenCalledWith(true); expect(h.engine.lockScreen).toHaveBeenCalledWith(true);
  h.controller.foreground(false); expect(h.controller.getSnapshot().phase).toBe('playing');
  await h.controller.background(false); expect(h.controller.getSnapshot().settings.backgroundPlayback).toBe(false);
  expect(h.engine.play).toHaveBeenCalledTimes(1); expect(h.controller.getSnapshot().phase).toBe('paused');
});
it('failed background change preserves the confirmed choice and does not claim success', async () => {
  const h = harness(); h.controller.select('white'); await h.controller.play(); h.emit({ playing: true });
  jest.mocked(h.engine.configure).mockRejectedValueOnce(new Error('synthetic')); await h.controller.background(true);
  expect(h.controller.getSnapshot()).toMatchObject({ phase: 'error', settings: { backgroundPlayback: false } });
});
it('speech leases block play, pause before ready, release idempotently and never resume automatically', async () => {
  const h = harness(); h.controller.select('white'); await h.controller.play(); h.emit({ playing: true });
  const first = h.controller.beginSpeech(); const second = h.controller.beginSpeech(); await first.ready;
  expect(h.controller.getSnapshot()).toMatchObject({ phase: 'paused', speechActive: true });
  await h.controller.play(); first.release(); first.release(); expect(h.controller.getSnapshot().speechActive).toBe(true);
  second.release(); expect(h.controller.getSnapshot().speechActive).toBe(false); expect(h.engine.play).toHaveBeenCalledTimes(1);
});
it('speech cancels a pending load without waiting for module initialization', async () => {
  const h = harness(); const load = deferred<SoundEngine>(); h.factory.mockImplementation(() => load.promise);
  h.controller.select('white'); const pending = h.controller.play(); const speech = h.controller.beginSpeech(); await speech.ready;
  load.resolve(h.engine); await pending; expect(h.engine.play).not.toHaveBeenCalled(); expect(h.engine.dispose).toHaveBeenCalledTimes(1);
  speech.release();
});
it('speech waits for an older session change and prevents its play after the change finishes', async () => {
  const h = harness(); const mode = deferred<void>(); jest.mocked(h.engine.configure).mockImplementation(() => mode.promise);
  h.controller.select('white'); const pending = h.controller.play(); await Promise.resolve(); await Promise.resolve();
  const speech = h.controller.beginSpeech(); let ready = false; void speech.ready.then(() => { ready = true; });
  await Promise.resolve(); expect(ready).toBe(false); mode.resolve(); await speech.ready; await pending;
  expect(h.engine.play).not.toHaveBeenCalled(); speech.release();
});
it('disposing cancels late initialization, clears subscribers and is idempotent', async () => {
  const h = harness(); const load = deferred<SoundEngine>(); h.factory.mockImplementation(() => load.promise);
  const listener = jest.fn(); const unsubscribe = h.controller.subscribe(listener); h.controller.select('white');
  const pending = h.controller.play(); h.controller.dispose(); h.controller.dispose(); unsubscribe(); listener.mockClear();
  load.resolve(h.engine); await pending; h.controller.select('rain'); await h.controller.play();
  expect(listener).not.toHaveBeenCalled(); expect(h.engine.dispose).toHaveBeenCalledTimes(1); expect(h.engine.play).not.toHaveBeenCalled();
});
it('fails a stalled load after 30 seconds and disposes its eventual result without playing', async () => {
  jest.useFakeTimers();
  const h = harness(); const load = deferred<SoundEngine>(); h.factory.mockImplementation(() => load.promise);
  h.controller.select('rain'); const pending = h.controller.play(); jest.advanceTimersByTime(30000);
  expect(h.controller.getSnapshot()).toMatchObject({ phase: 'error', pending: false, settings: { selectedSoundId: 'rain' } });
  load.resolve(h.engine); await pending; expect(h.engine.play).not.toHaveBeenCalled(); expect(h.engine.dispose).toHaveBeenCalledTimes(1);
});
it('clears the load watchdog after observed playback and on cancellation', async () => {
  jest.useFakeTimers(); const h = harness(); h.controller.select('white'); await h.controller.play(); h.emit({ playing: true });
  expect(jest.getTimerCount()).toBe(0); jest.advanceTimersByTime(30000); expect(h.controller.getSnapshot().phase).toBe('playing');
  h.controller.pause(); await h.controller.play(); expect(jest.getTimerCount()).toBe(1);
  h.controller.pause(); expect(jest.getTimerCount()).toBe(0);
});
it('does not keep essential speech waiting forever for a broken native media-session RPC', async () => {
  jest.useFakeTimers(); const h = harness(); const mode = deferred<void>();
  jest.mocked(h.engine.configure).mockImplementation(() => mode.promise);
  h.controller.select('white'); const pending = h.controller.play(); await Promise.resolve(); await Promise.resolve();
  const speech = h.controller.beginSpeech(); jest.advanceTimersByTime(3000); await speech.ready;
  expect(h.controller.getSnapshot()).toMatchObject({ phase: 'error', speechActive: true });
  expect(h.engine.dispose).toHaveBeenCalledTimes(1); expect(jest.getTimerCount()).toBe(0);
  mode.resolve(); await pending; expect(h.engine.play).not.toHaveBeenCalled(); speech.release();
});
it('cancels pending speech readiness and cleans its deadline when the lease is released', async () => {
  jest.useFakeTimers(); const h = harness(); const mode = deferred<void>();
  jest.mocked(h.engine.configure).mockImplementation(() => mode.promise);
  h.controller.select('white'); const pending = h.controller.play(); await Promise.resolve(); await Promise.resolve();
  const speech = h.controller.beginSpeech(); speech.release(); await speech.ready;
  expect(jest.getTimerCount()).toBe(0); expect(h.controller.getSnapshot().speechActive).toBe(false);
  mode.resolve(); await pending; expect(h.engine.play).not.toHaveBeenCalled();
});
it('does not claim playing while the native player is buffering or unloaded', async () => {
  const h = harness(); h.controller.select('white'); await h.controller.play(); h.emit({ playing: true, buffering: true });
  expect(h.controller.getSnapshot()).toMatchObject({ phase: 'loading', pending: true });
  await h.controller.play(); expect(h.engine.play).toHaveBeenCalledTimes(1);
  h.emit({ loaded: true, buffering: false }); expect(h.controller.getSnapshot()).toMatchObject({ phase: 'playing', pending: false });
  h.emit({ buffering: true }); expect(h.controller.getSnapshot().phase).toBe('loading');
  await h.controller.play(); expect(h.engine.play).toHaveBeenCalledTimes(1);
  h.controller.pause(); expect(h.controller.getSnapshot().phase).toBe('paused');
});

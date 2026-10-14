import { createSoundController, type SoundEngine, type SoundStatus } from '../../../src/features/regulation-sounds/sound-controller';
const cleanups: (() => void)[] = [];
beforeEach(() => jest.useFakeTimers({ now: 10000 }));
afterEach(() => { cleanups.splice(0).forEach(cleanup => cleanup()); jest.useRealTimers(); });
async function harness(clock?: () => number) {
  let status: SoundStatus = { loaded: true, playing: false, buffering: false, failed: false };
  let emit = (_status: SoundStatus) => {};
  const engine: SoundEngine = {
    configure: jest.fn(async () => {}), play: jest.fn(() => { status = { ...status, playing: true }; emit(status); }),
    pause: jest.fn(() => { status = { ...status, playing: false }; }), volume: jest.fn(), lockScreen: jest.fn(), dispose: jest.fn(), status: () => status,
  };
  const controller = createSoundController(async (_id, changed) => { emit = changed; return engine; }, clock);
  cleanups.push(() => controller.dispose());
  controller.select('white'); await controller.play();
  const arm = (minutes = 1) => controller.applyTimer(minutes, controller.getSnapshot().timer.revision);
  return { controller, engine, arm, emit: (patch: Partial<SoundStatus>) => { status = { ...status, ...patch }; emit(status); } };
}
it('cancels only the deadline without any engine command and ignores the old scheduled callback', async () => {
  const h = await harness(); expect(h.arm()).toBe(true);
  jest.clearAllMocks(); const revision = h.controller.getSnapshot().timer.revision;
  expect(h.controller.cancelTimer(revision)).toBe(true); expect(h.controller.cancelTimer(revision)).toBe(false);
  jest.advanceTimersByTime(70000);
  for (const name of ['play', 'pause', 'configure', 'volume', 'lockScreen', 'dispose'] as const) expect(h.engine[name]).not.toHaveBeenCalled();
  expect(h.controller.getSnapshot()).toMatchObject({ phase: 'playing', timer: { status: 'idle' } });
});
it('expires only at the deadline, confirms native pause and refuses duplicate/stale arm commands', async () => {
  const h = await harness(); const revision = h.controller.getSnapshot().timer.revision;
  expect(h.controller.applyTimer(1, revision)).toBe(true); expect(h.controller.applyTimer(1, revision)).toBe(false);
  jest.advanceTimersByTime(59999); expect(h.engine.pause).not.toHaveBeenCalled();
  jest.advanceTimersByTime(1); expect(h.controller.getSnapshot()).toMatchObject({ phase: 'paused', timer: { status: 'finished' } });
  expect(h.engine.pause).toHaveBeenCalledTimes(1); h.emit({ playing: true });
  expect(h.controller.getSnapshot().phase).toBe('paused'); expect(h.engine.play).toHaveBeenCalledTimes(1);
});
it('does not claim finished before native acknowledgement and releases an unresponsive engine', async () => {
  const h = await harness(); jest.mocked(h.engine.pause).mockImplementation(() => {}); h.arm();
  jest.advanceTimersByTime(60000); expect(h.controller.getSnapshot()).toMatchObject({ phase: 'stopping', timer: { status: 'stopping' } });
  jest.advanceTimersByTime(3000); expect(h.controller.getSnapshot()).toMatchObject({ phase: 'error', timer: { status: 'error', error: 'stop' } });
  expect(h.engine.dispose).toHaveBeenCalledTimes(1);
});
it('accepts a delayed acknowledgement and cancels the stop watchdog', async () => {
  const h = await harness(); jest.mocked(h.engine.pause).mockImplementation(() => {}); h.arm(); jest.advanceTimersByTime(60000);
  h.emit({ playing: false }); jest.advanceTimersByTime(3000);
  expect(h.controller.getSnapshot().timer.status).toBe('finished'); expect(h.engine.dispose).not.toHaveBeenCalled();
});
it('preserves choices and reports stop errors instead of a false successful end', async () => {
  const h = await harness(); h.arm(); jest.mocked(h.engine.pause).mockImplementation(() => { throw new Error('synthetic'); });
  jest.advanceTimersByTime(60000);
  expect(h.controller.getSnapshot()).toMatchObject({ phase: 'error', timer: { status: 'error' }, settings: { selectedSoundId: 'white' } });
  expect(JSON.stringify(h.controller.getSnapshot())).not.toContain('synthetic');
});
it('keeps a wall-clock deadline across manual pause and speech without autoresume', async () => {
  const h = await harness(); h.arm(); jest.advanceTimersByTime(20000); h.controller.pause();
  const speech = h.controller.beginSpeech(); await speech.ready; speech.release(); jest.advanceTimersByTime(40000);
  expect(h.controller.getSnapshot().timer.status).toBe('finished'); expect(h.engine.play).toHaveBeenCalledTimes(1);
});
it('replaces a timer without letting old callbacks stop the current playback', async () => {
  const h = await harness(); h.arm(); jest.advanceTimersByTime(10000); h.arm(5); jest.clearAllMocks();
  jest.advanceTimersByTime(50000); expect(h.engine.pause).not.toHaveBeenCalled();
  expect(h.controller.getSnapshot().timer.remainingMs).toBe(250000);
});
it('invalidates timer commands and expiry when selection changes or controller is disposed', async () => {
  const h = await harness(); h.arm(); const revision = h.controller.getSnapshot().timer.revision;
  h.controller.select('rain'); await h.controller.play(); jest.clearAllMocks(); jest.advanceTimersByTime(70000);
  expect(h.controller.applyTimer(1, revision)).toBe(false); expect(h.engine.pause).not.toHaveBeenCalled();
  h.arm(); h.controller.dispose(); jest.clearAllMocks(); jest.advanceTimersByTime(70000);
  expect(h.engine.pause).not.toHaveBeenCalled(); expect(h.controller.applyTimer(1, h.controller.getSnapshot().timer.revision)).toBe(false);
});
it('requires voluntary background opt-out and guards background opt-in while armed', async () => {
  const h = await harness(); await h.controller.background(true); expect(h.arm()).toBe(false);
  expect(h.controller.getSnapshot().settings.backgroundPlayback).toBe(true);
  await h.controller.background(false); expect(h.arm()).toBe(true); jest.clearAllMocks();
  await h.controller.background(true); expect(h.engine.configure).not.toHaveBeenCalled(); expect(h.engine.pause).not.toHaveBeenCalled();
  expect(h.controller.getSnapshot().settings.backgroundPlayback).toBe(false);
});
it('pauses on background and reconciles overdue deadlines before human replay without restarting', async () => {
  const h = await harness(); h.arm(); h.controller.foreground(false); jest.setSystemTime(80000); h.controller.foreground(true);
  expect(h.controller.getSnapshot()).toMatchObject({ phase: 'paused', timer: { status: 'finished' } });
  expect(h.engine.play).toHaveBeenCalledTimes(1);
});
it('pauses safely on regressive or failing clocks without claiming expiry', async () => {
  let time = 10000; let failed = false; const h = await harness(() => { if (failed) throw new Error('synthetic'); return time; });
  h.arm(); time = 9999; jest.advanceTimersByTime(1000);
  expect(h.controller.getSnapshot()).toMatchObject({ phase: 'paused', timer: { status: 'error', error: 'clock', remainingMs: 60000 } });
  time = 20000; expect(h.arm()).toBe(true); failed = true; jest.advanceTimersByTime(1000);
  expect(h.controller.getSnapshot().timer.error).toBe('clock');
});
it('does not replay a sound after a suspended deadline expires before an explicit play', async () => {
  const h = await harness(); h.arm(); h.controller.pause(); jest.setSystemTime(80000); await h.controller.play();
  expect(h.controller.getSnapshot().timer.status).toBe('finished'); expect(h.engine.play).toHaveBeenCalledTimes(1);
  await h.controller.play(); expect(h.engine.play).toHaveBeenCalledTimes(2); expect(h.controller.getSnapshot().timer.status).toBe('idle');
});
it('cannot apply a timer to a pending factory and ignores commands after player failure', async () => {
  let resolve!: (engine: SoundEngine) => void;
  const controller = createSoundController(() => new Promise(yes => { resolve = yes; })); cleanups.push(() => controller.dispose());
  controller.select('white'); const playing = controller.play();
  expect(controller.applyTimer(1, controller.getSnapshot().timer.revision)).toBe(false); controller.select('rain');
  const h = await harness(); resolve(h.engine); await playing; expect(h.engine.dispose).toHaveBeenCalledTimes(1);
  h.arm(); h.emit({ failed: true }); jest.clearAllMocks(); jest.advanceTimersByTime(70000);
  expect(h.controller.getSnapshot().timer.status).toBe('error'); expect(h.engine.pause).not.toHaveBeenCalled();
});
it('expires a timer while a resumed native configuration is pending and never plays its late result', async () => {
  const h = await harness(); h.arm(); h.controller.pause(); jest.advanceTimersByTime(59000);
  let resolve!: () => void; jest.mocked(h.engine.configure).mockImplementationOnce(() => new Promise(yes => { resolve = yes; }));
  const resumed = h.controller.play(); await Promise.resolve(); await Promise.resolve();
  jest.advanceTimersByTime(1000); expect(h.controller.getSnapshot().timer.status).toBe('finished');
  resolve(); await resumed; expect(h.engine.play).toHaveBeenCalledTimes(1);
});

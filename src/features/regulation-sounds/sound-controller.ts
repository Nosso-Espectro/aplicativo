import { initialSoundSettings, normalizedSoundSettings, selectSoundSettings, withBackgroundPlayback, withSoundVolume, type SoundId, type SoundSettings } from './sound-settings';
import { initialSoundTimer, reduceSoundTimer, type SoundTimer } from './sound-timer';

export type SoundStatus = { loaded: boolean; playing: boolean; buffering: boolean; failed: boolean };
export type SoundEngine = {
  configure(background: boolean): Promise<void>;
  play(): void;
  pause(): void;
  volume(value: number): void;
  lockScreen(enabled: boolean): void;
  status(): SoundStatus;
  dispose(): void;
};
export type SoundEngineFactory = (id: SoundId, changed: (status: SoundStatus) => void) => Promise<SoundEngine>;
export type SoundState = {
  settings: SoundSettings;
  phase: 'idle' | 'loading' | 'playing' | 'paused' | 'stopping' | 'error';
  pending: boolean;
  speechActive: boolean;
  timer: SoundTimer;
};
type Slot = { engine: SoundEngine | null; status: SoundStatus | null };

export function createSoundController(factory: SoundEngineFactory, clock: () => number = () => Date.now()) {
  let state: SoundState = { settings: normalizedSoundSettings(initialSoundSettings), phase: 'idle', pending: false, speechActive: false, timer: initialSoundTimer() };
  const listeners = new Set<() => void>();
  const speechWaits = new Set<() => void>();
  let slot: Slot | null = null;
  let generation = 0;
  let intent = false;
  let foreground = true;
  let speechLeases = 0;
  let disposed = false;
  let awaitingPlayback = false;
  let loadWatch: ReturnType<typeof setTimeout> | null = null;
  let modeQueue: Promise<void> = Promise.resolve();
  let timerSlot: Slot | null = null;
  let timerWatch: ReturnType<typeof setTimeout> | null = null;
  let stopWatch: ReturnType<typeof setTimeout> | null = null;

  function now() { try { return clock(); } catch { return NaN; } }
  function clearTimerWatch() {
    if (timerWatch !== null) clearTimeout(timerWatch);
    timerWatch = null;
  }
  function cancelTimer(expectedRevision: number) {
    if (disposed || expectedRevision !== state.timer.revision) return false;
    clearTimerWatch(); clearStopWatch(); timerSlot = null;
    update({ timer: reduceSoundTimer(state.timer, { type: 'cancel', expectedRevision }) });
    return true;
  }
  function clearStopWatch() {
    if (stopWatch !== null) clearTimeout(stopWatch);
    stopWatch = null;
  }
  function scheduleTimer() {
    clearTimerWatch();
    if (!foreground || state.timer.status !== 'armed') return;
    const target = timerSlot; const expectedRevision = state.timer.revision;
    timerWatch = setTimeout(() => {
      if (disposed || target !== slot || target !== timerSlot || expectedRevision !== state.timer.revision) return;
      reconcileTimer();
    }, Math.min(1000, state.timer.remainingMs));
  }
  function reconcileTimer() {
    if (disposed || state.timer.status !== 'armed' || !timerSlot || timerSlot !== slot) return;
    const timer = reduceSoundTimer(state.timer, { type: 'tick', nowMs: now(), expectedRevision: state.timer.revision });
    update({ timer });
    if (timer.status === 'stopping' || timer.status === 'error') {
      clearTimerWatch();
      pause();
      // A missing native acknowledgement is an error, not a confirmed stop.
      if (timer.status === 'stopping' && state.timer.revision === timer.revision) {
        const revision = state.timer.revision; const target = timerSlot;
        stopWatch = setTimeout(() => {
          if (!disposed && target === slot && target === timerSlot && state.timer.revision === revision && state.timer.status === 'stopping') fail();
        }, 3000);
      }
    } else scheduleTimer();
  }

  function update(patch: Partial<SoundState>) {
    if (disposed) return;
    state = { ...state, ...patch };
    listeners.forEach(listener => listener());
  }
  function permitted() {
    return !disposed && speechLeases === 0 && (foreground || state.settings.backgroundPlayback);
  }
  function current(token: number, candidate: Slot) {
    return token === generation && candidate === slot && permitted();
  }
  function destroy() {
    const previous = slot;
    slot = null;
    try { previous?.engine?.dispose(); } catch { /* Native cleanup must not block communication. */ }
  }
  function clearWatch() {
    if (loadWatch !== null) clearTimeout(loadWatch);
    loadWatch = null;
  }
  function fail() {
    clearWatch();
    clearTimerWatch(); clearStopWatch(); timerSlot = null;
    const timer = ['armed', 'stopping', 'error'].includes(state.timer.status)
      ? reduceSoundTimer(state.timer, { type: 'failed', expectedRevision: state.timer.revision }) : state.timer;
    generation++;
    intent = false;
    awaitingPlayback = false;
    destroy();
    update({ phase: 'error', pending: false, timer });
  }
  function observe(candidate: Slot, status: SoundStatus) {
    if (disposed || candidate !== slot) return;
    candidate.status = status;
    if (status.failed) { fail(); return; }
    if (status.playing && (!intent || !permitted())) {
      update({ phase: 'stopping', pending: false });
      try {
        candidate.engine?.pause(); candidate.engine?.lockScreen(false);
        if (candidate === slot && candidate.engine) {
          const stopped = candidate.engine.status();
          if (!stopped.playing) observe(candidate, stopped);
        }
      } catch { fail(); }
      return;
    }
    const sounding = status.playing && status.loaded && !status.buffering;
    if (!status.playing && candidate === timerSlot && state.timer.status === 'stopping') {
      clearTimerWatch(); clearStopWatch(); timerSlot = null;
      update({ timer: reduceSoundTimer(state.timer, { type: 'finished', expectedRevision: state.timer.revision }) });
    }
    if (sounding) { awaitingPlayback = false; clearWatch(); }
    update({ pending: state.pending && !sounding,
      phase: sounding ? 'playing' : ((!status.loaded || status.buffering || awaitingPlayback) && intent ? 'loading' : 'paused') });
  }
  function pause() {
    if (disposed) return;
    clearWatch();
    generation++;
    intent = false;
    awaitingPlayback = false;
    update({ pending: false });
    if (!slot?.engine) { destroy(); update({ phase: 'idle' }); return; }
    try {
      slot.engine.pause();
      slot.engine.lockScreen(false);
      observe(slot, slot.engine.status());
    } catch { fail(); }
  }
  function configure(candidate: Slot, background: boolean, token: number) {
    // Serializing session changes also lets TTS await all earlier native changes.
    const operation = modeQueue.then(async () => {
      if (!current(token, candidate)) return false;
      await candidate.engine!.configure(background);
      return current(token, candidate);
    });
    modeQueue = operation.then(() => {}, () => {});
    return operation;
  }

  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    applyTimer(minutes: number, expectedRevision: number) {
      if (disposed || expectedRevision !== state.timer.revision || state.pending || state.speechActive || !foreground
        || state.settings.backgroundPlayback || !slot?.engine || !slot.status?.loaded || !['playing', 'paused'].includes(state.phase)) return false;
      const timer = reduceSoundTimer(state.timer, { type: 'arm', minutes, nowMs: now(), expectedRevision });
      if (timer === state.timer) return false;
      clearTimerWatch(); timerSlot = slot; update({ timer });
      if (timer.status === 'error') { pause(); return false; }
      scheduleTimer(); return true;
    },
    cancelTimer,
    select(id: SoundId) {
      if (disposed) return;
      const settings = selectSoundSettings(state.settings, id);
      cancelTimer(state.timer.revision);
      pause();
      destroy();
      update({ settings, phase: 'idle', pending: false });
    },
    async play() {
      const timerWasArmed = state.timer.status === 'armed';
      reconcileTimer();
      if (state.timer.status === 'stopping' || (timerWasArmed && state.timer.status !== 'armed')) return;
      if (!permitted() || state.pending || slot?.status?.playing || (state.phase === 'loading' && intent) || state.settings.selectedSoundId === null) return;
      if (['finished', 'error'].includes(state.timer.status)) cancelTimer(state.timer.revision);
      const token = ++generation;
      intent = true;
      awaitingPlayback = true;
      clearWatch();
      loadWatch = setTimeout(() => { if (token === generation && !disposed) fail(); }, 30000);
      update({ pending: true, phase: 'loading' });
      let candidate = slot;
      try {
        if (!candidate) {
          candidate = { engine: null, status: null };
          slot = candidate;
          const owned = candidate;
          const engine = await factory(state.settings.selectedSoundId!, status => observe(owned, status));
          if (!current(token, owned)) { engine.dispose(); return; }
          owned.engine = engine;
        }
        if (!await configure(candidate, state.settings.backgroundPlayback, token)) return;
        if (!current(token, candidate) || !intent) return;
        candidate.engine!.volume(state.settings.volume);
        candidate.engine!.lockScreen(state.settings.backgroundPlayback);
        candidate.engine!.play();
        observe(candidate, candidate.engine!.status());
      } catch {
        if (token === generation && !disposed) fail();
      } finally {
        if (token === generation && !disposed) update({ pending: awaitingPlayback });
      }
    },
    pause,
    volume(value: number) {
      if (disposed) return;
      const settings = withSoundVolume(state.settings, value);
      try { slot?.engine?.volume(value); update({ settings }); } catch { fail(); }
    },
    async background(enabled: boolean) {
      if (disposed || state.pending || (enabled && ['armed', 'stopping'].includes(state.timer.status))) return;
      const settings = withBackgroundPlayback(state.settings, enabled);
      pause();
      if (!slot?.engine) { update({ settings }); return; }
      const candidate = slot;
      const token = ++generation;
      update({ pending: true });
      try {
        if (await configure(candidate, enabled, token)) update({ settings });
      } catch { if (token === generation && !disposed) fail(); }
      finally { if (token === generation && !disposed) update({ pending: false }); }
    },
    foreground(active: boolean) {
      foreground = active;
      if (!active && !state.settings.backgroundPlayback) pause();
      if (active) reconcileTimer(); else clearTimerWatch();
    },
    beginSpeech() {
      speechLeases++;
      pause();
      update({ speechActive: true });
      let released = false;
      let finishReady = () => {};
      const ready = new Promise<void>(resolve => {
        let settled = false;
        finishReady = () => {
          if (settled) return;
          settled = true;
          clearTimeout(deadline);
          speechWaits.delete(finishReady);
          resolve();
        };
        // A broken media-session RPC must not leave the essential voice waiting forever.
        const deadline = setTimeout(() => { if (!disposed && !released) fail(); finishReady(); }, 3000);
        speechWaits.add(finishReady);
        void modeQueue.then(finishReady, finishReady);
      });
      return {
        ready,
        release() {
          if (released) return;
          released = true;
          finishReady();
          speechLeases--;
          update({ speechActive: speechLeases > 0 });
        },
      };
    },
    dispose() {
      if (disposed) return;
      cancelTimer(state.timer.revision);
      pause();
      disposed = true;
      generation++;
      destroy();
      speechWaits.forEach(finish => finish());
      listeners.clear();
    },
  };
}

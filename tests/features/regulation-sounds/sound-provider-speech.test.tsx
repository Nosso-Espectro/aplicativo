import { StrictMode, useEffect } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AppState, Pressable, Text, type AppStateStatus } from 'react-native';
import { RegulationSoundsProvider, useRegulationSounds } from '../../../src/features/regulation-sounds/RegulationSoundsProvider';
import { SpeechControls } from '../../../src/features/communication/speech/SpeechControls';
import { localSpeech } from '../../../src/features/communication/speech/local-speech';
import type { SoundEngine, SoundStatus } from '../../../src/features/regulation-sounds/sound-controller';
jest.mock('../../../src/features/communication/speech/local-speech', () => ({ localSpeech: { isAvailable: jest.fn(), speak: jest.fn(), stop: jest.fn() } }));
const speech = jest.mocked(localSpeech);
let context: ReturnType<typeof useRegulationSounds>;
let changed: (status: SoundStatus) => void;
let appEvent: (status: AppStateStatus) => void;
let nativeStatus: SoundStatus;
let engine: SoundEngine;
const remove = jest.fn();
const factory = jest.fn(async (_id, callback) => { changed = callback; return engine; });
function Probe({ voice = true }: { voice?: boolean }) {
  const value = useRegulationSounds();
  useEffect(() => { context = value; }, [value]);
  return <><Text testID="state">{value?.state.phase}/{String(value?.state.speechActive)}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Play fixture" onPress={() => { value?.controller.select('white'); void value?.controller.play(); }}><Text>Play</Text></Pressable>
    {voice && <SpeechControls text="Frase sintética" />}</>;
}
function Session({ voice = true }: { voice?: boolean }) { return <RegulationSoundsProvider factory={factory}><Probe voice={voice} /></RegulationSoundsProvider>; }
function deferred<T>() { let resolve!: (value: T) => void; let reject!: (error: Error) => void; const promise = new Promise<T>((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; }
beforeEach(() => {
  jest.clearAllMocks();
  nativeStatus = { loaded: true, playing: false, buffering: false, failed: false };
  engine = { configure: jest.fn(async () => {}), play: jest.fn(() => { nativeStatus.playing = true; changed({ ...nativeStatus }); }),
    pause: jest.fn(() => { nativeStatus.playing = false; }), volume: jest.fn(), lockScreen: jest.fn(), dispose: jest.fn(), status: () => ({ ...nativeStatus }) };
  factory.mockImplementation(async (_id, callback) => { changed = callback; return engine; });
  speech.isAvailable.mockResolvedValue(true); speech.speak.mockResolvedValue(); speech.stop.mockResolvedValue();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => { appEvent = listener; return { remove }; });
});
afterEach(() => { jest.restoreAllMocks(); });
async function open() { const view = render(<Session />); await act(async () => { appEvent('active'); }); return view; }
async function play() { await act(async () => { fireEvent.press(screen.getByLabelText('Play fixture')); }); }
async function read() { await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Ler frase' })); }); }

it('does not pause ambient playback through a read command captured before voice-control unmount', async () => {
  const view = await open();
  let node = screen.getByRole('button', { name: 'Ler frase' });
  while (node.parent && typeof node.props.onPress !== 'function') node = node.parent;
  expect(typeof node.props.onPress).toBe('function'); const oldRead = node.props.onPress as () => void;
  view.rerender(<Session voice={false} />); await play();
  expect(context?.state).toMatchObject({ phase: 'playing', speechActive: false });
  await act(async () => oldRead());
  expect(engine.pause).not.toHaveBeenCalled();
  expect(context?.state).toMatchObject({ phase: 'playing', speechActive: false });
  expect(speech.isAvailable).not.toHaveBeenCalled(); expect(speech.speak).not.toHaveBeenCalled();
});

it('initializes without loading audio and remains usable after StrictMode replay', async () => {
  const view = render(<StrictMode><Session /></StrictMode>); await act(async () => { appEvent('active'); });
  expect(factory).not.toHaveBeenCalled(); await play(); expect(engine.play).toHaveBeenCalledTimes(1);
  view.unmount(); expect(engine.dispose).toHaveBeenCalledTimes(1); expect(remove).toHaveBeenCalled();
});
it('pauses music before voice, blocks ambient play while reading and never resumes afterward', async () => {
  const done = deferred<void>(); speech.speak.mockReturnValue(done.promise); await open(); await play(); await read();
  expect(context?.state).toMatchObject({ phase: 'paused', speechActive: true });
  expect(jest.mocked(engine.pause).mock.invocationCallOrder[0]).toBeLessThan(speech.speak.mock.invocationCallOrder[0]);
  await play(); expect(engine.play).toHaveBeenCalledTimes(1);
  await act(async () => { done.resolve(); }); expect(context?.state.speechActive).toBe(false);
  expect(engine.play).toHaveBeenCalledTimes(1);
});
it.each(['unavailable', 'query-error', 'speech-error'])('releases voice priority for %s while preserving communication', async failure => {
  if (failure === 'unavailable') speech.isAvailable.mockResolvedValue(false);
  if (failure === 'query-error') speech.isAvailable.mockRejectedValue(new Error('synthetic private'));
  if (failure === 'speech-error') speech.speak.mockRejectedValue(new Error('synthetic private'));
  await open(); await play(); await read(); expect(context?.state.speechActive).toBe(false);
  expect(screen.getByRole('alert')).toBeOnTheScreen(); expect(screen.queryByText('synthetic private')).toBeNull();
  expect(engine.play).toHaveBeenCalledTimes(1);
});
it('retains priority when stop fails while speech is still alive and releases on actual completion', async () => {
  const done = deferred<void>(); speech.speak.mockReturnValue(done.promise); speech.stop.mockRejectedValue(new Error('synthetic'));
  await open(); await play(); await read();
  await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Interromper leitura' })); });
  expect(context?.state.speechActive).toBe(true); await play(); expect(engine.play).toHaveBeenCalledTimes(1);
  await act(async () => { done.resolve(); }); expect(context?.state.speechActive).toBe(false);
});
it('cancels before a pending media-session response and never starts late speech', async () => {
  const mode = deferred<void>(); jest.mocked(engine.configure).mockReturnValue(mode.promise); await open();
  act(() => { fireEvent.press(screen.getByLabelText('Play fixture')); }); await act(async () => {});
  act(() => { fireEvent.press(screen.getByRole('button', { name: 'Ler frase' })); });
  await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Interromper leitura' })); });
  await act(async () => { mode.resolve(); }); expect(speech.speak).not.toHaveBeenCalled(); expect(context?.state.speechActive).toBe(false);
});
it('keeps voice usable after media factory failure without reinitializing audio for speech', async () => {
  factory.mockRejectedValue(new Error('synthetic')); await open(); await play(); await read();
  expect(speech.speak).toHaveBeenCalledWith('Frase sintética'); expect(factory).toHaveBeenCalledTimes(1);
});
it('pauses on background and preserves selection without automatic foreground resume', async () => {
  await open(); await play(); await act(async () => { appEvent('background'); appEvent('active'); });
  expect(context?.state.phase).toBe('paused'); expect(context?.state.settings.selectedSoundId).toBe('white'); expect(engine.play).toHaveBeenCalledTimes(1);
});
it('releases a confirmed stop on voice-control unmount without disposing the navigation-wide player', async () => {
  const done = deferred<void>(); speech.speak.mockReturnValue(done.promise); const view = await open(); await play(); await read();
  view.rerender(<Session voice={false} />); await act(async () => {});
  expect(speech.stop).toHaveBeenCalled(); expect(context?.state.speechActive).toBe(false); expect(engine.dispose).not.toHaveBeenCalled();
  await act(async () => { done.resolve(); });
});
it('keeps priority after unmount when stop fails until the real speech promise finishes', async () => {
  const done = deferred<void>(); speech.speak.mockReturnValue(done.promise); speech.stop.mockRejectedValue(new Error('synthetic'));
  const view = await open(); await play(); await read(); view.rerender(<Session voice={false} />); await act(async () => {});
  expect(context?.state.speechActive).toBe(true); await play(); expect(engine.play).toHaveBeenCalledTimes(1);
  await act(async () => { done.resolve(); }); expect(context?.state.speechActive).toBe(false);
});

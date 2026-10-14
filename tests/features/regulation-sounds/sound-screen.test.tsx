import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { RegulationSoundsProvider } from '../../../src/features/regulation-sounds/RegulationSoundsProvider';
import { RegulationSoundsScreen } from '../../../src/features/regulation-sounds/RegulationSoundsScreen';
import type { SoundEngine, SoundStatus } from '../../../src/features/regulation-sounds/sound-controller';
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
jest.mock('@react-native-community/slider', () => 'Slider');
let callback: (status: SoundStatus) => void; let status: SoundStatus; let appEvent: (state: AppStateStatus) => void;
let engine: SoundEngine; const close = jest.fn();
const factory = jest.fn(async (_id, changed) => { callback = changed; return engine; });
beforeEach(() => {
  jest.clearAllMocks(); status = { loaded: true, playing: false, buffering: false, failed: false };
  engine = { configure: jest.fn(async () => {}), play: jest.fn(() => { status.playing = true; callback({ ...status }); }),
    pause: jest.fn(() => { status.playing = false; }), volume: jest.fn(), lockScreen: jest.fn(), dispose: jest.fn(), status: () => ({ ...status }) };
  factory.mockImplementation(async (_id, changed) => { callback = changed; return engine; });
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, changed) => { appEvent = changed; return { remove: jest.fn() }; });
});
afterEach(() => { jest.restoreAllMocks(); jest.useRealTimers(); });
async function open() { const view = render(<RegulationSoundsProvider factory={factory}><RegulationSoundsScreen onClose={close} /></RegulationSoundsProvider>); await act(async () => { appEvent('active'); }); return view; }
async function press(label: string) { await act(async () => { fireEvent.press(screen.getByRole('button', { name: label })); }); }
async function select(label = 'Ruído branco') { await act(async () => { fireEvent.press(screen.getByRole('radio', { name: label })); }); }
async function background() { await act(async () => { fireEvent(screen.getByLabelText('Continuar som em segundo plano'), 'valueChange', true); }); }

it('offers four honest radio choices, no default selection or autoplay, and explicit return', async () => {
  await open(); expect(screen.getAllByRole('radio')).toHaveLength(4);
  for (const label of ['Ruído branco', 'Ruído marrom', 'Chuva sintetizada', 'Oceano sintetizado']) expect(screen.getByRole('radio', { name: label })).not.toBeChecked();
  expect(screen.getByRole('button', { name: 'Reproduzir som' })).toBeDisabled(); expect(factory).not.toHaveBeenCalled();
  await select(); expect(factory).not.toHaveBeenCalled(); await press('Voltar ao quadro'); expect(close).toHaveBeenCalled();
});
it('starts only on command, pauses and changes sound without starting the new choice', async () => {
  await open(); await select(); await press('Reproduzir som'); expect(screen.getByText('Reproduzindo')).toBeOnTheScreen();
  await press('Pausar som'); expect(screen.getByText('Pausado')).toBeOnTheScreen(); await select('Chuva sintetizada');
  expect(engine.play).toHaveBeenCalledTimes(1); expect(screen.getByRole('radio', { name: 'Chuva sintetizada' })).toBeChecked();
});
it('accepts volume zero and accessibility increments without starting or resuming media', async () => {
  await open(); expect(screen.getByRole('adjustable', { name: 'Volume do som' })).toHaveAccessibilityValue({ now: 25 });
  await act(async () => { fireEvent(screen.getByLabelText('Volume do som'), 'valueChange', 0); });
  expect(screen.getByText('Volume: 0%')).toBeOnTheScreen(); expect(factory).not.toHaveBeenCalled();
  await act(async () => { fireEvent(screen.getByLabelText('Volume do som'), 'accessibilityAction', { nativeEvent: { actionName: 'increment' } }); });
  expect(screen.getByText('Volume: 5%')).toBeOnTheScreen();
  expect(screen.getByLabelText('Volume do som')).toHaveStyle({ minHeight: 48 });
});
it('keeps background off until explicit confirmation and supports cancelling without autoplay', async () => {
  await open(); await background(); expect(screen.getByLabelText('Continuar som em segundo plano').props.value).toBe(false);
  await press('Manter segundo plano desligado'); expect(factory).not.toHaveBeenCalled();
  await background(); await press('Confirmar segundo plano'); expect(screen.getByLabelText('Continuar som em segundo plano').props.value).toBe(true);
  expect(factory).not.toHaveBeenCalled();
});
it('does not confirm background optimistically and preserves the old flag after failure', async () => {
  await open(); await select(); await press('Reproduzir som');
  let reject!: (reason: Error) => void; jest.mocked(engine.configure).mockImplementationOnce(() => new Promise((_resolve, failed) => { reject = failed; }));
  await background(); act(() => { fireEvent.press(screen.getByRole('button', { name: 'Confirmar segundo plano' })); }); await act(async () => {});
  expect(screen.getByLabelText('Continuar som em segundo plano').props.value).toBe(false);
  await act(async () => { reject(new Error('synthetic private detail')); });
  expect(screen.getByRole('alert')).toHaveTextContent(/Não foi possível confirmar/); expect(screen.queryByText('synthetic private detail')).toBeNull();
  expect(screen.getByLabelText('Continuar som em segundo plano').props.value).toBe(false);
});
it('lets the person pause a pending load without late playback and retry explicitly', async () => {
  let finish!: (engine: SoundEngine) => void; factory.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  await open(); await select(); act(() => { fireEvent.press(screen.getByRole('button', { name: 'Reproduzir som' })); });
  await press('Pausar som'); await act(async () => { finish(engine); }); expect(engine.play).not.toHaveBeenCalled();
  await press('Reproduzir som'); expect(engine.play).toHaveBeenCalledTimes(1);
});
it('contains missing media capability, keeps return available and retries without losing choice', async () => {
  factory.mockRejectedValueOnce(new Error('synthetic')); await open(); await select('Oceano sintetizado'); await press('Reproduzir som');
  expect(screen.getByRole('alert')).toBeOnTheScreen(); expect(screen.getByRole('radio', { name: 'Oceano sintetizado' })).toBeChecked();
  await press('Tentar reproduzir novamente'); expect(engine.play).toHaveBeenCalledTimes(1);
});
it('keeps communication return usable even without a mounted audio provider', () => {
  render(<RegulationSoundsScreen onClose={close} />); fireEvent.press(screen.getByRole('button', { name: 'Voltar ao quadro' }));
  expect(close).toHaveBeenCalled(); expect(screen.queryByRole('radio')).toBeNull(); expect(factory).not.toHaveBeenCalled();
});
it('keeps timer drafts independent and rejects invalid duration without autoplay', async () => {
  await open(); await press('5 minutos para o som'); expect(factory).not.toHaveBeenCalled();
  await select(); await press('Reproduzir som');
  fireEvent.changeText(screen.getByLabelText('Duração do temporizador do som em minutos'), '0');
  await press('Aplicar temporizador do som'); expect(screen.getByText('Informe de 1 a 180 minutos inteiros.')).toBeOnTheScreen();
  expect(screen.getByText('Sem temporizador ativo.')).toBeOnTheScreen();
});
it('arms a timer explicitly, keeps cancel separate and preserves background preference', async () => {
  await open(); await select(); await press('Reproduzir som'); await press('Aplicar temporizador do som');
  expect(screen.getByText('Temporizador ativo.')).toBeOnTheScreen();
  expect(screen.getByLabelText('Continuar som em segundo plano')).toBeDisabled();
  jest.mocked(engine.pause).mockClear(); await press('Cancelar temporizador sem pausar som');
  expect(engine.pause).not.toHaveBeenCalled(); expect(screen.getByText('Reproduzindo')).toBeOnTheScreen();
  expect(screen.getByLabelText('Continuar som em segundo plano')).not.toBeDisabled();
});
it('requires voluntary background opt-out before applying without changing the flag silently', async () => {
  await open(); await background(); await press('Confirmar segundo plano'); await select(); await press('Reproduzir som');
  expect(screen.getByRole('button', { name: 'Aplicar temporizador do som' })).toBeDisabled();
  expect(screen.getByLabelText('Continuar som em segundo plano').props.value).toBe(true);
  expect(screen.getByText('Desligue segundo plano antes de aplicar um temporizador.')).toBeOnTheScreen();
});
it('shows end only after native stop and keeps zero/short remaining time accessible without announcements per second', async () => {
  jest.useFakeTimers({ now: 10000 }); await open(); await select(); await press('Reproduzir som');
  fireEvent.changeText(screen.getByLabelText('Duração do temporizador do som em minutos'), '1'); await press('Aplicar temporizador do som');
  expect(screen.getByLabelText('Tempo restante do som: 1 minutos e 0 segundos').props.accessibilityLiveRegion).toBeUndefined();
  act(() => jest.advanceTimersByTime(60000)); expect(screen.getByText('Temporizador encerrado. Som pausado.')).toBeOnTheScreen();
  expect(screen.getByText('Pausado')).toBeOnTheScreen(); expect(engine.play).toHaveBeenCalledTimes(1);
});
it('reports timer stop failure without claiming end or exposing native details', async () => {
  jest.useFakeTimers({ now: 10000 }); await open(); await select(); await press('Reproduzir som');
  fireEvent.changeText(screen.getByLabelText('Duração do temporizador do som em minutos'), '1'); await press('Aplicar temporizador do som');
  jest.mocked(engine.pause).mockImplementation(() => { throw new Error('synthetic private pause'); });
  act(() => jest.advanceTimersByTime(60000)); expect(screen.queryByText('Temporizador encerrado. Som pausado.')).toBeNull();
  expect(screen.getByText('Temporizador interrompido.')).toBeOnTheScreen(); expect(screen.queryByText('synthetic private pause')).toBeNull();
});

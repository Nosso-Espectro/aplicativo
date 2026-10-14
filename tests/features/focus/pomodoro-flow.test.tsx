import { StrictMode, useEffect } from 'react';
import { act, render } from '@testing-library/react-native';
import { renderRouter, screen, fireEvent } from 'expo-router/testing-library';
import { Slot, router } from 'expo-router';
import { AccessibilityInfo, AppState, BackHandler, type AppStateStatus } from 'react-native';
import StartupScreen from '../../../src/app';
import FocusLayout from '../../../src/app/focus/_layout';
import FocusRoute from '../../../src/app/focus';
import { PomodoroProvider, usePomodoro } from '../../../src/features/focus/PomodoroProvider';
import { LowStimulationProvider } from '../../../src/features/regulation/LowStimulationProvider';
import { LowStimulationControl } from '../../../src/features/regulation/LowStimulationControl';
import { SentenceProvider } from '../../../src/features/communication/sentence/SentenceProvider';
import { CustomCardsProvider } from '../../../src/features/communication/custom-cards/CustomCardsProvider';
import { openCardDatabase } from '../../../src/features/communication/storage/card-database';
import { openDisplayPreferencesDatabase } from '../../../src/features/regulation/display-preferences-database';
jest.mock('../../../src/features/communication/storage/card-database', () => ({ openCardDatabase: jest.fn() }));
jest.mock('../../../src/features/regulation/display-preferences-database', () => ({ openDisplayPreferencesDatabase: jest.fn() }));
jest.mock('../../../src/features/communication/custom-cards/local-image-storage', () => ({ localImages: { prune: jest.fn() } }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let appChanges: ((state: AppStateStatus) => void)[];
let back: Parameters<typeof BackHandler.addEventListener>[1] | undefined;
const remove = jest.fn();
const initialAppState = AppState.currentState;
function Layout() {
  return <LowStimulationProvider><LowStimulationControl /><SentenceProvider><CustomCardsProvider><Slot /></CustomCardsProvider></SentenceProvider></LowStimulationProvider>;
}
const routes = { _layout: Layout, index: StartupScreen, 'focus/_layout': FocusLayout, 'focus/index': FocusRoute };
beforeEach(() => {
  jest.clearAllMocks(); jest.useFakeTimers({ now: 10000 }); appChanges = []; back = undefined;
  AppState.currentState = 'active';
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, callback) => { appChanges.push(callback); return { remove }; });
  jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, callback) => { back = callback; return { remove }; });
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  jest.mocked(openCardDatabase).mockResolvedValue({ list: async () => [], listFavorites: async () => [], setFavorite: jest.fn(), save: jest.fn(), remove: jest.fn() });
  jest.mocked(openDisplayPreferencesDatabase).mockResolvedValue({ read: async () => ({ enabled: false }), save: async value => ({ ...value }) });
});
afterEach(() => { AppState.currentState = initialAppState; jest.restoreAllMocks(); jest.useRealTimers(); });
async function mount(url = '/focus') { const view = renderRouter(routes, { initialUrl: url }); await act(async () => {}); return view; }
async function press(name: string) { await act(async () => fireEvent.press(screen.getByRole('button', { name }))); }
function background(state: AppStateStatus) { act(() => { for (const callback of appChanges) callback(state); }); }
it('opens from the board, selects a preset and pauses/resumes/ends without retaining a session on reentry', async () => {
  await mount('/'); await press('Abrir Pomodoro');
  await act(async () => fireEvent.press(screen.getByRole('radio', { name: '50 minutos de foco / 10 de pausa' })));
  await press('Iniciar foco'); expect(screen.getByText('50:00')).toBeOnTheScreen();
  act(() => jest.advanceTimersByTime(5000)); expect(screen.getByText('49:55')).toBeOnTheScreen();
  await press('Pausar sessão'); act(() => jest.advanceTimersByTime(15000)); expect(screen.getByText('49:55')).toBeOnTheScreen();
  await press('Retomar sessão'); act(() => jest.advanceTimersByTime(1000)); expect(screen.getByText('49:54')).toBeOnTheScreen();
  await press('Encerrar sessão'); await press('Manter sessão'); expect(screen.getByText('49:54')).toBeOnTheScreen();
  await press('Encerrar sessão'); await press('Confirmar encerramento'); expect(screen.getByRole('button', { name: 'Iniciar foco' })).toBeOnTheScreen();
  await press('Iniciar foco'); await press('Voltar ao quadro'); await press('Manter sessão'); expect(screen.getByText('50:00')).toBeOnTheScreen();
  await press('Voltar ao quadro'); await press('Confirmar saída e encerrar'); await press('Abrir Pomodoro');
  expect(screen.getByRole('radio', { name: '25 minutos de foco / 5 de pausa' })).toBeChecked();
});
it('reconciles a long background only to the current boundary and waits for explicit phase commands', async () => {
  await mount(); await press('Iniciar foco'); background('background');
  act(() => jest.setSystemTime(100000000)); background('active');
  expect(screen.getByText('00:00')).toBeOnTheScreen(); expect(screen.getByText('Foco concluído. Próxima fase: pausa.')).toBeOnTheScreen();
  act(() => jest.advanceTimersByTime(600000)); expect(screen.getByRole('button', { name: 'Iniciar pausa' })).toBeOnTheScreen();
  await press('Iniciar pausa'); expect(screen.getByText('05:00')).toBeOnTheScreen();
  background('background'); act(() => jest.setSystemTime(200000000)); background('active');
  expect(screen.getByText('Pausa concluída. Próxima fase: foco.')).toBeOnTheScreen();
  await press('Iniciar foco'); expect(screen.getByText('25:00')).toBeOnTheScreen();
});
it('confirms hardware back and provides a direct-link fallback with low-stimulation mode unchanged', async () => {
  await mount(); await act(async () => fireEvent(screen.getByRole('switch', { name: 'Modo de baixa estimulação' }), 'valueChange', true));
  await press('Iniciar foco'); act(() => { expect(back?.({ type: 'hardwareBackPress', timeStamp: Date.now() })).toBe(true); });
  expect(screen.getByText('Encerrar a sessão e voltar ao quadro?')).toBeOnTheScreen();
  await press('Confirmar saída e encerrar'); expect(screen.getByRole('header', { name: 'Frase' })).toBeOnTheScreen();
  expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked();
});
it('discards on an external route removal and does not restore session or responses through navigation', async () => {
  await mount('/'); await press('Abrir Pomodoro'); await press('Iniciar foco');
  await act(async () => router.replace('/')); await press('Abrir Pomodoro');
  expect(screen.getByRole('button', { name: 'Iniciar foco' })).toBeOnTheScreen(); expect(screen.queryByText('25:00')).toBeNull();
});
it('retains the last confirmed remaining time after a regressive clock until human recovery', async () => {
  await mount(); await press('Iniciar foco'); act(() => jest.advanceTimersByTime(5000));
  background('background'); act(() => jest.setSystemTime(1)); background('active');
  expect(screen.getByText('24:55')).toBeOnTheScreen(); expect(screen.getByRole('button', { name: 'Retomar sessão' })).toBeOnTheScreen();
  await press('Retomar sessão'); act(() => jest.advanceTimersByTime(1000)); expect(screen.getByText('24:54')).toBeOnTheScreen();
});
it('requires re-confirmation if expiry changes the captured exit target', async () => {
  await mount(); await press('Iniciar foco'); await press('Voltar ao quadro');
  background('background'); act(() => jest.setSystemTime(2000000)); background('active');
  await press('Confirmar saída e encerrar'); expect(screen.getByText('A sessão mudou. Revise antes de encerrar.')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Iniciar pausa' })).toBeOnTheScreen();
});
let value: ReturnType<typeof usePomodoro>;
function Probe() { const context = usePomodoro(); useEffect(() => { value = context; }, [context]); return null; }
it('serializes rapid commands before render, rejects old callbacks after unmount and cleans StrictMode ownership', () => {
  const view = render(<StrictMode><PomodoroProvider><Probe /></PomodoroProvider></StrictMode>);
  const start = value.act; const expectedRevision = value.revision;
  act(() => {
    expect(start({ type: 'start', presetId: '25-5', expectedRevision })).toBe(true);
    expect(start({ type: 'start', presetId: '50-10', expectedRevision })).toBe(false);
  });
  expect(value.session?.presetId).toBe('25-5'); const callback = appChanges[appChanges.length - 1];
  view.unmount(); expect(remove).toHaveBeenCalled();
  act(() => { callback('active'); expect(value.act({ type: 'resume', expectedRevision: value.revision })).toBe(false); });
});
it('shows a recoverable clock failure without changing the session when the clock capability throws', () => {
  let failed = true; const clock = () => { if (failed) throw new Error('synthetic clock'); return 10; };
  render(<PomodoroProvider clock={clock}><Probe /></PomodoroProvider>);
  act(() => { value.act({ type: 'start', presetId: '25-5', expectedRevision: value.revision }); });
  expect(value.error).toBe('clock'); expect(value.session).toBeNull(); failed = false;
  act(() => { value.act({ type: 'start', presetId: '25-5', expectedRevision: value.revision }); });
  expect(value.error).toBeNull(); expect(value.session?.remainingMs).toBe(1500000);
});

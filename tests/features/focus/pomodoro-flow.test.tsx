import { StrictMode, useEffect } from 'react';
import { act, render } from '@testing-library/react-native';
import { renderRouter, screen, fireEvent } from 'expo-router/testing-library';
import { Slot, router } from 'expo-router';
import { AccessibilityInfo, AppState, BackHandler, Text, type AppStateStatus } from 'react-native';
import StartupScreen from '../../../src/app';
import FocusLayout from '../../../src/app/focus/_layout';
import FocusRoute from '../../../src/app/focus';
import FreeRoute from '../../../src/app/focus/free';
import { StopwatchProvider, useStopwatch } from '../../../src/features/focus/StopwatchProvider';
import { PomodoroProvider, usePomodoro } from '../../../src/features/focus/PomodoroProvider';
import { PomodoroScreen } from '../../../src/features/focus/PomodoroScreen';
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
const routes = { _layout: Layout, index: StartupScreen, 'focus/_layout': FocusLayout, 'focus/index': FocusRoute, 'focus/free': FreeRoute };
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
async function press(name: string) {
  if (!screen.queryByRole('button', { name }) && screen.queryByRole('button', { name: 'Abrir ferramentas' })) {
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Abrir ferramentas' })));
  }
  await act(async () => fireEvent.press(screen.getByRole('button', { name })));
}
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
function elapsed(hours: number, minutes: number, seconds: number) {
  expect(screen.getByLabelText(`Tempo decorrido: ${hours} horas, ${minutes} minutos e ${seconds} segundos`)).toBeOnTheScreen();
}
it('refuses an old open-free callback after a Pomodoro session starts before navigation', async () => {
  await mount();
  let button = screen.getByRole('button', { name: 'Abrir cronômetro livre' });
  while (button.parent && typeof button.props.onPress !== 'function') button = button.parent;
  const oldOpen = button.props.onPress;
  expect(typeof oldOpen).toBe('function');
  await press('Iniciar foco'); act(() => oldOpen());
  expect(screen.getByRole('button', { name: 'Pausar sessão' })).toBeOnTheScreen();
  expect(screen.queryByRole('header', { name: 'Cronômetro livre' })).toBeNull();
});
it('blocks duplicate free navigation and permits a human retry after a navigation capability fails', async () => {
  const opened = jest.fn().mockImplementationOnce(() => { throw new Error('synthetic navigation failure'); });
  renderRouter({ ...routes, 'focus/index': () => <PomodoroScreen onClose={jest.fn()} onFree={opened} /> }, { initialUrl: '/focus' });
  await act(async () => {}); await press('Abrir cronômetro livre');
  expect(screen.getByText('Não foi possível abrir o cronômetro. Tente novamente.')).toBeOnTheScreen();
  await press('Abrir cronômetro livre'); await press('Abrir cronômetro livre'); expect(opened).toHaveBeenCalledTimes(2);
});
it('opens the free stopwatch only while Pomodoro is inactive and retains elapsed across pause/resume/finalize/new', async () => {
  await mount('/'); await press('Abrir Pomodoro'); await press('Iniciar foco');
  expect(screen.queryByRole('button', { name: 'Abrir cronômetro livre' })).toBeNull();
  await press('Encerrar sessão'); await press('Confirmar encerramento'); await press('Abrir cronômetro livre'); elapsed(0, 0, 0);
  await press('Iniciar cronômetro'); act(() => jest.advanceTimersByTime(65000)); elapsed(0, 1, 5);
  await press('Pausar cronômetro'); act(() => jest.advanceTimersByTime(20000)); elapsed(0, 1, 5);
  await press('Retomar cronômetro'); act(() => jest.advanceTimersByTime(1000)); elapsed(0, 1, 6);
  await press('Finalizar cronômetro'); act(() => jest.advanceTimersByTime(60000)); elapsed(0, 1, 6);
  expect(screen.getByText('Sessão finalizada.')).toBeOnTheScreen(); await press('Nova sessão'); elapsed(0, 0, 0);
});
it('allows an immediate free finalization without penalty or a minimum duration', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline synthetic'));
  await mount('/focus/free'); await press('Iniciar cronômetro'); await press('Finalizar cronômetro'); elapsed(0, 0, 0);
  expect(screen.getByText('Sessão finalizada.')).toBeOnTheScreen(); expect(screen.getByRole('button', { name: 'Nova sessão' })).toBeOnTheScreen();
  expect(fetch).not.toHaveBeenCalled();
});
it('counts free background time, pauses without adding background while paused and keeps modes isolated', async () => {
  await mount('/focus/free'); await press('Iniciar cronômetro'); background('background');
  act(() => jest.setSystemTime(46810000)); background('active'); elapsed(13, 0, 0);
  await press('Pausar cronômetro'); background('background'); act(() => jest.setSystemTime(90000000)); background('active'); elapsed(13, 0, 0);
  await press('Finalizar cronômetro'); await press('Voltar ao foco');
  expect(screen.getByRole('button', { name: 'Iniciar foco' })).toBeOnTheScreen();
  await press('Abrir cronômetro livre'); elapsed(0, 0, 0); expect(screen.getByRole('button', { name: 'Iniciar cronômetro' })).toBeOnTheScreen();
});
it('confirms free hardware back, preserves mode9 and has a direct-link fallback', async () => {
  await mount('/focus/free'); await act(async () => fireEvent(screen.getByRole('switch', { name: 'Modo de baixa estimulação' }), 'valueChange', true));
  await press('Iniciar cronômetro'); act(() => { expect(back?.({ type: 'hardwareBackPress', timeStamp: Date.now() })).toBe(true); });
  await press('Manter cronômetro'); elapsed(0, 0, 0); await press('Voltar ao foco'); await press('Confirmar saída do cronômetro');
  expect(screen.getByRole('header', { name: 'Pomodoro' })).toBeOnTheScreen();
  expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked();
});
it('discards the free session on external navigation and does not resurrect it on reentry', async () => {
  await mount('/focus/free'); await press('Iniciar cronômetro'); act(() => jest.advanceTimersByTime(1000)); elapsed(0, 0, 1);
  const oldBack = back; await act(async () => router.replace('/')); act(() => { expect(oldBack?.({ type: 'hardwareBackPress', timeStamp: Date.now() })).toBe(false); });
  await press('Abrir Pomodoro'); await press('Abrir cronômetro livre'); elapsed(0, 0, 0);
  expect(screen.getByText('Sem sessão ativa.')).toBeOnTheScreen();
});
it('clears an old free confirmation when the navigator retains the screen and focuses it again', async () => {
  renderRouter({ ...routes, 'focus/other': () => <Text>Tela sintética de navegação</Text> }, { initialUrl: '/focus/free' });
  await act(async () => {}); await press('Iniciar cronômetro'); await press('Voltar ao foco');
  await act(async () => router.push('/focus/other')); await act(async () => router.back());
  expect(screen.getByText('Sem sessão ativa.')).toBeOnTheScreen(); elapsed(0, 0, 0);
  expect(screen.queryByText('Sair e descartar esta sessão?')).toBeNull();
});
it('retains free confirmed elapsed on clock regression and requires new confirmation if the session changed', async () => {
  await mount('/focus/free'); await press('Iniciar cronômetro'); act(() => jest.advanceTimersByTime(5000)); elapsed(0, 0, 5);
  await press('Voltar ao foco'); background('background'); act(() => jest.setSystemTime(1)); background('active');
  await press('Confirmar saída do cronômetro'); expect(screen.getByText('A sessão mudou. Revise antes de sair.')).toBeOnTheScreen();
  elapsed(0, 0, 5); await press('Retomar cronômetro'); act(() => jest.advanceTimersByTime(1000)); elapsed(0, 0, 6);
});
let stopwatch: ReturnType<typeof useStopwatch>;
function StopwatchProbe() { const context = useStopwatch(); useEffect(() => { stopwatch = context; }, [context]); return null; }
it('guards duplicate free commands before render and disposes stale clock callbacks in StrictMode', () => {
  const view = render(<StrictMode><StopwatchProvider><StopwatchProbe /></StopwatchProvider></StrictMode>);
  const command = stopwatch.act; const expectedRevision = stopwatch.revision;
  act(() => {
    expect(command({ type: 'start', expectedRevision })).toBe(true);
    expect(command({ type: 'start', expectedRevision })).toBe(false);
  });
  const callback = appChanges[appChanges.length - 1]; const captured = stopwatch.act;
  view.unmount(); act(() => { callback('active'); expect(captured({ type: 'finish', expectedRevision: stopwatch.revision })).toBe(false); });
  expect(remove).toHaveBeenCalled();
});
it('preserves the free final result when restarting with a failing clock and recovers explicitly', () => {
  let failed = false; let time = 10; const clock = () => { if (failed) throw new Error('synthetic clock'); return time; };
  render(<StopwatchProvider clock={clock}><StopwatchProbe /></StopwatchProvider>);
  act(() => { stopwatch.act({ type: 'start', expectedRevision: stopwatch.revision }); }); time = 20;
  act(() => { stopwatch.act({ type: 'finish', expectedRevision: stopwatch.revision }); }); failed = true;
  act(() => { stopwatch.act({ type: 'start', expectedRevision: stopwatch.revision }); });
  expect(stopwatch).toMatchObject({ error: 'clock', session: { status: 'finished', elapsedMs: 10 } }); failed = false;
  act(() => { stopwatch.act({ type: 'start', expectedRevision: stopwatch.revision }); });
  expect(stopwatch.session?.elapsedMs).toBe(0); expect(stopwatch.error).toBeNull();
});

async function editCustom(focus: string, pause: string) {
  await act(async () => fireEvent.press(screen.getByRole('radio', { name: 'Personalizado' })));
  await act(async () => fireEvent.changeText(screen.getByLabelText('Foco em minutos'), focus));
  await act(async () => fireEvent.changeText(screen.getByLabelText('Pausa em minutos'), pause));
}
function capturedPress(name: string) {
  let node = screen.getByRole('button', { name });
  while (node.parent && typeof node.props.onPress !== 'function') node = node.parent;
  expect(typeof node.props.onPress).toBe('function'); return node.props.onPress as () => void;
}
it('applies custom times without autoplay, freezes pause/resume and waits at each custom boundary', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline synthetic'));
  await mount(); await editCustom('1', '2');
  expect(screen.queryByRole('button', { name: 'Iniciar foco' })).toBeNull();
  await press('Aplicar intervalos'); expect(screen.getByText('1 minutos de foco / 2 de pausa')).toBeOnTheScreen();
  expect(screen.queryByText('01:00')).toBeNull(); await press('Iniciar foco');
  act(() => jest.advanceTimersByTime(5000)); await press('Pausar sessão');
  expect(screen.queryByRole('radio', { name: 'Personalizado' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Editar intervalos' })).toBeNull();
  act(() => jest.advanceTimersByTime(20000)); expect(screen.getByText('00:55')).toBeOnTheScreen();
  await press('Retomar sessão'); act(() => jest.advanceTimersByTime(55000));
  expect(screen.getByRole('button', { name: 'Iniciar pausa' })).toBeOnTheScreen();
  expect(screen.queryByLabelText('Foco em minutos')).toBeNull(); await press('Iniciar pausa'); expect(screen.getByText('02:00')).toBeOnTheScreen();
  act(() => jest.advanceTimersByTime(120000)); await press('Iniciar foco'); expect(screen.getByText('01:00')).toBeOnTheScreen();
  expect(fetch).not.toHaveBeenCalled();
});
it.each(['', '0', '181', '1.5', 'abc', '1e2'])('preserves invalid draft %s and previous preset until cancel', async invalid => {
  await mount(); await act(async () => fireEvent.press(screen.getByRole('radio', { name: '50 minutos de foco / 10 de pausa' })));
  await editCustom(invalid, '5'); await press('Aplicar intervalos');
  expect(screen.getByLabelText('Foco em minutos')).toHaveProp('value', invalid);
  expect(screen.getByRole('alert')).toHaveTextContent('Informe foco e pausa em minutos inteiros de 1 a 180.');
  await press('Cancelar edição'); expect(screen.getByRole('radio', { name: '50 minutos de foco / 10 de pausa' })).toBeChecked();
  await press('Iniciar foco'); expect(screen.getByText('50:00')).toBeOnTheScreen();
});
it('validates both fields and preserves applied choice after cancelling another edit', async () => {
  await mount(); await editCustom('3', '181'); await press('Aplicar intervalos'); expect(screen.getByRole('alert')).toBeOnTheScreen();
  await act(async () => fireEvent.changeText(screen.getByLabelText('Pausa em minutos'), '4')); await press('Aplicar intervalos');
  await press('Editar intervalos'); await act(async () => fireEvent.changeText(screen.getByLabelText('Foco em minutos'), '9'));
  await press('Cancelar edição'); expect(screen.getByText('3 minutos de foco / 4 de pausa')).toBeOnTheScreen();
  await press('Iniciar foco'); await press('Encerrar sessão'); await press('Confirmar encerramento');
  expect(screen.getByText('3 minutos de foco / 4 de pausa')).toBeOnTheScreen();
});
it('rejects old start, apply and cancel callbacks after editing or a new choice', async () => {
  await mount(); const oldStart = capturedPress('Iniciar foco');
  await editCustom('2', '3'); const oldApply = capturedPress('Aplicar intervalos'); const oldCancel = capturedPress('Cancelar edição');
  await act(async () => fireEvent.changeText(screen.getByLabelText('Foco em minutos'), '4'));
  act(() => { oldStart(); oldApply(); oldCancel(); });
  expect(screen.getByLabelText('Foco em minutos')).toHaveProp('value', '4');
  await press('Aplicar intervalos'); const start = capturedPress('Iniciar foco'); await press('Iniciar foco');
  act(() => start()); expect(screen.getByText('04:00')).toBeOnTheScreen();
});
it('discards custom draft and choice on retained blur, returns with defaults and preserves mode9', async () => {
  renderRouter({ ...routes, 'focus/other': () => <Text>Other synthetic route</Text> }, { initialUrl: '/focus' }); await act(async () => {});
  await act(async () => fireEvent(screen.getByRole('switch', { name: 'Modo de baixa estimulação' }), 'valueChange', true));
  await editCustom('6', '7'); const apply = capturedPress('Aplicar intervalos');
  await act(async () => router.push('/focus/other')); act(() => apply()); await act(async () => router.back());
  expect(screen.queryByLabelText('Foco em minutos')).toBeNull(); expect(screen.getByRole('radio', { name: '25 minutos de foco / 5 de pausa' })).toBeChecked();
  expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked();
  await editCustom('6', '7'); await press('Aplicar intervalos'); await press('Iniciar foco'); await press('Voltar ao quadro'); await press('Manter sessão');
  expect(screen.getByText('06:00')).toBeOnTheScreen(); await press('Voltar ao quadro'); await press('Confirmar saída e encerrar');
  await press('Abrir Pomodoro'); expect(screen.getByRole('radio', { name: '25 minutos de foco / 5 de pausa' })).toBeChecked();
});
it('starts the upper custom boundary and resets choice after visiting the free stopwatch', async () => {
  await mount(); await act(async () => fireEvent.press(screen.getByRole('radio', { name: 'Personalizado' })));
  expect(screen.getByLabelText('Foco em minutos')).toHaveProp('value', '25');
  expect(screen.getByLabelText('Pausa em minutos')).toHaveProp('value', '5');
  await act(async () => fireEvent.changeText(screen.getByLabelText('Foco em minutos'), '180'));
  await act(async () => fireEvent.changeText(screen.getByLabelText('Pausa em minutos'), '180'));
  await press('Aplicar intervalos'); await press('Iniciar foco'); expect(screen.getByText('180:00')).toBeOnTheScreen();
  await press('Encerrar sessão'); await press('Confirmar encerramento'); await press('Abrir cronômetro livre');
  elapsed(0, 0, 0); await press('Voltar ao foco');
  expect(screen.getByRole('radio', { name: '25 minutos de foco / 5 de pausa' })).toBeChecked();
});
it('refuses an old free navigation callback after editing and a custom apply callback after unmount', async () => {
  const view = await mount(); const free = capturedPress('Abrir cronômetro livre'); await editCustom('3', '4');
  act(() => free()); expect(screen.getByLabelText('Foco em minutos')).toBeOnTheScreen();
  const apply = capturedPress('Aplicar intervalos'); view.unmount(); act(() => apply());
});
it('keeps controls usable when pressing the already selected preset', async () => {
  await mount();
  await act(async () => fireEvent.press(screen.getByRole('radio', { name: '25 minutos de foco / 5 de pausa' })));
  await press('Iniciar foco'); expect(screen.getByText('25:00')).toBeOnTheScreen();
});

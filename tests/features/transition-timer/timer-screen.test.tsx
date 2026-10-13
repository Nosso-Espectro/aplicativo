import { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { TransitionTimerProvider } from '../../../src/features/transition-timer/TransitionTimerProvider';
import { TransitionTimerScreen } from '../../../src/features/transition-timer/TransitionTimerScreen';
import { openTimerDatabase, type TimerAction } from '../../../src/features/transition-timer/timer-database';
import { pauseTimer, resumeTimer, startTimer, type TimerSession } from '../../../src/features/transition-timer/visual-timer';
jest.mock('../../../src/features/transition-timer/timer-database', () => ({ openTimerDatabase: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let stored: TimerSession | null; let appStateEvent: (state: AppStateStatus) => void;
const read = jest.fn(); const operation = jest.fn(); const remove = jest.fn(); const close = jest.fn();
function Session() { return <TransitionTimerProvider><TransitionTimerScreen onClose={close} /></TransitionTimerProvider>; }
beforeEach(() => {
  jest.clearAllMocks(); jest.useFakeTimers({ now: 10000 }); stored = null;
  read.mockReset().mockImplementation(async () => stored && { ...stored });
  operation.mockReset().mockImplementation(async (action: TimerAction, nowMs: number) => {
    if (action.type === 'start') stored = startTimer(action.durationMs, nowMs);
    else if (action.type === 'pause') stored = pauseTimer(stored!, nowMs);
    else if (action.type === 'resume') stored = resumeTimer(stored!, nowMs);
    else stored = null;
    return stored && { ...stored };
  });
  jest.mocked(openTimerDatabase).mockResolvedValue({ read, act: operation });
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => { appStateEvent = listener; return { remove }; });
});
afterEach(() => { jest.restoreAllMocks(); jest.useRealTimers(); });
async function open() { const view = render(<Session />); await act(async () => {}); return view; }
async function press(name: string) { await act(async () => { fireEvent.press(screen.getByRole('button', { name })); }); }
function duration(minutes: string, seconds = '0') { fireEvent.changeText(screen.getByLabelText('Minutos do timer'), minutes); fireEvent.changeText(screen.getByLabelText('Segundos do timer'), seconds); }
it('starts absent, validates explicit duration and displays numbers plus a stable accessible bar — spec006/RF-001/RF-002', async () => {
  await open(); expect(screen.getByText('Nenhum timer em andamento.')).toBeOnTheScreen();
  expect(screen.getByLabelText('Minutos do timer').props.value).toBe(''); expect(operation).not.toHaveBeenCalled();
  await press('Iniciar timer'); expect(screen.getByRole('alert')).toHaveTextContent(/Use minutos e segundos inteiros/);
  expect(operation).not.toHaveBeenCalled(); duration('1'); await press('Iniciar timer');
  expect(screen.getByText('Em andamento')).toBeOnTheScreen();
  expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ min: 0, max: 60, now: 60 });
  expect(screen.getByLabelText('Tempo restante: 1 minuto e 0 segundos')).toBeOnTheScreen();
  expect(screen.getByRole('progressbar')).toHaveStyle({ height: 24, width: '100%' });
  act(() => jest.advanceTimersByTime(1000)); expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 59 });
});
it('pauses, holds remaining time and resumes without a new duration — spec006/RF-003', async () => {
  await open(); duration('1'); await press('Iniciar timer'); act(() => jest.advanceTimersByTime(5000));
  await press('Pausar timer'); expect(screen.getByText('Pausado')).toBeOnTheScreen();
  act(() => jest.advanceTimersByTime(10000)); expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 55 });
  await press('Retomar timer'); expect(screen.getByText('Em andamento')).toBeOnTheScreen();
  act(() => jest.advanceTimersByTime(1000)); expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 54 });
  expect(screen.queryByLabelText('Minutos do timer')).toBeNull();
});
it('requires cancellation confirmation, permits keeping it and clears only after explicit confirmation', async () => {
  await open(); duration('1'); await press('Iniciar timer'); await press('Cancelar timer');
  expect(operation).toHaveBeenCalledTimes(1); await press('Manter timer'); expect(stored?.phase).toBe('running');
  await press('Cancelar timer'); await press('Confirmar cancelamento do timer');
  expect(stored).toBeNull(); expect(screen.getByText('Nenhum timer em andamento.')).toBeOnTheScreen();
  expect(screen.queryByRole('progressbar')).toBeNull();
});
it('handles completion without negative numbers or automatic sound/vibration and allows a fresh duration', async () => {
  await open(); duration('', '1'); await press('Iniciar timer'); act(() => jest.advanceTimersByTime(2000));
  expect(screen.getByText('Concluído')).toBeOnTheScreen(); expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 0 });
  expect(operation).toHaveBeenCalledTimes(1); expect(screen.getByLabelText('Minutos do timer')).toBeOnTheScreen();
  duration('2'); await press('Iniciar timer'); expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ max: 120, now: 120 });
});
it('shows unknown restoration without offering to overwrite a saved session and keeps return available', async () => {
  let finish!: (value: TimerSession | null) => void;
  read.mockImplementationOnce(() => new Promise<TimerSession | null>((resolve) => { finish = resolve; }));
  render(<Session />); await act(async () => {});
  expect(screen.getByText('Abrindo timer…')).toBeOnTheScreen(); expect(screen.queryByText('Nenhum timer em andamento.')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Iniciar timer' })).toBeNull(); await press('Voltar ao quadro'); expect(close).toHaveBeenCalled();
  await act(async () => { finish(startTimer(60000, Date.now())); }); expect(screen.getByText('Em andamento')).toBeOnTheScreen();
});
it('recovers from read/open failure with generic feedback and never starts automatically', async () => {
  jest.mocked(openTimerDatabase).mockRejectedValueOnce(new Error('private detail')); await open();
  expect(screen.getByText('Não foi possível abrir o timer salvo.')).toBeOnTheScreen(); expect(screen.queryByText('private detail')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Iniciar timer' })).toBeNull(); await press('Tentar abrir timer novamente');
  expect(screen.getByRole('button', { name: 'Iniciar timer' })).toBeOnTheScreen(); expect(operation).not.toHaveBeenCalled();
});
it('keeps duration input after failed start and reloads storage without silently retrying the action', async () => {
  operation.mockRejectedValueOnce(new Error('private detail')); await open(); duration('1'); await press('Iniciar timer');
  expect(screen.getByText('Não foi possível confirmar a alteração do timer.')).toBeOnTheScreen(); expect(stored).toBeNull();
  expect(screen.getByLabelText('Minutos do timer').props.value).toBe('1'); expect(screen.queryByText('private detail')).toBeNull();
  await press('Atualizar timer salvo'); expect(operation).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('Minutos do timer').props.value).toBe('1'); await press('Iniciar timer'); expect(stored?.phase).toBe('running');
});
it('does not optimistically start and blocks duplicate pending requests', async () => {
  let finish!: (value: TimerSession | null) => void;
  operation.mockImplementationOnce(() => new Promise<TimerSession | null>((resolve) => { finish = resolve; }));
  await open(); duration('1'); fireEvent.press(screen.getByRole('button', { name: 'Iniciar timer' }));
  fireEvent.press(screen.getByRole('button', { name: 'Iniciar timer' }));
  expect(operation).toHaveBeenCalledTimes(1); expect(screen.getByText('Salvando timer…')).toBeOnTheScreen();
  expect(screen.queryByRole('progressbar')).toBeNull(); expect(screen.getByRole('button', { name: 'Iniciar timer' })).toBeDisabled();
  await act(async () => { finish(startTimer(60000, Date.now())); }); expect(screen.getByText('Em andamento')).toBeOnTheScreen();
});
it('keeps counting after failed pause and leaves paused time frozen after failed resume', async () => {
  await open(); duration('1'); await press('Iniciar timer'); operation.mockRejectedValueOnce(new Error('unavailable'));
  await press('Pausar timer'); expect(screen.getByText('Em andamento')).toBeOnTheScreen();
  act(() => jest.advanceTimersByTime(5000)); expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 55 });
  await press('Pausar timer'); operation.mockRejectedValueOnce(new Error('unavailable')); await press('Retomar timer');
  expect(screen.getByText('Pausado')).toBeOnTheScreen(); act(() => jest.advanceTimersByTime(10000));
  expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 55 });
});
it('keeps failed cancellation data and discards stale consent after storage refresh instead of cancelling a new timer', async () => {
  await open(); duration('1'); await press('Iniciar timer'); await press('Cancelar timer');
  operation.mockRejectedValueOnce(new Error('Timer session changed.')); await press('Confirmar cancelamento do timer');
  expect(screen.getByText('Em andamento')).toBeOnTheScreen(); expect(stored).not.toBeNull();
  stored = startTimer(120000, Date.now()); await press('Atualizar timer salvo');
  expect(screen.queryByRole('button', { name: 'Confirmar cancelamento do timer' })).toBeNull();
  expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ max: 120 }); expect(operation).toHaveBeenCalledTimes(2);
});
it('recalculates elapsed background time on foreground without background ticks or extra writes', async () => {
  await open(); duration('1'); await press('Iniciar timer'); act(() => appStateEvent('background'));
  act(() => jest.advanceTimersByTime(70000)); expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 60 });
  act(() => appStateEvent('active')); expect(screen.getByText('Concluído')).toBeOnTheScreen();
  expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 0 }); expect(operation).toHaveBeenCalledTimes(1);
});
it('restores a running or paused session after remount and unsubscribes cleanly', async () => {
  const view = await open(); duration('1'); await press('Iniciar timer'); view.unmount();
  expect(remove).toHaveBeenCalledTimes(1); act(() => jest.advanceTimersByTime(30000));
  const reopened = await open(); expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 30 });
  await press('Pausar timer'); reopened.unmount(); act(() => jest.advanceTimersByTime(70000));
  await open(); expect(screen.getByText('Pausado')).toBeOnTheScreen(); expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 30 });
});
it('keeps counter/progress silent between ticks while phase and command states remain accessible', async () => {
  await open(); duration('1'); await press('Iniciar timer');
  expect(screen.getByRole('progressbar').props.accessibilityLiveRegion).toBe('none');
  expect(screen.getByLabelText('Tempo restante: 1 minuto e 0 segundos').props.accessibilityLiveRegion).toBe('none');
  expect(screen.getByRole('button', { name: 'Pausar timer' })).toHaveStyle({ minHeight: 48 });
  expect(screen.getByRole('header', { name: 'Timer de transição' }).props.allowFontScaling).not.toBe(false);
});
it('deduplicates initialization under StrictMode effect replay', async () => {
  render(<StrictMode><Session /></StrictMode>); await act(async () => {});
  await waitFor(() => expect(screen.getByRole('button', { name: 'Iniciar timer' })).toBeOnTheScreen());
  expect(openTimerDatabase).toHaveBeenCalledTimes(1); expect(read).toHaveBeenCalledTimes(1); expect(operation).not.toHaveBeenCalled();
});

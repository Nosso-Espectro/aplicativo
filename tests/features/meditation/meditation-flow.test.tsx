import { StrictMode, useEffect } from 'react';
import { render } from '@testing-library/react-native';
import { Slot, router } from 'expo-router';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo, AppState, BackHandler, type AppStateStatus, type HardwareBackPressEvent } from 'react-native';
import MeditationRoute from '../../../src/app/meditation';
import StartupScreen from '../../../src/app';
import { MeditationProvider, useMeditation } from '../../../src/features/meditation/MeditationProvider';
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
let now: number; let changes: ((value: AppStateStatus) => void)[]; let back: ((event: HardwareBackPressEvent) => boolean | null | undefined)[];
const originalState = AppState.currentState;
beforeEach(() => {
  now = 10000; changes = []; back = []; AppState.currentState = 'active'; jest.spyOn(Date, 'now').mockImplementation(() => now);
  jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Offline synthetic fixture'));
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, callback) => { changes.push(callback); return { remove: jest.fn() }; });
  jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_type, callback) => { back.push(callback); return { remove: jest.fn() }; });
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  jest.mocked(openCardDatabase).mockResolvedValue({ list: async () => [], listFavorites: async () => [], setFavorite: jest.fn(), save: jest.fn(), remove: jest.fn() });
  jest.mocked(openDisplayPreferencesDatabase).mockResolvedValue({ read: async () => ({ enabled: false }), save: async value => ({ ...value }) });
});
afterEach(() => { expect(global.fetch).not.toHaveBeenCalled(); AppState.currentState = originalState; jest.restoreAllMocks(); });
function Layout() {
  return <LowStimulationProvider><LowStimulationControl /><SentenceProvider><CustomCardsProvider><Slot /></CustomCardsProvider></SentenceProvider></LowStimulationProvider>;
}
async function mount() {
  const view = renderRouter({ _layout: Layout, index: StartupScreen, meditation: MeditationRoute }, { initialUrl: '/meditation' });
  await act(async () => {});
  jest.spyOn(Date, 'now').mockImplementation(() => now);
  await screen.findByRole('header', { name: 'Meditação' }); return view;
}
async function press(name: string) { await act(async () => fireEvent.press(screen.getByRole('button', { name }))); }
async function startOne() { fireEvent.changeText(screen.getByLabelText('Duração da prática em minutos'), '1'); await press('Iniciar prática'); }
async function foreground(time: number) { now = time; await act(async () => changes.forEach(callback => callback('active'))); }
it('starts with an editable duration and notice OFF, rejects invalid drafts and begins only by command', async () => {
  await mount(); expect(screen.getByLabelText('Duração da prática em minutos').props.value).toBe('10');
  expect(screen.getByRole('switch', { name: 'Mostrar aviso visual ao terminar' })).not.toBeChecked();
  expect(screen.queryByText('Prática em andamento.')).toBeNull(); fireEvent.changeText(screen.getByLabelText('Duração da prática em minutos'), '0'); await press('Iniciar prática');
  expect(screen.getByText('Escolha uma duração inteira de 1 a 180 minutos.')).toBeOnTheScreen();
  expect(screen.getByLabelText('Duração da prática em minutos').props.value).toBe('0'); await press('5 minutos de prática'); await press('Iniciar prática');
  expect(screen.getByLabelText('Tempo restante: 5 minutos e 0 segundos')).toBeOnTheScreen(); expect(screen.queryByLabelText('Duração da prática em minutos')).toBeNull();
});
it('pauses and resumes without resetting time and ends manually without a completion notice', async () => {
  await mount(); await startOne(); await foreground(20000); await press('Pausar prática');
  expect(screen.getByLabelText('Tempo restante: 0 minutos e 50 segundos')).toBeOnTheScreen(); await foreground(100000);
  expect(screen.getByLabelText('Tempo restante: 0 minutos e 50 segundos')).toBeOnTheScreen(); await press('Retomar prática'); await foreground(110000);
  expect(screen.getByLabelText('Tempo restante: 0 minutos e 40 segundos')).toBeOnTheScreen(); await press('Encerrar prática');
  expect(screen.getByText('Prática encerrada.')).toBeOnTheScreen(); expect(screen.queryByText('O tempo escolhido terminou.')).toBeNull();
});
it.each([false, true])('completes with optional notice %s, never repeats after dismissal and resets configuration for a new practice', async notice => {
  await mount(); if (notice) await act(async () => fireEvent(screen.getByRole('switch', { name: 'Mostrar aviso visual ao terminar' }), 'valueChange', true));
  await startOne(); await foreground(70000); expect(screen.getByText('Tempo concluído.')).toBeOnTheScreen();
  if (notice) {
    expect(screen.getByText('O tempo escolhido terminou.').props.accessibilityLiveRegion).toBe('polite'); await press('Fechar aviso da prática');
  }
  expect(screen.queryByText('O tempo escolhido terminou.')).toBeNull(); await foreground(90000); expect(screen.queryByText('O tempo escolhido terminou.')).toBeNull();
  await press('Nova prática'); expect(screen.getByLabelText('Duração da prática em minutos').props.value).toBe('10');
  expect(screen.getByRole('switch', { name: 'Mostrar aviso visual ao terminar' })).not.toBeChecked();
});
it('reconciles a long background only on return, without replaying a final notice in the background', async () => {
  await mount(); await startOne(); await act(async () => changes.forEach(callback => callback('background')));
  now = 100000; expect(screen.getByText('Prática em andamento.')).toBeOnTheScreen(); await foreground(now);
  expect(screen.getByText('Tempo concluído.')).toBeOnTheScreen(); expect(screen.queryByText('O tempo escolhido terminou.')).toBeNull();
});
it('preserves confirmed time after a regressive clock and allows a human resume or end', async () => {
  await mount(); await startOne(); await foreground(20000); await foreground(15000);
  expect(screen.getByText('Prática pausada.')).toBeOnTheScreen(); expect(screen.getByLabelText('Tempo restante: 0 minutos e 50 segundos')).toBeOnTheScreen();
  expect(screen.getByText('Não foi possível conferir o relógio. O tempo confirmado foi mantido.')).toBeOnTheScreen();
  await foreground(30000); await press('Retomar prática'); await press('Encerrar prática'); expect(screen.getByText('Prática encerrada.')).toBeOnTheScreen();
});
it('confirms focused hardware-back exit, preserves practice on cancel and returns to an empty session', async () => {
  await mount(); await startOne(); const callback = back[back.length - 1];
  const event = { type: 'hardwareBackPress', timeStamp: now };
  act(() => { expect(callback(event)).toBe(true); }); expect(screen.getByText('Sair e descartar esta prática?')).toBeOnTheScreen();
  await press('Manter prática'); expect(screen.getByText('Prática em andamento.')).toBeOnTheScreen();
  await press('Voltar ao quadro'); await press('Confirmar saída da prática'); expect(screen.getByRole('header', { name: 'Frase' })).toBeOnTheScreen();
  expect(callback(event)).toBe(false); await act(async () => router.push('/meditation')); expect(screen.getByRole('button', { name: 'Iniciar prática' })).toBeOnTheScreen();
});
it('discards on external blur and opens from the tools drawer with mode9 and sentence intact', async () => {
  await mount(); await act(async () => fireEvent(screen.getByRole('switch', { name: 'Modo de baixa estimulação' }), 'valueChange', true));
  await startOne(); await act(async () => router.replace('/')); await press('Sim'); await press('Abrir ferramentas'); await press('Abrir meditação');
  expect(screen.getByRole('button', { name: 'Iniciar prática' })).toBeOnTheScreen(); expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked();
  await press('Voltar ao quadro'); expect(screen.getByRole('button', { name: 'Remover Sim da posição 1' })).toBeOnTheScreen();
});
it('rejects duplicate/stale provider commands, stale AppState callbacks and callbacks after StrictMode unmount', async () => {
  let value!: ReturnType<typeof useMeditation>; const snapshots: ReturnType<typeof useMeditation>[] = [];
  function Probe() { const context = useMeditation(); useEffect(() => { value = context; snapshots.push(context); }, [context]); return null; }
  const view = render(<StrictMode><MeditationProvider><Probe /></MeditationProvider></StrictMode>); await act(async () => {});
  expect(snapshots[0].act({ type: 'start', durationMinutes: 1, noticeEnabled: false, expectedRevision: value.revision })).toBe(false);
  const initial = value; act(() => { expect(initial.act({ type: 'start', durationMinutes: 1, noticeEnabled: false, expectedRevision: initial.revision })).toBe(true); });
  act(() => { expect(initial.act({ type: 'start', durationMinutes: 5, noticeEnabled: true, expectedRevision: initial.revision })).toBe(false); });
  const captured = value; view.unmount(); expect(captured.act({ type: 'end', expectedRevision: captured.revision })).toBe(false);
  now = 100000; for (const callback of changes) callback('active');
  expect(snapshots.some(snapshot => snapshot.session?.status === 'completed')).toBe(false);
});
it('rejects an interval captured before pause/resume even when invoked after its cleanup', async () => {
  const intervals = jest.spyOn(global, 'setInterval'); let value!: ReturnType<typeof useMeditation>;
  const clock = () => now;
  function Probe() { const context = useMeditation(); useEffect(() => { value = context; }, [context]); return null; }
  const view = render(<MeditationProvider clock={clock}><Probe /></MeditationProvider>);
  await act(async () => {});
  act(() => { value.act({ type: 'start', durationMinutes: 1, noticeEnabled: false, expectedRevision: value.revision }); });
  const callback = intervals.mock.calls.find(call => call[1] === 1000)![0];
  now = 20000; act(() => { value.act({ type: 'pause', expectedRevision: value.revision }); });
  now = 100000; act(() => { value.act({ type: 'resume', expectedRevision: value.revision }); });
  const confirmed = value.session;
  now = 200000; act(() => { if (typeof callback === 'function') callback(); });
  expect(value.session).toBe(confirmed); view.unmount();
});
it('contains a throwing clock without private details and preserves confirmed remaining time', async () => {
  let value!: ReturnType<typeof useMeditation>; let broken = false;
  const clock = () => { if (broken) throw new Error('Synthetic private clock detail'); return now; };
  function Probe() { const context = useMeditation(); useEffect(() => { value = context; }, [context]); return null; }
  const view = render(<MeditationProvider clock={clock}><Probe /></MeditationProvider>); await act(async () => {});
  act(() => { value.act({ type: 'start', durationMinutes: 1, noticeEnabled: false, expectedRevision: value.revision }); });
  now = 20000; act(() => changes.forEach(callback => callback('active'))); broken = true;
  act(() => changes.forEach(callback => callback('active')));
  expect(value).toMatchObject({ error: 'clock', session: { status: 'paused', remainingMs: 50000 } });
  expect(JSON.stringify(value)).not.toContain('Synthetic private clock detail'); view.unmount();
});

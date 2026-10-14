/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { StrictMode, useEffect } from 'react';
import { render } from '@testing-library/react-native';
import { Slot, router } from 'expo-router';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo, AppState, type AppStateStatus } from 'react-native';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import HydrationRoute from '../../../src/app/hydration';
import { HydrationProvider, useHydration } from '../../../src/features/hydration/HydrationProvider';
import { HydrationNotice } from '../../../src/features/hydration/HydrationNotice';
import { createHydrationController, type HydrationController } from '../../../src/features/hydration/hydration-controller';
import type { HydrationEngine, HydrationOwned } from '../../../src/features/hydration/expo-hydration-engine';
import { createDailyHydrationReceipt } from '../../../src/features/hydration/hydration-receipt';
import { planDailyHydration } from '../../../src/features/hydration/quiet-hours';
import StartupScreen from '../../../src/app';
import { LowStimulationProvider } from '../../../src/features/regulation/LowStimulationProvider';
import { LowStimulationControl } from '../../../src/features/regulation/LowStimulationControl';
import { SentenceProvider } from '../../../src/features/communication/sentence/SentenceProvider';
import { CustomCardsProvider } from '../../../src/features/communication/custom-cards/CustomCardsProvider';
import { openCardDatabase } from '../../../src/features/communication/storage/card-database';
import { openDisplayPreferencesDatabase } from '../../../src/features/regulation/display-preferences-database';
jest.mock('../../../src/features/communication/storage/card-database', () => ({ openCardDatabase: jest.fn() }));
jest.mock('../../../src/features/regulation/display-preferences-database', () => ({ openDisplayPreferencesDatabase: jest.fn() }));
jest.mock('../../../src/features/communication/custom-cards/local-image-storage', () => ({ localImages: { prune: jest.fn() } }));
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let sql: DatabaseSync; let engine: HydrationEngine; let controller: HydrationController;
let native: Map<string, number>; let current: () => HydrationOwned; let receive: (identifier: string, date: number) => void;
let changes: ((state: AppStateStatus) => void)[]; const original = AppState.currentState;
const create = () => { controller = createHydrationController({ factory: () => engine }); return controller; };
function Layout() { return <LowStimulationProvider><LowStimulationControl /><SentenceProvider><CustomCardsProvider>
  <HydrationProvider create={create}><HydrationNotice /><Slot /></HydrationProvider>
</CustomCardsProvider></SentenceProvider></LowStimulationProvider>; }
beforeEach(() => {
  jest.clearAllMocks();
  sql = new DatabaseSync(':memory:'); native = new Map(); changes = []; AppState.currentState = 'active';
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, callback) => { changes.push(callback); return { remove: jest.fn() }; });
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  jest.mocked(openCardDatabase).mockResolvedValue({ list: async () => [], listFavorites: async () => [], setFavorite: jest.fn(), save: jest.fn(), remove: jest.fn() });
  jest.mocked(openDisplayPreferencesDatabase).mockResolvedValue({ read: async () => ({ enabled: false }), save: async value => ({ ...value }) });
  const adapter = {
    execAsync: async (statement: string) => sql.exec(statement),
    runAsync: async (statement: string, ...params: (string | number | null)[]) => sql.prepare(statement).run(...params),
    getAllAsync: async (statement: string) => sql.prepare(statement).all(), closeAsync: async () => {},
    withExclusiveTransactionAsync: async (operation: (tx: SQLiteDatabase) => Promise<void>) => {
      sql.exec('BEGIN'); try { await operation(adapter as unknown as SQLiteDatabase); sql.exec('COMMIT'); }
      catch (error) { sql.exec('ROLLBACK'); throw error; }
    },
  };
  jest.mocked(openDatabaseAsync).mockResolvedValue(adapter as unknown as SQLiteDatabase);
  engine = {
    planDaily: jest.fn(async (generation, intervalMinutes, quiet) => {
      const plan = planDailyHydration(intervalMinutes, quiet, Date.now());
      return createDailyHydrationReceipt(generation, intervalMinutes, quiet, new Intl.DateTimeFormat().resolvedOptions().timeZone, plan.notBeforeMs, plan.slots);
    }),
    scheduleDaily: jest.fn(async (receipt, intervalMinutes) => {
      for (const item of receipt.entries) native.set(item.identifier, intervalMinutes); return receipt.entries.map(item => item.identifier);
    }),
    verifyDaily: jest.fn(async receipt => {
      if (receipt.entries.some(item => !native.has(item.identifier))) throw new Error('Synthetic missing daily ID');
      return receipt.entries.map(item => item.identifier);
    }),
    permission: jest.fn(async () => true), requestPermission: jest.fn(async () => true),
    inspect: jest.fn(async () => ({ scheduled: [...native].map(([identifier, intervalMinutes]) => ({ identifier, intervalMinutes })), presented: [] })),
    schedule: jest.fn(async entry => { native.set(entry.identifier, entry.intervalMinutes); }),
    cancel: jest.fn(async identifier => { native.delete(identifier); }),
    onReceived: jest.fn((owned, callback) => { current = owned; receive = callback; return jest.fn(); }), dispose: jest.fn(),
  };
});
it('shares default storage initialization across StrictMode owners and rejects commands after disposal', async () => {
  let value!: ReturnType<typeof useHydration>;
  function Probe() { const context = useHydration(); useEffect(() => { value = context; }, [context]); return null; }
  const view = render(<StrictMode><HydrationProvider><Probe /></HydrationProvider></StrictMode>);
  await act(async () => {});
  expect(value.loading).toBe(false); expect(value.config?.status).toBe('disabled');
  expect(openDatabaseAsync).toHaveBeenCalledTimes(1);
  const old = value.controller!; const revision = value.config!.revision; view.unmount();
  expect(await old.save(120, revision)).toBe(false);
  expect(engine.requestPermission).not.toHaveBeenCalled();
});
afterEach(() => { controller?.dispose(); sql.close(); AppState.currentState = original; jest.restoreAllMocks(); });
async function mount() {
  const view = renderRouter({ _layout: Layout, index: StartupScreen, hydration: HydrationRoute }, { initialUrl: '/hydration' });
  await screen.findByText('Lembretes desativados.'); return view;
}
async function press(name: string) { await act(async () => fireEvent.press(screen.getByRole('button', { name }))); }
async function activate() { await press('Ativar lembretes'); await press('Confirmar ativação dos lembretes'); }
it('keeps default off, validates drafts and saves without permission or schedule', async () => {
  await mount(); expect(engine.requestPermission).not.toHaveBeenCalled(); await press('Alterar intervalo');
  fireEvent.changeText(screen.getByLabelText('Intervalo em minutos'), '29'); await press('Salvar intervalo');
  expect(screen.getByText('Escolha um intervalo inteiro de 30 a 720 minutos.')).toBeOnTheScreen();
  await press('120 minutos'); await press('Cancelar edição do intervalo'); expect(screen.getByText('Intervalo salvo: 60 minutos.')).toBeOnTheScreen();
  await press('Alterar intervalo'); await press('30 minutos'); await press('Salvar intervalo');
  expect(screen.getByText('Intervalo salvo: 30 minutos.')).toBeOnTheScreen(); expect(engine.schedule).not.toHaveBeenCalled();
});
async function editQuiet(start = '22:00', end = '07:00') {
  await press('Alterar horário silencioso');
  await act(async () => fireEvent(screen.getByRole('switch', { name: 'Usar horário silencioso' }), 'valueChange', true));
  fireEvent.changeText(screen.getByLabelText('Início do horário silencioso'), start);
  fireEvent.changeText(screen.getByLabelText('Fim do horário silencioso'), end);
}
it('keeps quiet hours absent by default, validates civil fields and cancels drafts without effects', async () => {
  await mount(); expect(screen.getByText('Sem horário silencioso.')).toBeOnTheScreen();
  await press('Alterar horário silencioso'); expect(screen.getByRole('switch', { name: 'Usar horário silencioso' })).not.toBeChecked();
  await act(async () => fireEvent(screen.getByRole('switch', { name: 'Usar horário silencioso' }), 'valueChange', true));
  expect(screen.getByLabelText('Início do horário silencioso').props.value).toBe(''); expect(screen.getByLabelText('Fim do horário silencioso').props.value).toBe('');
  await press('Salvar horário silencioso'); expect(screen.getByText('Escolha início e fim diferentes, no formato HH:MM.')).toBeOnTheScreen();
  fireEvent.changeText(screen.getByLabelText('Início do horário silencioso'), '07:00'); fireEvent.changeText(screen.getByLabelText('Fim do horário silencioso'), '07:00');
  await press('Salvar horário silencioso'); expect(screen.getByText('Escolha início e fim diferentes, no formato HH:MM.')).toBeOnTheScreen();
  fireEvent.changeText(screen.getByLabelText('Fim do horário silencioso'), '25:00'); await press('Salvar horário silencioso');
  expect(screen.getByRole('button', { name: 'Ativar lembretes' })).toBeDisabled();
  await press('Cancelar edição do horário silencioso'); expect(screen.getByText('Sem horário silencioso.')).toBeOnTheScreen();
  expect(engine.requestPermission).not.toHaveBeenCalled(); expect(engine.planDaily).not.toHaveBeenCalled();
});
it('persists a midnight-crossing quiet window without scheduling and discards drafts on real route reentry', async () => {
  await mount(); await editQuiet(); await press('Salvar horário silencioso');
  expect(screen.getByText('Horário silencioso salvo: 22:00 a 07:00.')).toBeOnTheScreen();
  expect(engine.requestPermission).not.toHaveBeenCalled(); expect(engine.scheduleDaily).not.toHaveBeenCalled();
  await press('Alterar horário silencioso'); fireEvent.changeText(screen.getByLabelText('Início do horário silencioso'), '20:00');
  await press('Voltar ao quadro'); await act(async () => router.push('/hydration'));
  expect(screen.getByText('Horário silencioso salvo: 22:00 a 07:00.')).toBeOnTheScreen(); expect(screen.queryByLabelText('Início do horário silencioso')).toBeNull();
  expect(controller.getSnapshot().config!.quietWindow).toEqual({ startMinute: 1320, endMinute: 420 });
});
it('confirms the daily plan explicitly, requires pause before editing and resumes only on human command', async () => {
  await mount(); await editQuiet(); await press('Salvar horário silencioso'); await press('Ativar lembretes');
  expect(screen.getByText(/Ativar avisos locais em horários diários fora de 22:00 a 07:00/)).toBeOnTheScreen(); expect(engine.requestPermission).not.toHaveBeenCalled();
  await press('Cancelar ativação dos lembretes'); expect(engine.planDaily).not.toHaveBeenCalled(); await activate();
  expect(screen.getByText('Lembretes ativos.')).toBeOnTheScreen(); expect(screen.getByRole('button', { name: 'Alterar horário silencioso' })).toBeDisabled();
  expect(engine.schedule).not.toHaveBeenCalled(); expect(engine.scheduleDaily).toHaveBeenCalledTimes(1);
  await press('Pausar lembretes'); expect(native.size).toBe(0); await press('Alterar horário silencioso');
  fireEvent.changeText(screen.getByLabelText('Fim do horário silencioso'), '08:00'); await press('Salvar horário silencioso'); expect(native.size).toBe(0);
  await press('Retomar lembretes'); await press('Confirmar ativação dos lembretes'); expect(engine.scheduleDaily).toHaveBeenCalledTimes(2);
  await press('Desativar lembretes'); expect(native.size).toBe(0); expect(screen.getByText('Horário silencioso salvo: 22:00 a 08:00.')).toBeOnTheScreen();
});
it('turns the window off only through inactive draft save and preserves the legacy interval path', async () => {
  await mount(); await editQuiet(); await press('Salvar horário silencioso'); await press('Alterar horário silencioso');
  await act(async () => fireEvent(screen.getByRole('switch', { name: 'Usar horário silencioso' }), 'valueChange', false));
  expect(screen.getByText('Horário silencioso salvo: 22:00 a 07:00.')).toBeOnTheScreen(); await press('Salvar horário silencioso');
  expect(screen.getByText('Sem horário silencioso.')).toBeOnTheScreen(); await activate();
  expect(engine.schedule).toHaveBeenCalledTimes(1); expect(engine.scheduleDaily).not.toHaveBeenCalled();
});
it('keeps the saved window inactive on denial/capacity failure and retries only from explicit commands', async () => {
  await mount(); await editQuiet(); await press('Salvar horário silencioso'); jest.mocked(engine.requestPermission).mockResolvedValueOnce(false); await activate();
  expect(engine.planDaily).not.toHaveBeenCalled(); expect(screen.getByText('Permissão de avisos não concedida. Os lembretes continuam inativos.')).toBeOnTheScreen();
  jest.mocked(engine.planDaily).mockRejectedValueOnce(new Error('Synthetic capacity failure')); await activate(); expect(native.size).toBe(0);
  expect(screen.getByText('Estado dos lembretes não confirmado.')).toBeOnTheScreen(); await press('Conferir lembretes novamente');
  expect(engine.scheduleDaily).not.toHaveBeenCalled(); await activate(); expect(screen.getByText('Lembretes ativos.')).toBeOnTheScreen();
});
it('preserves mode9 and saved quiet settings through a background reconciliation without rescheduling', async () => {
  await mount(); await editQuiet(); await press('Salvar horário silencioso'); await activate();
  await act(async () => fireEvent(screen.getByRole('switch', { name: 'Modo de baixa estimulação' }), 'valueChange', true));
  await act(async () => changes.forEach(callback => callback('background'))); await act(async () => changes.forEach(callback => callback('active')));
  expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked(); expect(engine.verifyDaily).toHaveBeenCalled();
  expect(engine.scheduleDaily).toHaveBeenCalledTimes(1); expect(engine.requestPermission).toHaveBeenCalledTimes(1);
  jest.mocked(engine.verifyDaily).mockRejectedValueOnce(new Error('Synthetic timezone drift'));
  await act(async () => changes.forEach(callback => callback('active'))); expect(screen.getByText('Lembretes pausados.')).toBeOnTheScreen(); expect(native.size).toBe(0);
});
it('requires confirmation, pause before editing and explicit resume after saving', async () => {
  await mount(); await press('Ativar lembretes'); expect(engine.requestPermission).not.toHaveBeenCalled();
  await press('Cancelar ativação dos lembretes'); expect(native.size).toBe(0); await activate();
  expect(screen.getByText('Lembretes ativos.')).toBeOnTheScreen(); expect(screen.getByRole('button', { name: 'Alterar intervalo' })).toBeDisabled();
  await press('Pausar lembretes'); expect(native.size).toBe(0); await press('Alterar intervalo'); await press('120 minutos'); await press('Salvar intervalo');
  expect(engine.schedule).toHaveBeenCalledTimes(1); await press('Retomar lembretes'); await press('Confirmar ativação dos lembretes');
  expect([...native.values()]).toEqual([120]); await press('Desativar lembretes'); expect(native.size).toBe(0);
  expect(screen.getByText('Intervalo salvo: 120 minutos.')).toBeOnTheScreen();
});
it('keeps denied permission inactive with a human retry', async () => {
  await mount(); jest.mocked(engine.requestPermission).mockResolvedValueOnce(false); await activate();
  expect(screen.getByText('Permissão de avisos não concedida. Os lembretes continuam inativos.')).toBeOnTheScreen();
  expect(engine.schedule).not.toHaveBeenCalled(); await activate(); expect(native.size).toBe(1);
});
it('cancels a late permission on leaving and does not activate on return', async () => {
  await mount(); let finish!: (allowed: boolean) => void;
  jest.mocked(engine.requestPermission).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  await activate(); await press('Voltar ao quadro'); await act(async () => finish(true));
  expect(engine.schedule).not.toHaveBeenCalled(); expect(screen.getByRole('header', { name: 'Frase' })).toBeOnTheScreen();
  await act(async () => router.push('/hydration')); expect(screen.getByText('Lembretes desativados.')).toBeOnTheScreen();
});
it('opens from the real tools drawer and preserves low-stimulation mode across fallback and reentry', async () => {
  await mount(); await act(async () => fireEvent(screen.getByRole('switch', { name: 'Modo de baixa estimulação' }), 'valueChange', true));
  await press('Voltar ao quadro'); await press('Abrir ferramentas'); await press('Abrir lembretes de água');
  expect(screen.getByText('Lembretes desativados.')).toBeOnTheScreen();
  expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked();
  expect(engine.requestPermission).not.toHaveBeenCalled(); expect(engine.schedule).not.toHaveBeenCalled();
});
it('does not falsely confirm a failed cancellation and recovers only on explicit retry', async () => {
  await mount(); await activate(); jest.mocked(engine.cancel).mockRejectedValueOnce(new Error('synthetic'));
  await press('Pausar lembretes'); expect(screen.getByText('Estado dos lembretes não confirmado.')).toBeOnTheScreen();
  expect(native.size).toBe(1); await press('Conferir lembretes novamente'); expect(native.size).toBe(0);
  expect(screen.getByText('Lembretes pausados.')).toBeOnTheScreen(); expect(engine.schedule).toHaveBeenCalledTimes(1);
});
it('shows only a current foreground reminder, closes it and never replays background events', async () => {
  await mount(); await activate(); const owned = current(); const id = typeof owned === 'string' ? owned : owned![0];
  act(() => receive(id, Date.now() + 1)); expect(screen.getByText('Uma pausa para água, se desejar.')).toBeOnTheScreen();
  await press('Fechar lembrete de água'); expect(screen.queryByText('Uma pausa para água, se desejar.')).toBeNull();
  await act(async () => changes.forEach(callback => callback('background'))); act(() => receive(id, Date.now() + 2));
  await act(async () => changes.forEach(callback => callback('active')));
  expect(screen.queryByText('Uma pausa para água, se desejar.')).toBeNull(); expect(engine.schedule).toHaveBeenCalledTimes(1);
});

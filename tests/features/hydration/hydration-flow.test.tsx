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
import type { HydrationEngine } from '../../../src/features/hydration/expo-hydration-engine';
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
let native: Map<string, number>; let current: () => string | null; let receive: (identifier: string, date: number) => void;
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
  await mount(); await activate(); const id = current()!;
  act(() => receive(id, Date.now() + 1)); expect(screen.getByText('Uma pausa para água, se desejar.')).toBeOnTheScreen();
  await press('Fechar lembrete de água'); expect(screen.queryByText('Uma pausa para água, se desejar.')).toBeNull();
  await act(async () => changes.forEach(callback => callback('background'))); act(() => receive(id, Date.now() + 2));
  await act(async () => changes.forEach(callback => callback('active')));
  expect(screen.queryByText('Uma pausa para água, se desejar.')).toBeNull(); expect(engine.schedule).toHaveBeenCalledTimes(1);
});

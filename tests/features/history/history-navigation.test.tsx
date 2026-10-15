import { act, waitFor } from '@testing-library/react-native';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { Slot, router } from 'expo-router';
import { AccessibilityInfo, Text } from 'react-native';
import { openDatabaseAsync } from 'expo-sqlite';
import StartupScreen from '../../../src/app';
import CheckInScreen from '../../../src/app/check-in';
import HistoryRoute from '../../../src/app/history';
import PlayRoutineScreen from '../../../src/app/routines/play/[id]';
import { RoutineProvider } from '../../../src/features/routines/RoutineProvider';
import { openRoutineDatabase } from '../../../src/features/routines/routine-database';
import { openHistoryDatabase, type HistoryDatabase } from '../../../src/features/history/history-database';
import { historyStorage } from '../../../src/features/history/history-storage';
import { SentenceProvider } from '../../../src/features/communication/sentence/SentenceProvider';
import { CustomCardsProvider } from '../../../src/features/communication/custom-cards/CustomCardsProvider';
import { LowStimulationProvider } from '../../../src/features/regulation/LowStimulationProvider';
import { LowStimulationControl } from '../../../src/features/regulation/LowStimulationControl';
import { openCardDatabase } from '../../../src/features/communication/storage/card-database';
import { openDisplayPreferencesDatabase } from '../../../src/features/regulation/display-preferences-database';
import { historySQLiteFixture } from './sqlite-fixture';

jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
jest.mock('../../../src/features/history/history-storage', () => ({ historyStorage: jest.fn() }));
jest.mock('../../../src/features/communication/storage/card-database', () => ({ openCardDatabase: jest.fn() }));
jest.mock('../../../src/features/regulation/display-preferences-database', () => ({ openDisplayPreferencesDatabase: jest.fn() }));
jest.mock('../../../src/features/communication/custom-cards/local-image-storage', () => ({ localImages: { prune: jest.fn() },
  isLocalImage: (uri: string) => uri.startsWith('file://'), createLocalImageStorage: () => ({ prune: async () => {} }) }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let fixture: ReturnType<typeof historySQLiteFixture>;
let opening: Promise<HistoryDatabase> | null;
function Layout() {
  return <LowStimulationProvider><LowStimulationControl /><SentenceProvider><CustomCardsProvider><Slot /></CustomCardsProvider></SentenceProvider></LowStimulationProvider>;
}
function RoutinesLayout() { return <RoutineProvider><Slot /></RoutineProvider>; }
const routes = { _layout: Layout, index: StartupScreen, 'check-in/index': CheckInScreen, history: HistoryRoute,
  'routines/_layout': RoutinesLayout, 'routines/play/[id]': PlayRoutineScreen, outside: () => <Text>Outra tela</Text> };
beforeEach(() => {
  jest.clearAllMocks(); fixture = historySQLiteFixture(); opening = null;
  jest.mocked(openDatabaseAsync).mockImplementation(name => fixture.open(name));
  jest.mocked(historyStorage).mockImplementation(() => { opening ??= openHistoryDatabase(); return opening; });
  jest.mocked(openCardDatabase).mockResolvedValue({ list: async () => [], listFavorites: async () => [], setFavorite: jest.fn(), save: jest.fn(), remove: jest.fn() });
  jest.mocked(openDisplayPreferencesDatabase).mockResolvedValue({ read: async () => ({ enabled: false }), save: jest.fn(async value => ({ ...value })) });
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
});
afterEach(() => { fixture.close(); jest.restoreAllMocks(); });
async function press(name: string) { await act(async () => fireEvent.press(screen.getByRole('button', { name }))); }
async function finishCheckIn() {
  await act(async () => fireEvent.press(screen.getByRole('radio', { name: 'Sim' })));
  await press('Continuar'); for (let index = 1; index < 8; index++) await press('Pular pergunta');
}
function callback(name = 'Salvar no histórico'): () => void {
  let node = screen.getByRole('button', { name });
  while (node.parent && typeof node.props.onPress !== 'function') node = node.parent;
  return node.props.onPress as () => void;
}
it('saves an opt-in check-in via real Router/SQLite then opens history from real Ferramentas with mode9 preserved', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  const view = renderRouter(routes, { initialUrl: '/check-in' }); await finishCheckIn();
  expect(historyStorage).not.toHaveBeenCalled();
  await press('Salvar no histórico'); await screen.findByText('Salvo no histórico.');
  const saved = await (await historyStorage()).list(); expect(saved).toHaveLength(1);
  expect(saved[0]).toMatchObject({ type: 'check-in', answers: { thirst: 'yes' } });
  await press('Voltar ao quadro');
  await act(async () => fireEvent(screen.getByRole('switch', { name: 'Modo de baixa estimulação' }), 'valueChange', true));
  await waitFor(() => expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked());
  await press('Abrir ferramentas'); await press('Abrir histórico');
  expect(view.getPathname()).toBe('/history'); expect(view.getSearchParams()).toEqual({});
  await screen.findByLabelText('Você está com sede? Sim');
  expect(screen.queryByText('Você está com fome?')).toBeNull();
  expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked();
  await press('Voltar ao quadro'); expect(view.getPathname()).toBe('/');
  expect(fetch).not.toHaveBeenCalled();
  expect(await (await openHistoryDatabase()).list()).toEqual(saved);
});
it('never records skipped-empty check-in or routine completion automatically, and stores only a chosen routine snapshot', async () => {
  const view = renderRouter(routes, { initialUrl: '/check-in' });
  for (let index = 0; index < 8; index++) await press('Pular pergunta');
  expect(screen.queryByRole('button', { name: 'Salvar no histórico' })).toBeNull();
  expect(historyStorage).not.toHaveBeenCalled();
  const db = await openRoutineDatabase();
  const [routine] = await db.save({ name: 'Rotina local', steps: [{ id: 'a', title: 'Etapa pessoal', imageUri: null }] });
  await act(async () => router.replace(`/routines/play/${routine.id}`));
  await screen.findByText('Etapa pessoal'); await press('Concluir etapa atual');
  await screen.findByText('Rotina concluída'); expect(historyStorage).not.toHaveBeenCalled();
  await press('Salvar no histórico'); await screen.findByText('Salvo no histórico.');
  const saved = await (await historyStorage()).list();
  expect(saved).toHaveLength(1); expect(saved[0]).toMatchObject({ type: 'routine', name: 'Rotina local', steps: 1 });
  expect(JSON.stringify(saved)).not.toMatch(/Etapa pessoal|routine-/);
  await db.save({ name: 'Nome alterado', steps: routine.steps }, routine.id);
  await act(async () => router.replace('/history')); await screen.findByText('Rotina local');
  expect(screen.queryByText('Nome alterado')).toBeNull(); expect(view.getSearchParams()).toEqual({});
});
it('retains an authorized SQLite commit after unmount without navigating or replaying captured commands', async () => {
  const view = renderRouter(routes, { initialUrl: '/check-in' }); await finishCheckIn(); const old = callback();
  let release!: () => void; fixture.delayCommit(new Promise<void>(resolve => { release = resolve; }));
  await press('Salvar no histórico'); await waitFor(() => expect(fixture.isWaiting()).toBe(true));
  await act(async () => router.replace('/outside')); await screen.findByText('Outra tela');
  await act(async () => { release(); old(); }); await waitFor(() => expect(fixture.isCommitted()).toBe(true));
  expect(view.getPathname()).toBe('/outside'); expect(screen.queryByText('Salvo no histórico.')).toBeNull();
  expect(await (await historyStorage()).list()).toHaveLength(1);
});
it('rolls back a failed save in the actual flow and retries the same snapshot without duplicates', async () => {
  renderRouter(routes, { initialUrl: '/check-in' }); await finishCheckIn();
  fixture.failResult(true); await press('Salvar no histórico'); await screen.findByRole('alert');
  fixture.failResult(false); expect(await (await historyStorage()).list()).toEqual([]);
  await press('Salvar no histórico'); await screen.findByText('Salvo no histórico.');
  expect(await (await historyStorage()).list()).toHaveLength(1);
});

async function seededHistory() {
  const db = await historyStorage();
  await db.save({ id: 'check-in-test', savedAt: 1000, type: 'check-in', answers: { thirst: 'yes' } });
  await db.save({ id: 'routine-test', savedAt: 2000, type: 'routine', name: 'Rotina preservada', steps: 1 });
  return db;
}
it('deletes individual and all filtered snapshots durably without touching the real source routine', async () => {
  const db = await seededHistory(); const originalDb = await openRoutineDatabase();
  const original = await originalDb.save({ name: 'Rotina preservada', steps: [{ id: 'step-original', title: 'Etapa preservada', imageUri: null }] });
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  const view = renderRouter(routes, { initialUrl: '/history' }); await screen.findByText('Rotina preservada');
  await press('Excluir registro 1'); await press('Confirmar exclusão');
  expect(screen.queryByText('Rotina preservada')).toBeNull(); expect(await originalDb.list()).toEqual(original);
  expect(await db.list()).toHaveLength(1);
  await act(async () => fireEvent.press(screen.getByRole('radio', { name: 'Rotinas concluídas' })));
  expect(screen.getByText('Nenhum registro deste tipo.')).toBeOnTheScreen();
  await press('Excluir todo o histórico'); await press('Confirmar exclusão');
  expect(screen.getByText('Ainda não há registros salvos.')).toBeOnTheScreen();
  expect(await (await openHistoryDatabase()).list()).toEqual([]); expect(await originalDb.list()).toEqual(original);
  expect(fetch).not.toHaveBeenCalled(); expect(view.getSearchParams()).toEqual({});
});
it('keeps SQLite unchanged after cancelling or after real Router blur/refocus of old confirmation', async () => {
  const db = await seededHistory(); const before = await db.list();
  renderRouter(routes, { initialUrl: '/history' }); await screen.findByText('Rotina preservada');
  await press('Excluir todo o histórico'); const cancelled = callback('Confirmar exclusão');
  await press('Manter registros'); await act(async () => cancelled()); expect(await db.list()).toEqual(before);
  await press('Excluir todo o histórico'); const old = callback('Confirmar exclusão');
  await act(async () => router.push('/outside')); await screen.findByText('Outra tela');
  await act(async () => router.back()); await screen.findByText('Rotina preservada');
  await act(async () => old()); expect(await db.list()).toEqual(before);
  expect(screen.queryByRole('button', { name: 'Confirmar exclusão' })).toBeNull();
});
it('commits an authorized deletion across Router exit and reloads cleanly without old feedback', async () => {
  const db = await seededHistory();
  const view = renderRouter(routes, { initialUrl: '/history' }); await screen.findByText('Rotina preservada');
  let release!: () => void; fixture.delayCommit(new Promise<void>(done => { release = done; }));
  await press('Excluir todo o histórico'); await press('Confirmar exclusão');
  await waitFor(() => expect(fixture.isWaiting()).toBe(true));
  await act(async () => router.push('/outside')); await screen.findByText('Outra tela');
  await act(async () => router.back()); await act(async () => release());
  await screen.findByText('Ainda não há registros salvos.'); expect(await db.list()).toEqual([]);
  expect(view.getPathname()).toBe('/history'); expect(screen.queryByText('Exclusão concluída.')).toBeNull();
});
it('does not delete a new record that was not reviewed, then refreshes and requires fresh confirmation', async () => {
  const db = await seededHistory(); renderRouter(routes, { initialUrl: '/history' }); await screen.findByText('Rotina preservada');
  await press('Excluir todo o histórico');
  await db.save({ id: 'new-unreviewed', savedAt: 3000, type: 'routine', name: 'Novo registro', steps: 2 });
  await press('Confirmar exclusão'); await screen.findByRole('alert');
  expect(await db.list()).toHaveLength(3); expect(screen.queryByText('Exclusão concluída.')).toBeNull();
  await press('Atualizar histórico'); await screen.findByText('Novo registro');
  await press('Excluir todo o histórico');
  expect(screen.getByText('Serão excluídos 3 registros de todos os tipos, inclusive os ocultos pelo filtro.')).toBeOnTheScreen();
  await press('Confirmar exclusão'); expect(await db.list()).toEqual([]);
});
it('retains the last committed contents when deletion fails and retries only after a new confirmation', async () => {
  const db = await seededHistory(); const before = await db.list();
  renderRouter(routes, { initialUrl: '/history' }); await screen.findByText('Rotina preservada');
  fixture.failResult(true); await press('Excluir todo o histórico'); const old = callback('Confirmar exclusão');
  await press('Confirmar exclusão'); await screen.findByRole('alert'); fixture.failResult(false);
  expect(await db.list()).toEqual(before); expect(screen.getByText('Rotina preservada')).toBeOnTheScreen();
  await act(async () => old()); expect(await db.list()).toEqual(before);
  await press('Atualizar histórico'); await screen.findByText('Rotina preservada');
  await press('Excluir todo o histórico'); await press('Confirmar exclusão'); expect(await db.list()).toEqual([]);
});

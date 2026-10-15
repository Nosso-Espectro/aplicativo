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
function callback(): () => void {
  let node = screen.getByRole('button', { name: 'Salvar no histórico' });
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

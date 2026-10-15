import { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ScrollView } from 'react-native';
import { HistoryScreen } from '../../../src/features/history/HistoryScreen';
import { historyStorage } from '../../../src/features/history/history-storage';
import type { HistoryRecord } from '../../../src/features/history/history-model';

jest.mock('../../../src/features/history/history-storage', () => ({ historyStorage: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let mockFocused = true;
jest.mock('expo-router', () => ({ useFocusEffect: (callback: () => void | (() => void)) => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react'); const focused = mockFocused;
  useEffect(() => { if (focused) return callback(); }, [callback, focused]);
} }));
const remove = jest.fn(); const list = jest.fn(); const save = jest.fn();
const rows: HistoryRecord[] = [
  { type: 'routine', id: 'r', savedAt: 2000, name: 'Teste local', steps: 2 },
  { type: 'check-in', id: 'c', savedAt: 1000, answers: { thirst: 'yes' } },
];
beforeEach(() => {
  jest.clearAllMocks(); mockFocused = true;
  list.mockReset().mockResolvedValue(rows); remove.mockReset().mockResolvedValue([]);
  jest.mocked(historyStorage).mockResolvedValue({ save, list, remove });
});
function callback(name: string): () => void {
  let node = screen.getByRole('button', { name });
  while (node.parent && typeof node.props.onPress !== 'function') node = node.parent;
  return node.props.onPress as () => void;
}
async function mount() { const view = render(<HistoryScreen onExit={jest.fn()} />); await screen.findByText('Teste local'); return view; }
async function press(name: string) { await act(async () => fireEvent.press(screen.getByRole('button', { name }))); }
it('requires explicit whole-history confirmation including hidden types and supports keeping all records', async () => {
  await mount(); fireEvent.press(screen.getByRole('radio', { name: 'Check-ins' }));
  await press('Excluir todo o histórico');
  expect(screen.getByText('Serão excluídos 2 registros de todos os tipos, inclusive os ocultos pelo filtro.')).toBeOnTheScreen();
  expect(remove).not.toHaveBeenCalled(); const old = callback('Confirmar exclusão'); await press('Manter registros');
  await act(async () => old()); expect(remove).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Você está com sede? Sim')).toBeOnTheScreen();
});
it('confirms an individual target and updates filtered views only after the database confirms', async () => {
  let resolve!: (records: HistoryRecord[]) => void;
  remove.mockImplementationOnce(() => new Promise<HistoryRecord[]>(done => { resolve = done; }));
  await mount(); await press('Excluir registro 1');
  expect(screen.getByText(/Teste local\. Salvo em/)).toBeOnTheScreen();
  const old = callback('Confirmar exclusão'); await act(async () => { old(); old(); });
  expect(remove).toHaveBeenCalledTimes(1); expect(remove).toHaveBeenCalledWith({ kind: 'record', id: 'r' });
  expect(screen.getByText('Teste local')).toBeOnTheScreen(); expect(screen.getByRole('button', { name: 'Confirmar exclusão' })).toBeDisabled();
  await act(async () => resolve([rows[1]])); expect(screen.queryByText('Teste local')).toBeNull();
  expect(screen.getByText('Exclusão concluída.')).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('radio', { name: 'Rotinas concluídas' }));
  expect(screen.getByText('Nenhum registro deste tipo.')).toBeOnTheScreen();
  await press('Excluir todo o histórico');
  expect(screen.getByText('Será excluído 1 registro, mesmo se estiver oculto pelo filtro.')).toBeOnTheScreen();
});
it('removes all reviewed records regardless of the current filter and shows true empty history', async () => {
  await mount(); fireEvent.press(screen.getByRole('radio', { name: 'Check-ins' }));
  await press('Excluir todo o histórico'); await press('Confirmar exclusão');
  expect(remove).toHaveBeenCalledWith({ kind: 'all', ids: ['r', 'c'] });
  expect(screen.getByText('Ainda não há registros salvos.')).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Excluir todo o histórico' })).toBeNull();
});
it('revokes old confirmation when cancelled, replaced or filtered', async () => {
  await mount(); await press('Excluir registro 1'); const old = callback('Confirmar exclusão');
  await press('Manter registros'); await press('Excluir registro 2');
  await act(async () => old()); expect(remove).not.toHaveBeenCalled();
  const other = callback('Confirmar exclusão'); fireEvent.press(screen.getByRole('radio', { name: 'Check-ins' }));
  await act(async () => other()); expect(remove).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Confirmar exclusão' })).toBeNull();
});
it('does not revive old confirmation or delete commands after blur/refocus or unmount', async () => {
  const view = await mount(); const oldRequest = callback('Excluir todo o histórico');
  await press('Excluir registro 1'); const oldConfirm = callback('Confirmar exclusão');
  mockFocused = false; view.rerender(<HistoryScreen onExit={jest.fn()} />);
  mockFocused = true; view.rerender(<HistoryScreen onExit={jest.fn()} />); await screen.findByText('Teste local');
  await act(async () => { oldRequest(); oldConfirm(); }); expect(remove).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Confirmar exclusão' })).toBeNull();
  await press('Excluir registro 1'); const another = callback('Confirmar exclusão'); view.unmount();
  await act(async () => another()); expect(remove).not.toHaveBeenCalled();
});
it('preserves records on failure, hides details and requires a new confirmation after refresh', async () => {
  remove.mockRejectedValueOnce(new Error('private synthetic data'));
  await mount(); await press('Excluir todo o histórico'); const old = callback('Confirmar exclusão'); await press('Confirmar exclusão');
  expect(screen.getByText('Teste local')).toBeOnTheScreen(); expect(screen.getByRole('alert')).toBeOnTheScreen();
  expect(screen.queryByText('private synthetic data')).toBeNull(); expect(screen.queryByText('Exclusão concluída.')).toBeNull();
  await act(async () => old()); expect(remove).toHaveBeenCalledTimes(1);
  await press('Atualizar histórico'); await screen.findByText('Teste local');
  await press('Excluir todo o histórico'); await press('Confirmar exclusão');
  expect(remove).toHaveBeenCalledTimes(2); expect(screen.getByText('Ainda não há registros salvos.')).toBeOnTheScreen();
});
it('drops late errors and does not unlock a different pending operation after focus changes', async () => {
  let reject!: (error: Error) => void; let resolve!: (records: HistoryRecord[]) => void;
  remove.mockImplementationOnce(() => new Promise<HistoryRecord[]>((_, fail) => { reject = fail; }));
  remove.mockImplementationOnce(() => new Promise<HistoryRecord[]>(done => { resolve = done; }));
  const view = await mount(); await press('Excluir registro 1'); await press('Confirmar exclusão');
  mockFocused = false; view.rerender(<HistoryScreen onExit={jest.fn()} />);
  mockFocused = true; view.rerender(<HistoryScreen onExit={jest.fn()} />); await screen.findByText('Teste local');
  await press('Excluir registro 2'); await press('Confirmar exclusão');
  await act(async () => reject(new Error('old private error')));
  expect(screen.queryByRole('alert')).toBeNull(); expect(screen.getByRole('button', { name: 'Confirmar exclusão' })).toBeDisabled();
  await act(async () => resolve([rows[0]])); expect(screen.getByText('Exclusão concluída.')).toBeOnTheScreen();
});
it('requires human confirmation under StrictMode without starting destructive effects on rendering', async () => {
  render(<StrictMode><HistoryScreen onExit={jest.fn()} /></StrictMode>); await screen.findByText('Teste local');
  expect(remove).not.toHaveBeenCalled(); await press('Excluir todo o histórico'); await press('Confirmar exclusão');
  expect(remove).toHaveBeenCalledTimes(1);
});
it('does not issue deletion when storage becomes available only after unmount', async () => {
  const view = await mount(); await press('Excluir todo o histórico');
  let resolve!: (db: Awaited<ReturnType<typeof historyStorage>>) => void;
  jest.mocked(historyStorage).mockImplementationOnce(() => new Promise(done => { resolve = done; }));
  await press('Confirmar exclusão'); view.unmount();
  await act(async () => resolve({ save, list, remove })); expect(remove).not.toHaveBeenCalled();
});
it('brings a replaced confirmation back into view without waiting for another layout event', async () => {
  const scroll = jest.spyOn(ScrollView.prototype, 'scrollTo');
  try {
    await mount(); await press('Excluir registro 1');
    const heading = screen.getByRole('header', { name: 'Excluir este registro?' });
    fireEvent(heading.parent!, 'layout', { nativeEvent: { layout: { y: 260, x: 0, width: 300, height: 240 } } });
    scroll.mockClear(); await press('Excluir registro 2');
    expect(scroll).toHaveBeenCalledWith({ y: 260, animated: false }); expect(remove).not.toHaveBeenCalled();
  } finally { scroll.mockRestore(); }
});

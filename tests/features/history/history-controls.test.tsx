import { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { SaveHistoryButton } from '../../../src/features/history/SaveHistoryButton';
import { HistoryScreen } from '../../../src/features/history/HistoryScreen';
import { historyStorage } from '../../../src/features/history/history-storage';
import type { HistoryRecord } from '../../../src/features/history/history-model';

jest.mock('../../../src/features/history/history-storage', () => ({ historyStorage: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let mockFocused = true;
jest.mock('expo-router', () => ({ useFocusEffect: (callback: () => void | (() => void)) => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');
  const focused = mockFocused;
  useEffect(() => { if (focused) return callback(); }, [callback, focused]);
} }));
const save = jest.fn(); const list = jest.fn();
const content = { type: 'check-in', answers: { thirst: 'yes' } } as const;
const rows: HistoryRecord[] = [
  { type: 'routine', id: 'r', savedAt: 2000, name: 'Teste local', steps: 2 },
  { ...content, id: 'c', savedAt: 1000 },
];
beforeEach(() => {
  jest.clearAllMocks(); mockFocused = true;
  save.mockReset().mockResolvedValue(undefined); list.mockReset().mockResolvedValue(rows);
  jest.mocked(historyStorage).mockResolvedValue({ save, list, remove: jest.fn() });
});
function callback(name = 'Salvar no histórico'): () => void {
  let node = screen.getByRole('button', { name });
  while (node.parent && typeof node.props.onPress !== 'function') node = node.parent;
  return node.props.onPress as () => void;
}
async function press(name = 'Salvar no histórico') { await act(async () => fireEvent.press(screen.getByRole('button', { name }))); }
it('opens no storage by rendering, saves only on choice and blocks duplicate and old successful callbacks', async () => {
  render(<StrictMode><SaveHistoryButton content={content} /></StrictMode>);
  expect(historyStorage).not.toHaveBeenCalled();
  const old = callback(); await act(async () => { old(); old(); });
  expect(save).toHaveBeenCalledTimes(1); expect(save.mock.calls[0][0]).toMatchObject(content);
  expect(screen.getByText('Salvo no histórico.')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Salvar no histórico' })).toBeDisabled();
  await act(async () => old()); expect(save).toHaveBeenCalledTimes(1);
});
it('keeps the same intent on retry, hides errors and never reports failed writes as saved', async () => {
  save.mockRejectedValueOnce(new Error('private synthetic detail'));
  render(<SaveHistoryButton content={content} />); await press();
  expect(screen.queryByText('Salvo no histórico.')).toBeNull();
  expect(screen.queryByText('private synthetic detail')).toBeNull();
  expect(screen.getByRole('alert')).toHaveTextContent(/Não foi possível salvar/);
  const first = save.mock.calls[0][0]; await press();
  expect(save.mock.calls[1][0]).toEqual(first); expect(screen.getByText('Salvo no histórico.')).toBeOnTheScreen();
});
it('ignores commands captured before unmount and before blur/refocus', async () => {
  const view = render(<SaveHistoryButton content={content} />); const old = callback();
  mockFocused = false; view.rerender(<SaveHistoryButton content={content} />);
  mockFocused = true; view.rerender(<SaveHistoryButton content={content} />);
  await act(async () => old()); expect(historyStorage).not.toHaveBeenCalled();
  const another = callback(); view.unmount(); await act(async () => another());
  expect(historyStorage).not.toHaveBeenCalled();
});
it('does not authorize a write if opening completes only after leaving', async () => {
  let resolve!: (db: Awaited<ReturnType<typeof historyStorage>>) => void;
  jest.mocked(historyStorage).mockImplementationOnce(() => new Promise(done => { resolve = done; }));
  const view = render(<SaveHistoryButton content={content} />); await press(); view.unmount();
  await act(async () => resolve({ save, list, remove: jest.fn() })); expect(save).not.toHaveBeenCalled();
});
it('preserves a pending authorized write across focus changes without duplicate save or stuck controls', async () => {
  let resolve!: () => void; save.mockImplementationOnce(() => new Promise<void>(done => { resolve = done; }));
  const view = render(<SaveHistoryButton content={content} />); await press(); const old = callback();
  mockFocused = false; view.rerender(<SaveHistoryButton content={content} />);
  mockFocused = true; view.rerender(<SaveHistoryButton content={content} />);
  expect(screen.getByRole('button', { name: 'Salvar no histórico' })).toBeDisabled();
  await act(async () => { old(); resolve(); });
  expect(save).toHaveBeenCalledTimes(1); expect(screen.getByText('Salvo no histórico.')).toBeOnTheScreen();
});
it('lists snapshots, filters both types and renders supplied answers without clinical inference', async () => {
  render(<HistoryScreen onExit={jest.fn()} />); await screen.findByText('Teste local');
  expect(screen.getByLabelText('Você está com sede? Sim')).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('radio', { name: 'Rotinas concluídas' }));
  expect(screen.getByText('Teste local')).toBeOnTheScreen(); expect(screen.queryByText('Você está com sede?')).toBeNull();
  fireEvent.press(screen.getByRole('radio', { name: 'Check-ins' }));
  expect(screen.getByLabelText('Você está com sede? Sim')).toBeOnTheScreen(); expect(screen.queryByText('Teste local')).toBeNull();
  expect(screen.getByText('Estes registros não são um diagnóstico.')).toBeOnTheScreen();
});
it('handles empty history and empty filter separately', async () => {
  list.mockResolvedValueOnce([]); const view = render(<HistoryScreen onExit={jest.fn()} />);
  await screen.findByText('Ainda não há registros salvos.'); view.unmount();
  list.mockResolvedValueOnce([rows[0]]); render(<HistoryScreen onExit={jest.fn()} />); await screen.findByText('Teste local');
  fireEvent.press(screen.getByRole('radio', { name: 'Check-ins' }));
  expect(screen.getByText('Nenhum registro deste tipo.')).toBeOnTheScreen();
});
it('allows loading failure retry without exposing storage details', async () => {
  list.mockRejectedValueOnce(new Error('private synthetic detail'));
  render(<HistoryScreen onExit={jest.fn()} />); await screen.findByRole('alert');
  expect(screen.queryByText('private synthetic detail')).toBeNull();
  await press('Tentar abrir histórico novamente'); await screen.findByText('Teste local');
});
it('ignores a late list and old navigation after returning to a new focus', async () => {
  let resolve!: (value: HistoryRecord[]) => void;
  list.mockImplementationOnce(() => new Promise<HistoryRecord[]>(done => { resolve = done; }));
  const exit = jest.fn(); const view = render(<HistoryScreen onExit={exit} />);
  await act(async () => {}); const old = callback('Voltar ao quadro');
  mockFocused = false; view.rerender(<HistoryScreen onExit={exit} />);
  mockFocused = true; view.rerender(<HistoryScreen onExit={exit} />);
  await screen.findByText('Teste local');
  await act(async () => { resolve([]); old(); });
  expect(screen.getByText('Teste local')).toBeOnTheScreen(); expect(exit).not.toHaveBeenCalled();
});

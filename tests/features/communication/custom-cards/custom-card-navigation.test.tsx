/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { act, waitFor } from '@testing-library/react-native';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { Slot, router } from 'expo-router';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { Text } from 'react-native';
import NewCardScreen from '../../../../src/app/custom-card/new';
import EditCardScreen from '../../../../src/app/custom-card/[id]';
import { SentenceProvider } from '../../../../src/features/communication/sentence/SentenceProvider';
import { CustomCardsProvider } from '../../../../src/features/communication/custom-cards/CustomCardsProvider';
import { openCardDatabase } from '../../../../src/features/communication/storage/card-database';

jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
jest.mock('../../../../src/features/communication/custom-cards/local-image-storage', () => ({
  localImages: { copy: jest.fn(), remove: jest.fn(), prune: async () => {} },
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let directory: string, sql: DatabaseSync, connections: DatabaseSync[], writes: number;
let gate: Promise<void> | null, release: () => void, waiting: boolean, committed: boolean;
function Layout() { return <SentenceProvider><CustomCardsProvider><Slot /></CustomCardsProvider></SentenceProvider>; }
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'tear-card-navigation-'));
  connections = []; writes = 0; gate = null; waiting = false; committed = false;
  jest.mocked(openDatabaseAsync).mockImplementation(async name => {
    expect(name).toBe('tear.db');
    const connection = new DatabaseSync(join(directory, name)); sql = connection; connections.push(connection);
    const adapter = {
      execAsync: async (statement: string) => { connection.exec(statement); },
      runAsync: async (statement: string, ...params: (string | number | null)[]) => {
        writes += 1; return connection.prepare(statement).run(...params);
      },
      getAllAsync: async (statement: string, ...params: (string | number | null)[]) => connection.prepare(statement).all(...params),
      closeAsync: async () => connection.close(),
      withExclusiveTransactionAsync: async (operation: (tx: SQLiteDatabase) => Promise<void>) => {
        connection.exec('BEGIN');
        try {
          await operation(adapter as unknown as SQLiteDatabase);
          if (gate) { waiting = true; await gate; }
          connection.exec('COMMIT'); committed = true;
        } catch (error) { connection.exec('ROLLBACK'); throw error; }
      },
    };
    return adapter as unknown as SQLiteDatabase;
  });
});
afterEach(() => { for (const connection of connections) connection.close(); rmSync(directory, { recursive: true, force: true }); });
function callback(name: string): () => void {
  let node = screen.getByRole('button', { name });
  while (node.parent && typeof node.props.onPress !== 'function') node = node.parent;
  expect(typeof node.props.onPress).toBe('function'); return node.props.onPress as () => void;
}
async function start(id?: string) {
  const view = renderRouter({ _layout: Layout, 'custom-card/new': NewCardScreen, 'custom-card/[id]': EditCardScreen,
    outside: () => <Text>Outra tela</Text>, index: () => <Text>Início</Text> },
  { initialUrl: id ? `/custom-card/${id}` : '/custom-card/new' });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar cartão' })).toBeEnabled());
  if (!id) {
    fireEvent.changeText(screen.getByLabelText('Título do cartão'), 'Cartão local');
    fireEvent.press(screen.getByRole('radio', { name: 'Necessidades' }));
  }
  writes = 0; committed = false;
  return view;
}
async function pendingSave() {
  const view = await start(); gate = new Promise<void>(resolve => { release = resolve; });
  fireEvent.press(screen.getByRole('button', { name: 'Salvar cartão' }));
  await waitFor(() => expect(waiting).toBe(true)); return view;
}
it('retains the authorized SQLite commit after replacement without late navigation', async () => {
  const view = await pendingSave();
  await act(async () => router.replace('/outside')); await screen.findByText('Outra tela');
  await act(async () => release()); await waitFor(() => expect(committed).toBe(true));
  expect(view.getPathname()).toBe('/outside');
  expect(sql.prepare("SELECT title FROM cards WHERE origin = 'custom'").all()).toEqual([{ title: 'Cartão local' }]);
});
it('does not revive a pending completion after real Router blur and return', async () => {
  const view = await pendingSave();
  await act(async () => router.push('/outside')); await screen.findByText('Outra tela');
  await act(async () => router.back()); await screen.findByLabelText('Título do cartão');
  await act(async () => release()); await waitFor(() => expect(committed).toBe(true));
  expect(view.getPathname()).toBe('/custom-card/new');
  expect(sql.prepare("SELECT title FROM cards WHERE origin = 'custom'").all()).toEqual([{ title: 'Cartão local' }]);
});
it('does not create a SQLite card through a callback discarded by real Router', async () => {
  await start(); const oldSave = callback('Salvar cartão');
  await act(async () => router.replace('/outside')); await screen.findByText('Outra tela');
  await act(async () => oldSave()); expect(writes).toBe(0);
  expect(sql.prepare("SELECT id FROM cards WHERE origin = 'custom'").all()).toEqual([]);
});
it('preserves the SQLite card and favorite after deletion confirmation is revoked', async () => {
  const db = await openCardDatabase();
  const [card] = await db.save({ title: 'Cartão local', categoryId: 'needs', imageUri: null });
  await db.setFavorite(card.id, true);
  await start(card.id); fireEvent.press(screen.getByRole('button', { name: 'Excluir cartão' }));
  const oldConfirm = callback('Confirmar exclusão');
  fireEvent.press(screen.getByRole('button', { name: 'Manter cartão' }));
  await act(async () => oldConfirm()); expect(writes).toBe(0);
  expect(sql.prepare('SELECT id FROM cards WHERE id = ?').all(card.id)).toEqual([{ id: card.id }]);
  expect(sql.prepare('SELECT card_id FROM favorites').all()).toEqual([{ card_id: card.id }]);
});

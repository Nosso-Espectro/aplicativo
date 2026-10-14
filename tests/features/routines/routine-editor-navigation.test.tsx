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
import NewRoutineScreen from '../../../src/app/routines/new';
import PlayRoutineScreen from '../../../src/app/routines/play/[id]';
import { RoutineProvider } from '../../../src/features/routines/RoutineProvider';
import { openRoutineDatabase } from '../../../src/features/routines/routine-database';

jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
jest.mock('../../../src/features/communication/custom-cards/local-image-storage', () => ({
  isLocalImage: (uri: string) => uri.startsWith('file://'),
  createLocalImageStorage: () => ({ copy: jest.fn(), remove: jest.fn(), prune: async () => {} }),
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let directory: string;
let sql: DatabaseSync;
let connections: DatabaseSync[];
let writes: number;
let gate: Promise<void> | null;
let release: () => void;
let waiting: boolean;
let committed: boolean;
function Layout() { return <RoutineProvider><Slot /></RoutineProvider>; }
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'tear-routine-navigation-'));
  gate = null; waiting = false; committed = false; connections = []; writes = 0;
  jest.mocked(openDatabaseAsync).mockImplementation(async name => {
    expect(name).toBe('tear-routines.db');
    const connection = new DatabaseSync(join(directory, name)); sql = connection; connections.push(connection);
    let written = false;
    const adapter = {
      execAsync: async (statement: string) => { connection.exec(statement); },
      runAsync: async (statement: string, ...params: (string | number | null)[]) => {
        written = true; writes += 1; return connection.prepare(statement).run(...params);
      },
      getAllAsync: async (statement: string, ...params: (string | number | null)[]) => connection.prepare(statement).all(...params),
      closeAsync: async () => connection.close(),
      withExclusiveTransactionAsync: async (operation: (tx: SQLiteDatabase) => Promise<void>) => {
        connection.exec('BEGIN'); written = false;
        try {
          await operation(adapter as unknown as SQLiteDatabase);
          if (written && gate) { waiting = true; await gate; }
          connection.exec('COMMIT'); if (written) committed = true;
        } catch (error) { connection.exec('ROLLBACK'); throw error; }
      },
    };
    return adapter as unknown as SQLiteDatabase;
  });
});
afterEach(() => {
  for (const connection of connections) connection.close();
  rmSync(directory, { recursive: true, force: true });
});
async function startSave() {
  const view = renderRouter({ _layout: Layout, 'routines/new': NewRoutineScreen, outside: () => <Text>Outra tela</Text> },
    { initialUrl: '/routines/new' });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar rotina' })).toBeEnabled());
  gate = new Promise<void>(resolve => { release = resolve; });
  fireEvent.changeText(screen.getByLabelText('Nome da rotina'), 'Teste local');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar rotina' }));
  await waitFor(() => expect(waiting).toBe(true));
  return view;
}
it('commits an authorized SQLite save without navigating away from a later route', async () => {
  const view = await startSave();
  await act(async () => router.replace('/outside'));
  await screen.findByText('Outra tela');
  await act(async () => release());
  await waitFor(() => expect(committed).toBe(true));
  expect(view.getPathname()).toBe('/outside');
  expect(sql.prepare('SELECT name FROM routines').all()).toEqual([{ name: 'Teste local' }]);
});
it('does not revive a completion after the real Router blurs and refocuses the editor', async () => {
  const view = await startSave();
  await act(async () => router.push('/outside'));
  await screen.findByText('Outra tela');
  await act(async () => router.back());
  await screen.findByLabelText('Nome da rotina');
  await act(async () => release());
  await waitFor(() => expect(committed).toBe(true));
  expect(view.getPathname()).toBe('/routines/new');
  expect(sql.prepare('SELECT name FROM routines').all()).toEqual([{ name: 'Teste local' }]);
});
function commandCallback(name: string): () => void {
  let node = screen.getByRole('button', { name });
  while (node.parent && typeof node.props.onPress !== 'function') node = node.parent;
  expect(typeof node.props.onPress).toBe('function'); return node.props.onPress as () => void;
}
async function startPlayer(completed = false) {
  const db = await openRoutineDatabase();
  const [routine] = await db.save({ name: 'Teste local', steps: [{ id: 'a', title: 'Etapa local', imageUri: null }] });
  if (completed) await db.progress(routine.id, 'complete', 'a');
  writes = 0; committed = false;
  const view = renderRouter({ _layout: Layout, 'routines/play/[id]': PlayRoutineScreen, outside: () => <Text>Outra tela</Text> },
    { initialUrl: `/routines/play/${routine.id}` });
  await screen.findByText(completed ? 'Rotina concluída' : 'Etapa local');
  return { view, id: routine.id };
}
it('does not change SQLite progress through a discarded player callback', async () => {
  await startPlayer();
  const oldComplete = commandCallback('Concluir etapa atual');
  await act(async () => router.replace('/outside')); await screen.findByText('Outra tela');
  await act(async () => oldComplete());
  expect(writes).toBe(0);
  expect(sql.prepare('SELECT completed FROM routine_steps').all()).toEqual([{ completed: 0 }]);
});
it('keeps SQLite progress completed when a captured restart confirmation was cancelled', async () => {
  await startPlayer(true);
  fireEvent.press(screen.getByRole('button', { name: 'Reiniciar rotina' }));
  const oldConfirm = commandCallback('Confirmar reinício');
  fireEvent.press(screen.getByRole('button', { name: 'Manter rotina concluída' }));
  await act(async () => oldConfirm());
  expect(writes).toBe(0);
  expect(sql.prepare('SELECT completed FROM routine_steps').all()).toEqual([{ completed: 1 }]);
});
it('preserves authorized progress commit after Router blur without publishing an old error', async () => {
  const { view, id } = await startPlayer();
  gate = new Promise<void>(resolve => { release = resolve; });
  fireEvent.press(screen.getByRole('button', { name: 'Concluir etapa atual' }));
  await waitFor(() => expect(waiting).toBe(true));
  await act(async () => router.push('/outside')); await screen.findByText('Outra tela');
  await act(async () => router.back());
  await screen.findByText('Etapa local');
  await act(async () => release());
  await screen.findByText('Rotina concluída');
  expect(view.getPathname()).toBe(`/routines/play/${id}`);
  expect(sql.prepare('SELECT completed FROM routine_steps').all()).toEqual([{ completed: 1 }]);
  expect(screen.queryByText(/último progresso salvo foi mantido/)).toBeNull();
});

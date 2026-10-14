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
import { RoutineProvider } from '../../../src/features/routines/RoutineProvider';

jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
jest.mock('../../../src/features/communication/custom-cards/local-image-storage', () => ({
  isLocalImage: (uri: string) => uri.startsWith('file://'),
  createLocalImageStorage: () => ({ copy: jest.fn(), remove: jest.fn(), prune: async () => {} }),
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let directory: string;
let sql: DatabaseSync;
let gate: Promise<void> | null;
let release: () => void;
let waiting: boolean;
let committed: boolean;
function Layout() { return <RoutineProvider><Slot /></RoutineProvider>; }
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'tear-routine-navigation-'));
  gate = null; waiting = false; committed = false;
  jest.mocked(openDatabaseAsync).mockImplementation(async name => {
    expect(name).toBe('tear-routines.db'); sql = new DatabaseSync(join(directory, name));
    let written = false;
    const adapter = {
      execAsync: async (statement: string) => { sql.exec(statement); },
      runAsync: async (statement: string, ...params: (string | number | null)[]) => {
        written = true; return sql.prepare(statement).run(...params);
      },
      getAllAsync: async (statement: string, ...params: (string | number | null)[]) => sql.prepare(statement).all(...params),
      closeAsync: async () => sql.close(),
      withExclusiveTransactionAsync: async (operation: (tx: SQLiteDatabase) => Promise<void>) => {
        sql.exec('BEGIN'); written = false;
        try {
          await operation(adapter as unknown as SQLiteDatabase);
          if (written && gate) { waiting = true; await gate; }
          sql.exec('COMMIT'); if (written) committed = true;
        } catch (error) { sql.exec('ROLLBACK'); throw error; }
      },
    };
    return adapter as unknown as SQLiteDatabase;
  });
});
afterEach(() => {
  sql?.close(); rmSync(directory, { recursive: true, force: true });
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

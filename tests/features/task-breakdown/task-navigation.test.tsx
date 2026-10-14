/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { act, render, waitFor } from '@testing-library/react-native';
import { useEffect } from 'react';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { Slot } from 'expo-router';
import { AccessibilityInfo, Text } from 'react-native';
import { TaskProvider, useTasks } from '../../../src/features/task-breakdown/TaskProvider';
import { openTaskWorkspaceDatabase } from '../../../src/features/task-breakdown/task-database';
import TasksLayout from '../../../src/app/tasks/_layout';
import List from '../../../src/app/tasks';
import New from '../../../src/app/tasks/new';
import Detail from '../../../src/app/tasks/[id]';
import Edit from '../../../src/app/tasks/edit/[id]';
import StartupScreen from '../../../src/app';
import { SentenceProvider } from '../../../src/features/communication/sentence/SentenceProvider';
import { CustomCardsProvider } from '../../../src/features/communication/custom-cards/CustomCardsProvider';
import { LowStimulationProvider } from '../../../src/features/regulation/LowStimulationProvider';
import { LowStimulationControl } from '../../../src/features/regulation/LowStimulationControl';
import { openCardDatabase } from '../../../src/features/communication/storage/card-database';
import { openDisplayPreferencesDatabase } from '../../../src/features/regulation/display-preferences-database';
import { localSpeech } from '../../../src/features/communication/speech/local-speech';
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
jest.mock('../../../src/features/communication/storage/card-database', () => ({ openCardDatabase: jest.fn() }));
jest.mock('../../../src/features/regulation/display-preferences-database', () => ({ openDisplayPreferencesDatabase: jest.fn() }));
jest.mock('../../../src/features/communication/custom-cards/local-image-storage', () => ({ localImages: { prune: jest.fn() } }));
jest.mock('../../../src/features/communication/speech/local-speech', () => ({ localSpeech: { isAvailable: jest.fn(), speak: jest.fn(), stop: jest.fn() } }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let directory: string; let connections: DatabaseSync[]; let failCommit: boolean;
let holdCommit: Promise<void> | null; let releaseCommit: () => void;
function GlobalLayout() {
  return <LowStimulationProvider><LowStimulationControl /><SentenceProvider><CustomCardsProvider><Slot /></CustomCardsProvider></SentenceProvider></LowStimulationProvider>;
}
const routes = { _layout: GlobalLayout, index: StartupScreen, 'tasks/_layout': TasksLayout, 'tasks/index': List,
  'tasks/new': New, 'tasks/[id]': Detail, 'tasks/edit/[id]': Edit };
beforeEach(() => {
  jest.clearAllMocks(); directory = mkdtempSync(join(tmpdir(), 'tear-task-flow-')); connections = [];
  failCommit = false; holdCommit = null;
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  jest.mocked(openCardDatabase).mockResolvedValue({ list: async () => [], listFavorites: async () => [], setFavorite: jest.fn(), save: jest.fn(), remove: jest.fn() });
  jest.mocked(openDisplayPreferencesDatabase).mockResolvedValue({ read: async () => ({ enabled: false }), save: async value => ({ ...value }) });
  jest.mocked(openDatabaseAsync).mockImplementation(async name => {
    expect(name).toBe('tear-task-breakdown.db');
    const sql = new DatabaseSync(join(directory, name)); connections.push(sql); let written = false;
    const adapter = {
      execAsync: async (statement: string) => { sql.exec(statement); },
      runAsync: async (statement: string, ...params: (string | number | null)[]) => { written = true; return sql.prepare(statement).run(...params); },
      getAllAsync: async (statement: string) => sql.prepare(statement).all(), closeAsync: async () => sql.close(),
      withExclusiveTransactionAsync: async (operation: (tx: SQLiteDatabase) => Promise<void>) => {
        sql.exec('BEGIN'); written = false;
        try {
          await operation(adapter as unknown as SQLiteDatabase);
          if (written && holdCommit) await holdCommit;
          if (written && failCommit) throw new Error('synthetic private failure'); sql.exec('COMMIT');
        } catch (error) { sql.exec('ROLLBACK'); throw error; }
      },
    }; return adapter as unknown as SQLiteDatabase;
  });
});
afterEach(() => {
  for (const db of connections) { try { db.close(); } catch {} }
  rmSync(directory, { recursive: true, force: true }); jest.restoreAllMocks();
});
async function press(name: string) { await act(async () => fireEvent.press(screen.getByRole('button', { name }))); }
async function newTask(title: string, steps: string[] = []) {
  await screen.findByText('Tarefas'); await press('Nova tarefa');
  fireEvent.changeText(screen.getByLabelText('Título da tarefa'), title);
  for (const [index, step] of steps.entries()) { await press('Adicionar etapa'); fireEvent.changeText(screen.getByLabelText(`Título da etapa ${index + 1}`), step); }
  await press('Salvar tarefa'); await screen.findByRole('button', { name: `Abrir tarefa: ${title}` });
}
it('opens from the real board, creates, edits, orders and restores manual progress offline', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  const view = renderRouter(routes, { initialUrl: '/' });
  await press('Abrir tarefas'); await screen.findByText('Ainda não há tarefas salvas.');
  await newTask('Tarefa sintética', ['Uma', 'Duas']); await press('Abrir tarefa: Tarefa sintética');
  await act(async () => fireEvent.press(screen.getByRole('checkbox', { name: 'Etapa 1: Uma' })));
  await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Etapa 1: Uma' })).toBeChecked());
  await press('Editar tarefa'); await press('Descer etapa 1'); await press('Salvar tarefa');
  await screen.findByRole('checkbox', { name: 'Etapa 2: Uma' });
  expect(screen.getByRole('checkbox', { name: 'Etapa 2: Uma' })).toBeChecked();
  expect(screen.getByText('1 de 2 etapas concluídas (50%).')).toBeOnTheScreen();
  await press('Voltar às tarefas'); await press('Voltar ao quadro');
  expect(screen.getByRole('button', { name: 'Abrir rotinas' })).toBeOnTheScreen();
  view.unmount(); for (const db of connections) db.close(); connections = [];
  renderRouter(routes, { initialUrl: '/tasks' });
  await screen.findByRole('button', { name: 'Abrir tarefa: Tarefa sintética' }); await press('Abrir tarefa: Tarefa sintética');
  expect(screen.getByRole('checkbox', { name: 'Etapa 2: Uma' })).toBeChecked();
  await act(async () => fireEvent.press(screen.getByRole('checkbox', { name: 'Etapa 2: Uma' })));
  await screen.findByText('0 de 2 etapas concluídas (0%).'); expect(fetch).not.toHaveBeenCalled();
  expect(localSpeech.speak).not.toHaveBeenCalled();
});
it('keeps empty tasks at zero and removes only a confirmed task, preserving others', async () => {
  renderRouter(routes, { initialUrl: '/tasks' }); await screen.findByText('Ainda não há tarefas salvas.');
  await newTask('Vazia'); expect(screen.getByText('0 de 0 etapas concluídas (0%).')).toBeOnTheScreen();
  await newTask('Outra', ['Etapa']); await press('Abrir tarefa: Vazia');
  await press('Remover tarefa'); await press('Manter tarefa'); expect(screen.queryByRole('button', { name: 'Confirmar remoção da tarefa' })).toBeNull();
  await press('Remover tarefa'); await press('Confirmar remoção da tarefa');
  await screen.findByRole('button', { name: 'Abrir tarefa: Outra' }); expect(screen.queryByRole('button', { name: 'Abrir tarefa: Vazia' })).toBeNull();
});
it('keeps checkbox and deletion unconfirmed on rollback and permits explicit retry', async () => {
  renderRouter(routes, { initialUrl: '/tasks' }); await screen.findByText('Ainda não há tarefas salvas.');
  await newTask('Teste', ['Etapa']); await press('Abrir tarefa: Teste'); failCommit = true;
  await act(async () => fireEvent.press(screen.getByRole('checkbox', { name: 'Etapa 1: Etapa' })));
  await screen.findByText(/Os dados salvos foram mantidos/); expect(screen.getByRole('checkbox', { name: 'Etapa 1: Etapa' })).not.toBeChecked();
  await press('Remover tarefa'); await press('Confirmar remoção da tarefa');
  await screen.findByText(/Os dados salvos foram mantidos/); expect(screen.getByRole('button', { name: 'Confirmar remoção da tarefa' })).toBeEnabled();
  expect(screen.queryByText('synthetic private failure')).toBeNull(); failCommit = false;
  await press('Confirmar remoção da tarefa'); await screen.findByText('Ainda não há tarefas salvas.');
});
it('does not show pending checkbox progress or accept duplicates before the transaction commits', async () => {
  renderRouter(routes, { initialUrl: '/tasks' }); await screen.findByText('Ainda não há tarefas salvas.');
  await newTask('Teste', ['Etapa']); await press('Abrir tarefa: Teste');
  holdCommit = new Promise(resolve => { releaseCommit = resolve; });
  await act(async () => fireEvent.press(screen.getByRole('checkbox', { name: 'Etapa 1: Etapa' })));
  const checkbox = screen.getByRole('checkbox', { name: 'Etapa 1: Etapa' });
  expect(checkbox).not.toBeChecked(); expect(checkbox).toBeDisabled(); fireEvent.press(checkbox);
  await act(async () => { holdCommit = null; releaseCommit(); });
  await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Etapa 1: Etapa' })).toBeChecked());
  expect(connections[0].prepare('SELECT revision FROM tasks').get()).toMatchObject({ revision: 2 });
});
it('keeps board access and generic retry available when opening storage fails', async () => {
  jest.mocked(openDatabaseAsync).mockRejectedValueOnce(new Error('private path'));
  const view = renderRouter(routes, { initialUrl: '/tasks' });
  await screen.findByRole('button', { name: 'Tentar abrir tarefas novamente' }); expect(screen.queryByText('private path')).toBeNull();
  await press('Tentar abrir tarefas novamente'); await screen.findByText('Ainda não há tarefas salvas.');
  await press('Voltar ao quadro'); expect(view.getPathname()).toBe('/');
});
it('offers real fallback routes for an absent task and keeps global low stimulation unchanged', async () => {
  const view = renderRouter(routes, { initialUrl: '/tasks/edit/missing' }); await screen.findByText('Tarefa não encontrada.');
  await press('Voltar às tarefas'); await screen.findByText('Ainda não há tarefas salvas.');
  const toggle = screen.getByRole('switch', { name: 'Modo de baixa estimulação' });
  await act(async () => fireEvent(toggle, 'valueChange', true)); await waitFor(() => expect(toggle).toBeChecked());
  await newTask('Teste'); await press('Abrir tarefa: Teste'); await press('Editar tarefa');
  fireEvent.changeText(screen.getByLabelText('Título da tarefa'), 'Draft'); await press('Cancelar');
  expect(screen.getByRole('header', { name: 'Teste' })).toBeOnTheScreen();
  expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked();
  await press('Voltar às tarefas'); await press('Voltar ao quadro'); expect(view.getPathname()).toBe('/');
  expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked();
});
let workspaceContext: ReturnType<typeof useTasks>;
function WorkspaceProbe() {
  const context = useTasks(); useEffect(() => { workspaceContext = context; }, [context]);
  return <Text>{context.loading ? 'Abrindo workspace' : `Estado:${context.tasks.length}/${context.templates.length}`}</Text>;
}
async function openWorkspaceProbe() {
  const db = await openTaskWorkspaceDatabase();
  await db.save({ title: 'Sintética', steps: [{ id: 'source', title: 'Etapa', completed: true }] });
  const view = render(<TaskProvider><WorkspaceProbe /></TaskProvider>); await screen.findByText('Estado:1/0'); return view;
}
it('coordinates actual SQLite template creation, copying, editing and deletion without changing existing instances', async () => {
  await openWorkspaceProbe(); const source = workspaceContext.tasks[0];
  await act(async () => { expect(await workspaceContext.createTemplate(source)).toBe(true); });
  const original = workspaceContext.templates[0];
  let copiedId: string | undefined;
  await act(async () => { copiedId = (await workspaceContext.createTaskFromTemplate(original))?.id; });
  expect(copiedId).toBeDefined(); expect(workspaceContext.tasks[1].steps[0].completed).toBe(false);
  expect(workspaceContext.tasks[0]).toEqual(source);
  const copy = workspaceContext.tasks[1];
  await act(async () => { expect(await workspaceContext.saveTemplate({ ...original, title: 'Modelo editado', steps: [] }, original)).toBe(true); });
  expect(workspaceContext.tasks[1]).toEqual(copy);
  await act(async () => { expect(await workspaceContext.removeTemplate(workspaceContext.templates[0])).toBe(true); });
  expect(workspaceContext.templates).toEqual([]); expect(workspaceContext.tasks).toEqual([source, copy]);
});
it('preserves confirmed workspace on rollback and blocks duplicate model operations until commit', async () => {
  await openWorkspaceProbe(); const source = workspaceContext.tasks[0];
  holdCommit = new Promise(resolve => { releaseCommit = resolve; });
  let saving!: Promise<boolean>;
  await act(async () => { saving = workspaceContext.createTemplate(source); });
  expect(workspaceContext.templates).toEqual([]); expect(workspaceContext.busy).toBe(true);
  await act(async () => { expect(await workspaceContext.createTemplate(source)).toBe(false); });
  failCommit = true;
  await act(async () => { holdCommit = null; releaseCommit(); await expect(saving).rejects.toThrow('Task change unavailable.'); });
  expect(workspaceContext.templates).toEqual([]); expect(workspaceContext.tasks).toEqual([source]);
  failCommit = false; await act(async () => { expect(await workspaceContext.createTemplate(source)).toBe(true); });
  expect(workspaceContext.templates).toHaveLength(1);
});
it('does not publish a copied task or return navigation data after provider unmount while commit is pending', async () => {
  const view = await openWorkspaceProbe();
  await act(async () => { await workspaceContext.createTemplate(workspaceContext.tasks[0]); });
  holdCommit = new Promise(resolve => { releaseCommit = resolve; });
  let copying!: ReturnType<typeof workspaceContext.createTaskFromTemplate>;
  await act(async () => { copying = workspaceContext.createTaskFromTemplate(workspaceContext.templates[0]); });
  expect(workspaceContext.tasks).toHaveLength(1); view.unmount();
  await act(async () => { holdCommit = null; releaseCommit(); expect(await copying).toBeNull(); });
  expect((await (await openTaskWorkspaceDatabase()).readWorkspace()).tasks).toHaveLength(2);
});
it('refuses copies and edits from deleted model snapshots without resurrecting them', async () => {
  await openWorkspaceProbe();
  await act(async () => { await workspaceContext.createTemplate(workspaceContext.tasks[0]); });
  const removed = workspaceContext.templates[0];
  await act(async () => { await workspaceContext.removeTemplate(removed); });
  await act(async () => {
    await expect(workspaceContext.createTaskFromTemplate(removed)).rejects.toThrow('Task change unavailable.');
    await expect(workspaceContext.saveTemplate(removed, removed)).rejects.toThrow('Task change unavailable.');
  });
  expect(workspaceContext.tasks).toHaveLength(1); expect(workspaceContext.templates).toEqual([]);
});
it('returns the exact committed copy rather than another task added through a different connection', async () => {
  await openWorkspaceProbe();
  await act(async () => { await workspaceContext.createTemplate(workspaceContext.tasks[0]); });
  const external = await openTaskWorkspaceDatabase(); await external.save({ title: 'Outra conexão', steps: [] });
  expect(workspaceContext.tasks).toHaveLength(1);
  await act(async () => {
    const copied = await workspaceContext.createTaskFromTemplate(workspaceContext.templates[0]);
    expect(copied?.title).toBe('Sintética'); expect(copied?.steps).toHaveLength(1);
  });
  expect(workspaceContext.tasks).toHaveLength(3);
});

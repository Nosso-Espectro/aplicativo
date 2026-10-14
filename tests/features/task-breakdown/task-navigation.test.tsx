/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { act, render, waitFor } from '@testing-library/react-native';
import { useEffect } from 'react';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { Slot, router } from 'expo-router';
import { AccessibilityInfo, BackHandler, Text } from 'react-native';
import { TaskProvider, useTasks } from '../../../src/features/task-breakdown/TaskProvider';
import { openTaskWorkspaceDatabase } from '../../../src/features/task-breakdown/task-database';
import TasksLayout from '../../../src/app/tasks/_layout';
import List from '../../../src/app/tasks';
import New from '../../../src/app/tasks/new';
import Detail from '../../../src/app/tasks/[id]';
import Edit from '../../../src/app/tasks/edit/[id]';
import Templates from '../../../src/app/tasks/templates';
import Template from '../../../src/app/tasks/templates/[id]';
import EditTemplate from '../../../src/app/tasks/templates/edit/[id]';
import Catalog from '../../../src/app/tasks/catalog';
import CatalogEditor from '../../../src/app/tasks/catalog/new/[id]';
import { CommonTaskCatalogScreen } from '../../../src/features/task-breakdown/CommonTaskCatalogScreen';
import { commonTaskDraft } from '../../../src/features/task-breakdown/common-task-catalog';
import { TaskEditor } from '../../../src/features/task-breakdown/TaskEditor';
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
  'tasks/new': New, 'tasks/[id]': Detail, 'tasks/edit/[id]': Edit,
  'tasks/templates/index': Templates, 'tasks/templates/[id]': Template, 'tasks/templates/edit/[id]': EditTemplate,
  'tasks/catalog/index': Catalog, 'tasks/catalog/new/[id]': CatalogEditor };
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
async function press(name: string) {
  if (!screen.queryByRole('button', { name }) && screen.queryByRole('button', { name: 'Abrir ferramentas' })) {
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Abrir ferramentas' })));
  }
  await act(async () => fireEvent.press(screen.getByRole('button', { name })));
}
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
  expect(screen.getByRole('button', { name: 'Abrir ferramentas' })).toBeOnTheScreen();
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
it('saves an actual task as a model, copies without progress, edits the copy independently and removes only the model', async () => {
  renderRouter(routes, { initialUrl: '/tasks' }); await screen.findByText('Ainda não há tarefas salvas.');
  await newTask('Original', ['Uma', 'Duas']); await press('Abrir tarefa: Original');
  await act(async () => fireEvent.press(screen.getByRole('checkbox', { name: 'Etapa 1: Uma' })));
  await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Etapa 1: Uma' })).toBeChecked());
  await press('Salvar como modelo'); await screen.findByRole('button', { name: 'Abrir modelo: Original' });
  await press('Abrir modelo: Original'); expect(screen.queryByRole('checkbox')).toBeNull();
  await press('Criar tarefa deste modelo'); await screen.findByText('0 de 2 etapas concluídas (0%).');
  await press('Editar tarefa'); fireEvent.changeText(screen.getByLabelText('Título da tarefa'), 'Cópia');
  fireEvent.changeText(screen.getByLabelText('Título da etapa 1'), 'Só a cópia'); await press('Salvar tarefa');
  await screen.findByRole('header', { name: 'Cópia' }); await press('Voltar às tarefas'); await press('Modelos de tarefas');
  await press('Abrir modelo: Original'); expect(screen.getByText('1. Uma')).toBeOnTheScreen();
  await press('Remover modelo'); await press('Manter modelo'); await press('Remover modelo'); await press('Confirmar remoção do modelo');
  await screen.findByText('Ainda não há modelos salvos.'); await press('Voltar às tarefas');
  expect(screen.getByRole('button', { name: 'Abrir tarefa: Cópia' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Abrir tarefa: Original' })).toBeOnTheScreen();
  expect(connections[0].prepare('SELECT count(*) AS total FROM tasks').get()).toMatchObject({ total: 2 });
});
it('edits model drafts with order/removal/validation/cancel and preserves draft through rollback and retry', async () => {
  renderRouter(routes, { initialUrl: '/tasks' }); await screen.findByText('Ainda não há tarefas salvas.');
  await newTask('Original', ['Uma', 'Duas']); await press('Abrir tarefa: Original'); await press('Salvar como modelo');
  await press('Abrir modelo: Original'); await press('Editar modelo');
  expect(screen.queryByText('Não concluída')).toBeNull(); await press('Descer etapa 1'); await press('Cancelar');
  expect(screen.getByText('1. Uma')).toBeOnTheScreen(); await press('Editar modelo'); await press('Descer etapa 1');
  await press('Remover etapa 2'); await press('Confirmar remoção da etapa'); await press('Adicionar etapa');
  await press('Salvar modelo'); expect(screen.getByText('Informe o título de cada etapa.')).toBeOnTheScreen();
  fireEvent.changeText(screen.getByLabelText('Título da etapa 2'), 'Nova'); fireEvent.changeText(screen.getByLabelText('Título do modelo'), '');
  await press('Salvar modelo'); expect(screen.getByText('Informe o título do modelo.')).toBeOnTheScreen();
  fireEvent.changeText(screen.getByLabelText('Título do modelo'), 'Modelo editado'); failCommit = true; await press('Salvar modelo');
  await screen.findByText(/Seu preenchimento foi mantido/); expect(screen.getByLabelText('Título da etapa 1').props.value).toBe('Duas');
  failCommit = false; await press('Salvar modelo'); await screen.findByRole('header', { name: 'Modelo editado' });
  expect(screen.getByText('2. Nova')).toBeOnTheScreen(); await press('Voltar aos modelos'); await press('Voltar às tarefas');
  await press('Abrir tarefa: Original'); expect(screen.getByRole('checkbox', { name: 'Etapa 1: Uma' })).toBeOnTheScreen();
});
it('keeps save-as-model and copy pending without navigation or duplicates, then recovers generic failure', async () => {
  const view = renderRouter(routes, { initialUrl: '/tasks' }); await screen.findByText('Ainda não há tarefas salvas.');
  await newTask('Original', ['Etapa']); await press('Abrir tarefa: Original'); const detailPath = view.getPathname();
  failCommit = true; await press('Salvar como modelo'); await screen.findByText(/A tarefa foi mantida/); expect(view.getPathname()).toBe(detailPath);
  failCommit = false; holdCommit = new Promise(resolve => { releaseCommit = resolve; }); await press('Salvar como modelo');
  expect(view.getPathname()).toBe(detailPath); expect(screen.getByRole('button', { name: 'Salvar como modelo' })).toBeDisabled();
  await press('Salvar como modelo'); await act(async () => { holdCommit = null; releaseCommit(); });
  await screen.findByRole('button', { name: 'Abrir modelo: Original' }); expect(connections[0].prepare('SELECT count(*) AS total FROM task_templates').get()).toMatchObject({ total: 1 });
  await press('Abrir modelo: Original'); const modelPath = view.getPathname();
  holdCommit = new Promise(resolve => { releaseCommit = resolve; }); await press('Criar tarefa deste modelo'); await press('Criar tarefa deste modelo');
  expect(view.getPathname()).toBe(modelPath); expect(screen.getByRole('button', { name: 'Criar tarefa deste modelo' })).toBeDisabled();
  await act(async () => { holdCommit = null; releaseCommit(); }); await screen.findByText('0 de 1 etapas concluídas (0%).');
  expect(connections[0].prepare('SELECT count(*) AS total FROM tasks').get()).toMatchObject({ total: 2 });
});
it('does not claim copy or model deletion success on rollback, and retries removal explicitly', async () => {
  const view = renderRouter(routes, { initialUrl: '/tasks' }); await screen.findByText('Ainda não há tarefas salvas.');
  await newTask('Original'); await press('Abrir tarefa: Original'); await press('Salvar como modelo'); await press('Abrir modelo: Original');
  const path = view.getPathname(); failCommit = true; await press('Criar tarefa deste modelo'); await screen.findByText(/Os dados salvos foram mantidos/);
  expect(view.getPathname()).toBe(path); expect(connections[0].prepare('SELECT count(*) AS total FROM tasks').get()).toMatchObject({ total: 1 });
  await press('Remover modelo'); await press('Confirmar remoção do modelo'); await screen.findByText(/Os dados salvos foram mantidos/);
  expect(screen.getByRole('button', { name: 'Confirmar remoção do modelo' })).toBeEnabled(); failCommit = false;
  await press('Confirmar remoção do modelo'); await screen.findByText('Ainda não há modelos salvos.');
});
it('restores empty models offline and preserves low stimulation and direct-link fallback', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  const view = renderRouter(routes, { initialUrl: '/tasks/templates/edit/missing' }); await screen.findByText('Modelo não encontrado.');
  await press('Voltar aos modelos'); await screen.findByText('Ainda não há modelos salvos.'); await press('Voltar às tarefas');
  await newTask('Vazio'); await press('Abrir tarefa: Vazio'); await press('Salvar como modelo'); await press('Abrir modelo: Vazio');
  await screen.findByText('Ainda não há etapas neste modelo.');
  const toggle = screen.getByRole('switch', { name: 'Modo de baixa estimulação' });
  await act(async () => fireEvent(toggle, 'valueChange', true)); await waitFor(() => expect(toggle).toBeChecked());
  await press('Criar tarefa deste modelo'); await screen.findByText('0 de 0 etapas concluídas (0%).'); expect(toggle).toBeChecked();
  view.unmount(); for (const db of connections) db.close(); connections = [];
  renderRouter(routes, { initialUrl: '/tasks/templates' }); await screen.findByRole('button', { name: 'Abrir modelo: Vazio' });
  expect(fetch).not.toHaveBeenCalled();
});
it('keeps stale editor drafts and refuses outdated removal confirmations when another connection changes a model', async () => {
  renderRouter(routes, { initialUrl: '/tasks' }); await screen.findByText('Ainda não há tarefas salvas.');
  await newTask('Original'); await press('Abrir tarefa: Original'); await press('Salvar como modelo'); await press('Abrir modelo: Original');
  await press('Editar modelo'); const external = await openTaskWorkspaceDatabase();
  let latest = (await external.readWorkspace()).templates[0];
  await external.saveTemplate({ ...latest, title: 'Outra versão' }, latest);
  fireEvent.changeText(screen.getByLabelText('Título do modelo'), 'Meu draft'); await press('Salvar modelo');
  await screen.findByText(/Seu preenchimento foi mantido/); expect(screen.getByLabelText('Título do modelo').props.value).toBe('Meu draft');
  expect((await external.readWorkspace()).templates[0].title).toBe('Outra versão');
  await press('Cancelar'); await press('Voltar aos modelos'); await press('Voltar às tarefas'); await press('Voltar ao quadro');
  await press('Abrir tarefas'); await screen.findByRole('button', { name: 'Abrir tarefa: Original' }); await press('Modelos de tarefas');
  await press('Abrir modelo: Outra versão'); await press('Remover modelo');
  latest = (await external.readWorkspace()).templates[0]; await external.saveTemplate({ ...latest, title: 'Versão mais nova' }, latest);
  await press('Confirmar remoção do modelo'); await screen.findByText(/Os dados salvos foram mantidos/);
  expect((await external.readWorkspace()).templates[0].title).toBe('Versão mais nova');
});
async function useCommon(title = 'Organizar uma mesa') {
  await press('Usar modelo comum: ' + title); await screen.findByLabelText('Título da tarefa');
}
function oldPress(name: string) {
  let node = screen.getByRole('button', { name });
  while (node.parent && typeof node.props.onPress !== 'function') node = node.parent;
  expect(typeof node.props.onPress).toBe('function'); return node.props.onPress as () => void;
}
it('reads original common models through the real menu without seeding tasks or personal models', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  renderRouter(routes, { initialUrl: '/' }); await press('Abrir tarefas'); await screen.findByText('Ainda não há tarefas salvas.');
  await press('Modelos de tarefas'); await press('Modelos comuns');
  expect(screen.getByRole('header', { name: 'Preparar uma mochila' })).toBeOnTheScreen();
  expect(screen.getByRole('header', { name: 'Organizar uma pequena área do quarto' })).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Editar modelo' })).toBeNull();
  expect(connections[0].prepare('SELECT count(*) AS total FROM tasks').get()).toMatchObject({ total: 0 });
  expect(connections[0].prepare('SELECT count(*) AS total FROM task_templates').get()).toMatchObject({ total: 0 });
  expect(fetch).not.toHaveBeenCalled(); expect(localSpeech.speak).not.toHaveBeenCalled();
});
it('edits and saves a common copy with false progress and independent IDs, preserving catalog and personal models on reentry', async () => {
  const view = renderRouter(routes, { initialUrl: '/tasks/catalog' }); await act(async () => {}); await useCommon();
  expect(screen.getByLabelText('Título da etapa 1')).toHaveProp('value', 'Escolher uma pequena área da mesa');
  fireEvent.changeText(screen.getByLabelText('Título da tarefa'), 'Cópia sintética'); await press('Descer etapa 1');
  await press('Salvar tarefa'); await screen.findByRole('button', { name: 'Abrir tarefa: Cópia sintética' });
  const workspace = await (await openTaskWorkspaceDatabase()).readWorkspace();
  expect(workspace.templates).toEqual([]); expect(workspace.tasks).toHaveLength(1);
  expect(workspace.tasks[0].steps.every(step => !step.completed && !step.id.startsWith('common-'))).toBe(true);
  expect(workspace.tasks[0].steps[1].title).toBe('Escolher uma pequena área da mesa');
  await press('Modelos de tarefas'); await press('Modelos comuns'); expect(screen.getByText('1. Escolher uma pequena área da mesa')).toBeOnTheScreen();
  await useCommon(); await press('Salvar tarefa'); await screen.findByRole('button', { name: 'Abrir tarefa: Organizar uma mesa' });
  const saved = await (await openTaskWorkspaceDatabase()).readWorkspace();
  expect(saved.tasks[0].steps.some(step => saved.tasks[1].steps.some(other => step.id === other.id))).toBe(false);
  view.unmount(); for (const db of connections) db.close(); connections = [];
  renderRouter(routes, { initialUrl: '/tasks' }); await screen.findByRole('button', { name: 'Abrir tarefa: Cópia sintética' });
  expect((await (await openTaskWorkspaceDatabase()).readWorkspace()).tasks).toHaveLength(2);
});
it('cancels a common draft and refuses a captured save callback after leaving without writing', async () => {
  renderRouter(routes, { initialUrl: '/tasks/catalog' }); await act(async () => {}); await useCommon();
  fireEvent.changeText(screen.getByLabelText('Título da tarefa'), 'Discarded'); const save = oldPress('Salvar tarefa');
  await press('Cancelar'); act(() => save()); await act(async () => {});
  expect((await (await openTaskWorkspaceDatabase()).readWorkspace()).tasks).toEqual([]);
  await useCommon(); expect(screen.getByLabelText('Título da tarefa')).toHaveProp('value', 'Organizar uma mesa');
});
it('refuses a save callback captured before a newer draft edit, then saves only the current choice', async () => {
  renderRouter(routes, { initialUrl: '/tasks/catalog' }); await act(async () => {}); await useCommon();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar tarefa' })).toBeEnabled());
  const save = oldPress('Salvar tarefa'); fireEvent.changeText(screen.getByLabelText('Título da tarefa'), 'Current synthetic draft');
  await act(async () => save());
  expect((await (await openTaskWorkspaceDatabase()).readWorkspace()).tasks).toEqual([]);
  expect(screen.getByLabelText('Título da tarefa')).toHaveProp('value', 'Current synthetic draft');
  await press('Salvar tarefa'); await screen.findByRole('button', { name: 'Abrir tarefa: Current synthetic draft' });
});
it('keeps pending copy unconfirmed, rejects duplicates and preserves draft through rollback then human retry', async () => {
  let back: Parameters<typeof BackHandler.addEventListener>[1] | undefined;
  jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, callback) => { back = callback; return { remove: jest.fn() }; });
  const view = renderRouter(routes, { initialUrl: '/tasks/catalog' }); await act(async () => {}); await useCommon('Preparar uma mochila');
  fireEvent.changeText(screen.getByLabelText('Título da tarefa'), 'Mochila sintética'); const save = oldPress('Salvar tarefa');
  holdCommit = new Promise(resolve => { releaseCommit = resolve; });
  await act(async () => { save(); save(); }); expect(view.getPathname()).toBe('/tasks/catalog/new/backpack');
  expect(screen.getByRole('button', { name: 'Salvar tarefa' })).toBeDisabled(); expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  act(() => { expect(back?.({ type: 'hardwareBackPress', timeStamp: Date.now() })).toBe(true); });
  expect(view.getPathname()).toBe('/tasks/catalog/new/backpack');
  failCommit = true; await act(async () => { holdCommit = null; releaseCommit(); });
  await screen.findByText(/Seu preenchimento foi mantido/); expect(screen.getByLabelText('Título da tarefa')).toHaveProp('value', 'Mochila sintética');
  expect(connections[0].prepare('SELECT count(*) AS total FROM tasks').get()).toMatchObject({ total: 0 });
  expect(screen.queryByText('synthetic private failure')).toBeNull(); failCommit = false;
  await press('Salvar tarefa'); await screen.findByRole('button', { name: 'Abrir tarefa: Mochila sintética' });
  expect(connections[0].prepare('SELECT count(*) AS total FROM tasks').get()).toMatchObject({ total: 1 });
});
it('reads catalog with database failure while the draft shows recoverable unavailable storage', async () => {
  jest.mocked(openDatabaseAsync).mockRejectedValueOnce(new Error('private synthetic failure'));
  renderRouter(routes, { initialUrl: '/tasks/catalog' }); await act(async () => {});
  expect(screen.getByRole('header', { name: 'Organizar uma mesa' })).toBeOnTheScreen(); await useCommon();
  await screen.findByRole('button', { name: 'Tentar abrir tarefas novamente' });
  expect(screen.getByRole('button', { name: 'Salvar tarefa' })).toBeDisabled();
  expect(screen.queryByText('private synthetic failure')).toBeNull();
  await press('Tentar abrir tarefas novamente'); await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar tarefa' })).toBeEnabled());
  await press('Salvar tarefa'); await screen.findByRole('button', { name: 'Abrir tarefa: Organizar uma mesa' });
});
it('discards retained draft on blur, guards old save and preserves mode9 on fresh focus', async () => {
  renderRouter({ ...routes, 'tasks/other': () => <Text>Synthetic other screen</Text> }, { initialUrl: '/tasks/catalog/new/room' });
  await screen.findByLabelText('Título da tarefa'); await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar tarefa' })).toBeEnabled());
  await act(async () => fireEvent(screen.getByRole('switch', { name: 'Modo de baixa estimulação' }), 'valueChange', true));
  fireEvent.changeText(screen.getByLabelText('Título da tarefa'), 'Discarded'); const save = oldPress('Salvar tarefa');
  await act(async () => router.push('/tasks/other')); act(() => save()); await act(async () => router.back());
  await screen.findByLabelText('Título da tarefa'); expect(screen.getByLabelText('Título da tarefa')).toHaveProp('value', 'Organizar uma pequena área do quarto');
  expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked();
  expect((await (await openTaskWorkspaceDatabase()).readWorkspace()).tasks).toEqual([]);
});
it('has focused hardware fallback for missing catalog IDs and rejects the old back callback after leaving', async () => {
  let back: Parameters<typeof BackHandler.addEventListener>[1] | undefined;
  jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, callback) => { back = callback; return { remove: jest.fn() }; });
  const view = renderRouter(routes, { initialUrl: '/tasks/catalog/new/missing' }); await screen.findByText('Este modelo comum não está disponível.');
  const old = back; act(() => { expect(back?.({ type: 'hardwareBackPress', timeStamp: Date.now() })).toBe(true); });
  await screen.findByRole('header', { name: 'Modelos comuns' }); expect(view.getPathname()).toBe('/tasks/catalog');
  act(() => { expect(old?.({ type: 'hardwareBackPress', timeStamp: Date.now() })).toBe(false); });
  await press('Voltar aos modelos'); expect(view.getPathname()).toBe('/tasks/templates');
});
it('keeps a navigation failure recoverable and refuses duplicate use before navigation finishes', async () => {
  const use = jest.fn().mockImplementationOnce(() => { throw new Error('private synthetic navigation'); });
  renderRouter({ ...routes, 'tasks/catalog/index': () => <CommonTaskCatalogScreen onClose={jest.fn()} onUse={use} /> }, { initialUrl: '/tasks/catalog' });
  await press('Usar modelo comum: Organizar uma mesa'); await screen.findByText('Não foi possível abrir a cópia. Tente novamente.');
  const command = oldPress('Usar modelo comum: Organizar uma mesa'); act(() => { command(); command(); });
  expect(use).toHaveBeenCalledTimes(2); expect(use).toHaveBeenLastCalledWith('desk');
  expect(screen.queryByText('private synthetic navigation')).toBeNull();
});
it('does not navigate after unmount while an already authorized save commits, nor write from an old callback', async () => {
  const saved = jest.fn(); const view = render(<TaskProvider><TaskEditor initialDraft={commonTaskDraft('desk')} onClose={jest.fn()} onSaved={saved} /></TaskProvider>);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar tarefa' })).toBeEnabled());
  const command = oldPress('Salvar tarefa'); holdCommit = new Promise(resolve => { releaseCommit = resolve; });
  await act(async () => command()); view.unmount();
  await act(async () => { holdCommit = null; releaseCommit(); }); act(() => command()); await act(async () => {});
  expect((await (await openTaskWorkspaceDatabase()).readWorkspace()).tasks).toHaveLength(1); expect(saved).not.toHaveBeenCalled();
});
it.each([
  { name: 'missing', content: () => null }, { name: 'incomplete', content: () => ({ revision: 'x', items: [] }) },
  { name: 'throwing', content: () => ({ get revision(): never { throw new Error('private synthetic'); } }) },
])('shows neutral unavailable $name catalog without fake retry or copy actions', async ({ content }) => {
  const close = jest.fn(); const use = jest.fn(); const value = content();
  renderRouter({ ...routes, 'tasks/catalog/index': () => <CommonTaskCatalogScreen content={value} onClose={close} onUse={use} /> }, { initialUrl: '/tasks/catalog' });
  await screen.findByText('Os modelos comuns não estão disponíveis nesta versão.');
  expect(screen.queryByRole('button', { name: /Usar modelo comum/ })).toBeNull();
  await press('Voltar aos modelos'); expect(close).toHaveBeenCalledTimes(1); expect(use).not.toHaveBeenCalled();
});

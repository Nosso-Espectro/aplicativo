import { StrictMode, useEffect, useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { TaskEditor } from '../../../src/features/task-breakdown/TaskEditor';
import { TaskProvider, useTasks } from '../../../src/features/task-breakdown/TaskProvider';
import { TaskCommand } from '../../../src/features/task-breakdown/TaskUI';
import { openTaskDatabase, type SavedTask } from '../../../src/features/task-breakdown/task-database';
jest.mock('../../../src/features/task-breakdown/task-database', () => ({ openTaskDatabase: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let tasks: SavedTask[];
const save = jest.fn(); const list = jest.fn(); const close = jest.fn();
let context: ReturnType<typeof useTasks>;
function Session({ edit = false }: { edit?: boolean }) {
  const value = useTasks();
  const [editing, setEditing] = useState(true);
  useEffect(() => { context = value; }, [value]);
  if (value.loading) return <Text>Carregando</Text>;
  if (value.error) return <><Text>{value.error}</Text><TaskCommand icon="refresh" label="Tentar abrir" onPress={value.retry} /></>;
  return editing ? <TaskEditor task={edit ? value.tasks[0] : undefined} onClose={() => { close(); setEditing(false); }} /> : <Text>Lista de tarefas</Text>;
}
beforeEach(() => {
  jest.clearAllMocks(); tasks = [];
  list.mockReset().mockImplementation(async () => structuredClone(tasks));
  save.mockReset().mockImplementation(async (draft, expected) => {
    if (expected && !tasks.some(task => task.id === expected.id && task.revision === expected.revision)) throw new Error('stale');
    const task = { ...structuredClone(draft), id: expected?.id ?? 'synthetic', revision: (expected?.revision ?? 0) + 1 };
    tasks = expected ? tasks.map(item => item.id === expected.id ? task : item) : [...tasks, task];
    return structuredClone(tasks);
  });
  jest.mocked(openTaskDatabase).mockResolvedValue({ list, save, complete: jest.fn(), remove: jest.fn() });
});
async function open(edit = false) {
  const view = render(<TaskProvider><Session edit={edit} /></TaskProvider>);
  await screen.findByLabelText('Título da tarefa'); return view;
}
it('validates required titles and saves an empty principal task explicitly', async () => {
  await open();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar tarefa' }));
  expect(screen.getByText('Informe o título da tarefa.')).toBeOnTheScreen(); expect(save).not.toHaveBeenCalled();
  fireEvent.changeText(screen.getByLabelText('Título da tarefa'), '  Teste  ');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar tarefa' }));
  await screen.findByText('Lista de tarefas');
  expect(tasks).toEqual([{ id: 'synthetic', revision: 1, title: 'Teste', steps: [] }]);
});
it('adds and edits steps, preserves identities/status when ordering and confirms removal of completed steps', async () => {
  tasks = [{ id: 'a', revision: 2, title: 'Teste', steps: [{ id: 'one', title: 'Uma', completed: true }, { id: 'two', title: 'Duas', completed: false }] }];
  await open(true);
  expect(screen.getByRole('button', { name: 'Subir etapa 1' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Descer etapa 2' })).toBeDisabled();
  fireEvent.press(screen.getByRole('button', { name: 'Descer etapa 1' }));
  expect(screen.getByLabelText('Título da etapa 2').props.value).toBe('Uma');
  fireEvent.press(screen.getByRole('button', { name: 'Remover etapa 2' }));
  expect(screen.getByText('Remover esta etapa concluída da tarefa?')).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: 'Manter etapa' }));
  expect(tasks[0].steps).toHaveLength(2);
  fireEvent.press(screen.getByRole('button', { name: 'Remover etapa 2' }));
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar remoção da etapa' }));
  fireEvent.press(screen.getByRole('button', { name: 'Adicionar etapa' }));
  fireEvent.press(screen.getByRole('button', { name: 'Salvar tarefa' }));
  expect(screen.getByText('Informe o título de cada etapa.')).toBeOnTheScreen();
  fireEvent.changeText(screen.getByLabelText('Título da etapa 2'), '  Nova  ');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar tarefa' }));
  await screen.findByText('Lista de tarefas');
  expect(tasks[0].steps[0]).toEqual({ id: 'two', title: 'Duas', completed: false });
  expect(tasks[0].steps[1]).toMatchObject({ title: 'Nova', completed: false });
  expect(save.mock.calls[0][1]).toEqual({ id: 'a', revision: 2 });
});
it('cancels drafts without writes or changes to stored completion', async () => {
  tasks = [{ id: 'a', revision: 1, title: 'Teste', steps: [{ id: 'one', title: 'Uma', completed: true }] }];
  await open(true);
  fireEvent.changeText(screen.getByLabelText('Título da tarefa'), 'Alterado');
  fireEvent.press(screen.getByRole('button', { name: 'Remover etapa 1' }));
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar remoção da etapa' }));
  fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
  expect(save).not.toHaveBeenCalled(); expect(tasks[0].steps[0].completed).toBe(true); expect(tasks[0].title).toBe('Teste');
});
it('retains reordered draft and confirmed revision after failed save, then retries explicitly', async () => {
  tasks = [{ id: 'a', revision: 4, title: 'Teste', steps: [{ id: 'one', title: 'Uma', completed: true }, { id: 'two', title: 'Duas', completed: false }] }];
  save.mockRejectedValueOnce(new Error('private path'));
  await open(true);
  fireEvent.press(screen.getByRole('button', { name: 'Descer etapa 1' }));
  fireEvent.press(screen.getByRole('button', { name: 'Salvar tarefa' }));
  await screen.findByText(/Seu preenchimento foi mantido/);
  expect(screen.queryByText('private path')).toBeNull(); expect(close).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Título da etapa 1').props.value).toBe('Duas');
  expect(context.tasks[0].revision).toBe(4); expect(tasks[0].steps[0].id).toBe('one');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar tarefa' }));
  await screen.findByText('Lista de tarefas');
  expect(tasks[0].steps[1]).toEqual({ id: 'one', title: 'Uma', completed: true });
});
it('waits for committed results, blocks duplicate saves and ignores completion after unmount', async () => {
  let finish!: (value: SavedTask[]) => void;
  save.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const view = await open();
  fireEvent.changeText(screen.getByLabelText('Título da tarefa'), 'Teste');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar tarefa' }));
  expect(screen.getByRole('button', { name: 'Salvar tarefa' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar tarefa' }));
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  expect(context.tasks).toEqual([]); expect(close).not.toHaveBeenCalled();
  view.unmount(); await act(async () => { finish([{ id: 'a', revision: 1, title: 'Teste', steps: [] }]); });
  expect(close).not.toHaveBeenCalled();
});
it('does not resurrect a removed task from an old editor', async () => {
  tasks = [{ id: 'a', revision: 1, title: 'Teste', steps: [] }]; await open(true);
  tasks = [];
  fireEvent.changeText(screen.getByLabelText('Título da tarefa'), 'Antigo');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar tarefa' }));
  await screen.findByText(/Seu preenchimento foi mantido/);
  expect(tasks).toEqual([]); expect(close).not.toHaveBeenCalled();
});
it('retries an initialization failure and shares database initialization in StrictMode', async () => {
  jest.mocked(openTaskDatabase).mockRejectedValueOnce(new Error('private data'));
  render(<StrictMode><TaskProvider><Session /></TaskProvider></StrictMode>);
  fireEvent.press(await screen.findByRole('button', { name: 'Tentar abrir' }));
  await screen.findByLabelText('Título da tarefa');
  expect(screen.queryByText('private data')).toBeNull();
  expect(openTaskDatabase).toHaveBeenCalledTimes(2);
  await waitFor(() => expect(context.loading).toBe(false));
});
it('publishes completion and removal only after commit, with the captured revision', async () => {
  tasks = [{ id: 'a', revision: 3, title: 'Teste', steps: [{ id: 'one', title: 'Uma', completed: false }] }];
  let finish!: (value: SavedTask[]) => void;
  const complete = jest.fn(() => new Promise<SavedTask[]>(resolve => { finish = resolve; }));
  const remove = jest.fn().mockResolvedValue([]);
  jest.mocked(openTaskDatabase).mockResolvedValue({ list, save, complete, remove });
  await open(true);
  let result!: Promise<boolean>;
  const captured = context.tasks[0];
  await act(async () => { result = context.complete(captured, 'one', true); });
  expect(complete).toHaveBeenCalledWith('a', 'one', true, 3);
  expect(context.tasks[0].steps[0].completed).toBe(false);
  await act(async () => { expect(await context.remove(captured)).toBe(false); });
  expect(remove).not.toHaveBeenCalled();
  await act(async () => { finish([{ ...captured, revision: 4, steps: [{ ...captured.steps[0], completed: true }] }]); expect(await result).toBe(true); });
  expect(context.tasks[0].steps[0].completed).toBe(true);
  await act(async () => { expect(await context.remove(context.tasks[0])).toBe(true); });
  expect(remove).toHaveBeenCalledWith('a', 4); expect(context.tasks).toEqual([]);
});
it('retains confirmed tasks after failed completion or deletion', async () => {
  tasks = [{ id: 'a', revision: 3, title: 'Teste', steps: [{ id: 'one', title: 'Uma', completed: false }] }];
  jest.mocked(openTaskDatabase).mockResolvedValue({ list, save,
    complete: jest.fn().mockRejectedValue(new Error('private')), remove: jest.fn().mockRejectedValue(new Error('private')) });
  await open(true);
  await act(async () => {
    await expect(context.complete(context.tasks[0], 'one', true)).rejects.toThrow('Task change unavailable.');
    await expect(context.remove(context.tasks[0])).rejects.toThrow('Task change unavailable.');
  });
  expect(context.tasks).toEqual(tasks); expect(context.busy).toBe(false);
});

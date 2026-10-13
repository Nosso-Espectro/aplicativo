import { useEffect, useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import RoutinesScreen from '../../../src/app/routines';
import NewRoutineScreen from '../../../src/app/routines/new';
import EditRoutineScreen from '../../../src/app/routines/[id]';
import { RoutineProvider } from '../../../src/features/routines/RoutineProvider';
import { openRoutineDatabase } from '../../../src/features/routines/routine-database';
import { pickCardImage } from '../../../src/features/communication/custom-cards/media-picker';
import type { Routine } from '../../../src/features/routines/routine-model';
jest.mock('../../../src/features/routines/routine-database', () => ({ openRoutineDatabase: jest.fn() }));
jest.mock('../../../src/features/communication/custom-cards/local-image-storage', () => ({
  isLocalImage: (uri: string) => uri.startsWith('file://') || uri.startsWith('content://'),
  createLocalImageStorage: () => ({ copy: async () => 'file:///private/routine-images/test.png', remove: async () => {}, prune: async () => {} }),
}));
jest.mock('../../../src/features/communication/custom-cards/media-picker', () => ({ pickCardImage: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
const mockPush = jest.fn(); const mockBack = jest.fn(); const mockReplace = jest.fn();
let mockId = ''; let routines: Routine[];
const save = jest.fn(); const list = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, back: mockBack, replace: mockReplace, canGoBack: () => true }), useLocalSearchParams: () => ({ id: mockId }) }));
function Session() {
  const [route, setRoute] = useState('list');
  useEffect(() => {
    mockPush.mockImplementation((target: string | { params: { id: string } }) => {
      if (typeof target === 'string') setRoute('new'); else { mockId = target.params.id; setRoute('edit'); }
    });
    mockBack.mockImplementation(() => setRoute('list'));
  }, []);
  return <RoutineProvider>{route === 'list' ? <RoutinesScreen /> : route === 'new' ? <NewRoutineScreen /> : <EditRoutineScreen />}</RoutineProvider>;
}
beforeEach(() => {
  jest.clearAllMocks(); routines = []; mockId = '';
  list.mockReset(); list.mockImplementation(async () => [...routines]);
  save.mockReset(); save.mockImplementation(async (draft, id) => {
    const routine = { ...draft, id: id ?? 'routine-test' };
    routines = id ? routines.map((value) => value.id === id ? routine : value) : [...routines, routine];
    return [...routines];
  });
  jest.mocked(openRoutineDatabase).mockResolvedValue({ list, save });
  jest.mocked(pickCardImage).mockResolvedValue({});
});
async function openNew() {
  await waitFor(() => expect(screen.getByRole('button', { name: 'Nova rotina' })).toBeEnabled());
  fireEvent.press(screen.getByRole('button', { name: 'Nova rotina' }));
}
it('handles empty state, validates name and saves a named empty routine', async () => {
  render(<Session />); await openNew();
  expect(screen.getByText('Ainda não há etapas nesta rotina.')).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar rotina' }));
  expect(screen.getByText('Informe o nome da rotina.')).toBeOnTheScreen(); expect(save).not.toHaveBeenCalled();
  fireEvent.changeText(screen.getByLabelText('Nome da rotina'), '  Manhã  ');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar rotina' }));
  expect(await screen.findByRole('button', { name: 'Abrir rotina: Manhã' })).toBeOnTheScreen();
  expect(screen.getByText('Sem etapas')).toBeOnTheScreen();
});
it('adds, edits, confirms removal and reopens ordered steps in a new session', async () => {
  const view = render(<Session />); await openNew();
  fireEvent.changeText(screen.getByLabelText('Nome da rotina'), 'Teste');
  fireEvent.press(screen.getByRole('button', { name: 'Adicionar etapa' }));
  fireEvent.changeText(screen.getByLabelText('Título da etapa 1'), 'Primeira');
  fireEvent.press(screen.getByRole('button', { name: 'Adicionar etapa' }));
  fireEvent.changeText(screen.getByLabelText('Título da etapa 2'), 'Segunda');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar rotina' }));
  fireEvent.press(await screen.findByRole('button', { name: 'Abrir rotina: Teste' }));
  expect(screen.getByLabelText('Título da etapa 2').props.value).toBe('Segunda');
  fireEvent.press(screen.getByRole('button', { name: 'Remover etapa 1' }));
  fireEvent.press(screen.getByRole('button', { name: 'Manter etapa' }));
  expect(screen.getByLabelText('Título da etapa 1').props.value).toBe('Primeira');
  fireEvent.press(screen.getByRole('button', { name: 'Remover etapa 1' }));
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar remoção da etapa' }));
  fireEvent.changeText(screen.getByLabelText('Título da etapa 1'), 'Editada');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar rotina' }));
  await screen.findByRole('button', { name: 'Abrir rotina: Teste' });
  view.unmount(); render(<Session />);
  fireEvent.press(await screen.findByRole('button', { name: 'Abrir rotina: Teste' }));
  expect(screen.getByLabelText('Título da etapa 1').props.value).toBe('Editada');
  expect(screen.queryByLabelText('Título da etapa 2')).toBeNull();
});
it('preserves draft on invalid step, camera denial and picker cancellation, and saves without image', async () => {
  render(<Session />); await openNew();
  fireEvent.changeText(screen.getByLabelText('Nome da rotina'), 'Teste');
  fireEvent.press(screen.getByRole('button', { name: 'Adicionar etapa' }));
  fireEvent.press(screen.getByRole('button', { name: 'Salvar rotina' }));
  expect(screen.getByText('Informe o título da etapa.')).toBeOnTheScreen();
  fireEvent.changeText(screen.getByLabelText('Título da etapa 1'), 'Etapa');
  jest.mocked(pickCardImage).mockResolvedValueOnce({ message: 'Câmera não autorizada. Você pode salvar sem imagem.' });
  fireEvent.press(screen.getByRole('button', { name: 'Usar câmera na etapa 1' }));
  expect(await screen.findByText(/Câmera não autorizada/)).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: 'Escolher imagem da etapa 1' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar rotina' })).toBeEnabled());
  fireEvent.press(screen.getByRole('button', { name: 'Salvar rotina' }));
  await screen.findByRole('button', { name: 'Abrir rotina: Teste' });
  expect(routines[0].steps[0].imageUri).toBeNull();
});
it('copies selected image, supports removal and preserves changes on failed save with retry', async () => {
  render(<Session />); await openNew();
  fireEvent.changeText(screen.getByLabelText('Nome da rotina'), 'Teste');
  fireEvent.press(screen.getByRole('button', { name: 'Adicionar etapa' }));
  fireEvent.changeText(screen.getByLabelText('Título da etapa 1'), 'Etapa');
  jest.mocked(pickCardImage).mockResolvedValueOnce({ uri: 'file:///cache/test.png' });
  fireEvent.press(screen.getByRole('button', { name: 'Escolher imagem da etapa 1' }));
  await screen.findByLabelText('Imagem da etapa 1');
  save.mockRejectedValueOnce(new Error('private content'));
  fireEvent.press(screen.getByRole('button', { name: 'Salvar rotina' }));
  expect(await screen.findByText(/Seu preenchimento foi mantido/)).toBeOnTheScreen();
  expect(screen.queryByText('private content')).toBeNull(); expect(routines).toEqual([]);
  expect(screen.getByLabelText('Nome da rotina').props.value).toBe('Teste');
  fireEvent.press(screen.getByRole('button', { name: 'Remover imagem da etapa 1' }));
  fireEvent.press(screen.getByRole('button', { name: 'Salvar rotina' }));
  await screen.findByRole('button', { name: 'Abrir rotina: Teste' });
  expect(routines[0].steps[0].imageUri).toBeNull();
});
it('waits for commit before navigating and disables repeated pending saves', async () => {
  let finish!: (value: Routine[]) => void;
  save.mockImplementationOnce(() => new Promise<Routine[]>((resolve) => { finish = resolve; }));
  render(<Session />); await openNew();
  fireEvent.changeText(screen.getByLabelText('Nome da rotina'), 'Teste');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar rotina' }));
  expect(screen.getByRole('button', { name: 'Salvar rotina' })).toBeDisabled();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar rotina' }));
  expect(save).toHaveBeenCalledTimes(1); expect(mockBack).not.toHaveBeenCalled();
  await act(async () => { finish([{ id: 'r', name: 'Teste', steps: [] }]); });
  expect(mockBack).toHaveBeenCalledTimes(1);
});
it('recovers storage initialization failure without exposing details', async () => {
  jest.mocked(openRoutineDatabase).mockRejectedValueOnce(new Error('private path'));
  render(<Session />);
  await screen.findByRole('button', { name: 'Tentar abrir rotinas novamente' });
  expect(screen.queryByText('private path')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Tentar abrir rotinas novamente' }));
  expect(await screen.findByText('Ainda não há rotinas salvas.')).toBeOnTheScreen();
});

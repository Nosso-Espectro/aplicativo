import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { RoutineProvider } from '../../../src/features/routines/RoutineProvider';
import { RoutinePlayer } from '../../../src/features/routines/RoutinePlayer';
import { openRoutineDatabase } from '../../../src/features/routines/routine-database';
import { routineExecution, type ProgressAction } from '../../../src/features/routines/routine-execution';
import type { Routine } from '../../../src/features/routines/routine-model';
jest.mock('../../../src/features/routines/routine-database', () => ({ openRoutineDatabase: jest.fn() }));
jest.mock('../../../src/features/communication/custom-cards/local-image-storage', () => ({ createLocalImageStorage: () => ({ prune: async () => {} }) }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let routines: Routine[];
const progress = jest.fn(); const onClose = jest.fn(); const onEdit = jest.fn();
function Session({ id = 'r' }: { id?: string }) {
  return <RoutineProvider><RoutinePlayer id={id} onClose={onClose} onEdit={onEdit} /></RoutineProvider>;
}
beforeEach(() => {
  jest.clearAllMocks();
  routines = [{ id: 'r', name: 'Teste', steps: ['a', 'b', 'c'].map((id) => ({ id, title: `Etapa ${id}`, imageUri: null, completed: false })) }];
  progress.mockReset(); progress.mockImplementation(async (_id: string, action: ProgressAction) => {
    const execution = routineExecution(routines[0].steps);
    routines = [{ ...routines[0], steps: routines[0].steps.map((step, index) => ({ ...step,
      completed: action === 'restart' ? false : action === 'previous' && index >= execution.index - 1 ? false : action === 'complete' && index === execution.index ? true : step.completed,
    })) }];
    return routines;
  });
  jest.mocked(openRoutineDatabase).mockResolvedValue({ list: async () => routines, save: jest.fn(), progress });
});
it('shows only Agora/Depois, saves completion and restores progress in a new session', async () => {
  const view = render(<Session />);
  await screen.findByText('Etapa a');
  expect(screen.getByRole('header', { name: 'Agora' })).toBeOnTheScreen();
  expect(screen.getByRole('header', { name: 'Depois' })).toBeOnTheScreen();
  expect(screen.queryByText('Etapa c')).toBeNull();
  expect(screen.getByRole('button', { name: 'Voltar à etapa anterior' })).toBeDisabled();
  fireEvent.press(screen.getByRole('button', { name: 'Concluir etapa atual' }));
  await waitFor(() => expect(progress).toHaveBeenCalledWith('r', 'complete', 'a'));
  expect(routines[0].steps[0].completed).toBe(true);
  await waitFor(() => expect(screen.queryByText('Etapa a')).toBeNull());
  expect(screen.getByText('Etapa b')).toBeOnTheScreen(); expect(screen.getByText('Etapa c')).toBeOnTheScreen();
  view.unmount(); render(<Session />); await screen.findByText('Etapa b');
  fireEvent.press(screen.getByRole('button', { name: 'Voltar à etapa anterior' }));
  expect(await screen.findByText('Etapa a')).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: 'Voltar às rotinas' })); expect(onClose).toHaveBeenCalled();
});
it('finishes explicitly without auto restart, supports prior step and confirmed restart', async () => {
  routines[0].steps = [routines[0].steps[0]];
  render(<Session />); await screen.findByText('Etapa a');
  expect(screen.getByText('Não há outra etapa depois desta.')).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: 'Concluir etapa atual' }));
  await screen.findByText('Rotina concluída'); expect(progress).toHaveBeenCalledTimes(1);
  fireEvent.press(screen.getByRole('button', { name: 'Voltar à etapa anterior' }));
  await screen.findByText('Etapa a');
  fireEvent.press(screen.getByRole('button', { name: 'Concluir etapa atual' }));
  await screen.findByText('Rotina concluída');
  fireEvent.press(screen.getByRole('button', { name: 'Reiniciar rotina' }));
  fireEvent.press(screen.getByRole('button', { name: 'Manter rotina concluída' }));
  expect(screen.getByText('Rotina concluída')).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: 'Reiniciar rotina' }));
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar reinício' }));
  await screen.findByText('Etapa a');
});
it('preserves confirmed current step on failure, hides details and permits retry', async () => {
  progress.mockRejectedValueOnce(new Error('private content'));
  render(<Session />); await screen.findByText('Etapa a');
  fireEvent.press(screen.getByRole('button', { name: 'Concluir etapa atual' }));
  await screen.findByText(/último progresso salvo foi mantido/);
  expect(screen.getByText('Etapa a')).toBeOnTheScreen(); expect(screen.queryByText('private content')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Tentar salvar progresso novamente' }));
  await waitFor(() => expect(progress).toHaveBeenCalledTimes(2));
  await waitFor(() => expect(screen.queryByText('Etapa a')).toBeNull());
});
it('does not advance optimistically or submit duplicate pending actions', async () => {
  let finish!: (rows: Routine[]) => void;
  progress.mockImplementationOnce(() => new Promise<Routine[]>((resolve) => { finish = resolve; }));
  render(<Session />); await screen.findByText('Etapa a');
  fireEvent.press(screen.getByRole('button', { name: 'Concluir etapa atual' }));
  expect(screen.getByText('Etapa a')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Concluir etapa atual' })).toBeDisabled();
  fireEvent.press(screen.getByRole('button', { name: 'Concluir etapa atual' })); expect(progress).toHaveBeenCalledTimes(1);
  await act(async () => { finish([{ ...routines[0], steps: routines[0].steps.map((step, index) => ({ ...step, completed: index === 0 })) }]); });
  expect(screen.queryByText('Etapa a')).toBeNull();
});
it('offers editing for an empty routine and handles a missing ID without progress actions', async () => {
  routines[0].steps = [];
  const view = render(<Session />); await screen.findByText('Esta rotina ainda não tem etapas.');
  fireEvent.press(screen.getByRole('button', { name: 'Editar rotina' })); expect(onEdit).toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Concluir etapa atual' })).toBeNull();
  view.unmount(); render(<Session id="missing" />);
  await screen.findByText('Rotina não encontrada.'); expect(progress).not.toHaveBeenCalled();
});
it('cancels a failed restart intent when choosing to keep the completed routine', async () => {
  routines[0].steps = routines[0].steps.map((step) => ({ ...step, completed: true }));
  progress.mockRejectedValueOnce(new Error('synthetic failure'));
  render(<Session />); await screen.findByText('Rotina concluída');
  fireEvent.press(screen.getByRole('button', { name: 'Reiniciar rotina' }));
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar reinício' }));
  await screen.findByRole('button', { name: 'Tentar salvar progresso novamente' });
  fireEvent.press(screen.getByRole('button', { name: 'Manter rotina concluída' }));
  expect(screen.queryByRole('button', { name: 'Tentar salvar progresso novamente' })).toBeNull();
  expect(screen.getByText('Rotina concluída')).toBeOnTheScreen();
  expect(progress).toHaveBeenCalledTimes(1);
});

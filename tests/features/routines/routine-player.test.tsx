import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { StrictMode } from 'react';
import { RoutineProvider } from '../../../src/features/routines/RoutineProvider';
import { RoutinePlayer } from '../../../src/features/routines/RoutinePlayer';
import { openRoutineDatabase } from '../../../src/features/routines/routine-database';
import { routineExecution, type ProgressAction } from '../../../src/features/routines/routine-execution';
import type { Routine } from '../../../src/features/routines/routine-model';
jest.mock('../../../src/features/routines/routine-database', () => ({ openRoutineDatabase: jest.fn() }));
jest.mock('../../../src/features/communication/custom-cards/local-image-storage', () => ({ createLocalImageStorage: () => ({ prune: async () => {} }) }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let mockFocused = true;
jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    const { useEffect } = jest.requireActual<typeof import('react')>('react');
    const focused = mockFocused;
    useEffect(() => { if (focused) return callback(); }, [callback, focused]);
  },
}));
let routines: Routine[];
const progress = jest.fn(); const onClose = jest.fn(); const onEdit = jest.fn();
function Session({ id = 'r' }: { id?: string }) {
  return <RoutineProvider><RoutinePlayer id={id} onClose={onClose} onEdit={onEdit} /></RoutineProvider>;
}
function commandCallback(name: string): () => void {
  let node = screen.getByRole('button', { name });
  while (node.parent && typeof node.props.onPress !== 'function') node = node.parent;
  expect(typeof node.props.onPress).toBe('function');
  return node.props.onPress as () => void;
}
beforeEach(() => {
  jest.clearAllMocks(); mockFocused = true;
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
it('does not write progress through a callback captured before unmount', async () => {
  const view = render(<Session />); await screen.findByText('Etapa a');
  const oldComplete = commandCallback('Concluir etapa atual');
  view.unmount();
  await act(async () => oldComplete());
  expect(progress).not.toHaveBeenCalled();
  expect(routines[0].steps[0].completed).toBe(false);
});
it('does not revive a confirmation after keeping the completed routine', async () => {
  routines[0].steps = routines[0].steps.map(step => ({ ...step, completed: true }));
  render(<Session />); await screen.findByText('Rotina concluída');
  fireEvent.press(screen.getByRole('button', { name: 'Reiniciar rotina' }));
  const oldConfirm = commandCallback('Confirmar reinício');
  fireEvent.press(screen.getByRole('button', { name: 'Manter rotina concluída' }));
  await act(async () => oldConfirm());
  expect(progress).not.toHaveBeenCalled();
  expect(routines[0].steps.every(step => step.completed)).toBe(true);
});
it('does not revive a prior restart intent when another confirmation is opened', async () => {
  routines[0].steps = routines[0].steps.map(step => ({ ...step, completed: true }));
  render(<Session />); await screen.findByText('Rotina concluída');
  fireEvent.press(screen.getByRole('button', { name: 'Reiniciar rotina' }));
  const oldConfirm = commandCallback('Confirmar reinício');
  const oldCancel = commandCallback('Manter rotina concluída');
  fireEvent.press(screen.getByRole('button', { name: 'Manter rotina concluída' }));
  fireEvent.press(screen.getByRole('button', { name: 'Reiniciar rotina' }));
  await act(async () => { oldConfirm(); oldCancel(); });
  expect(progress).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Confirmar reinício' })).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar reinício' }));
  await screen.findByText('Etapa a'); expect(progress).toHaveBeenCalledTimes(1);
});
it('revokes captured restart retry after cancellation and preserves current retry', async () => {
  routines[0].steps = routines[0].steps.map(step => ({ ...step, completed: true }));
  progress.mockRejectedValueOnce(new Error('synthetic failure'));
  render(<Session />); await screen.findByText('Rotina concluída');
  fireEvent.press(screen.getByRole('button', { name: 'Reiniciar rotina' }));
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar reinício' }));
  await screen.findByRole('button', { name: 'Tentar salvar progresso novamente' });
  const oldRetry = commandCallback('Tentar salvar progresso novamente');
  fireEvent.press(screen.getByRole('button', { name: 'Manter rotina concluída' }));
  await act(async () => oldRetry()); expect(progress).toHaveBeenCalledTimes(1);
  progress.mockRejectedValueOnce(new Error('synthetic current failure'));
  fireEvent.press(screen.getByRole('button', { name: 'Reiniciar rotina' }));
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar reinício' }));
  await screen.findByRole('button', { name: 'Tentar salvar progresso novamente' });
  fireEvent.press(screen.getByRole('button', { name: 'Tentar salvar progresso novamente' }));
  await screen.findByText('Etapa a'); expect(progress).toHaveBeenCalledTimes(3);
});
it('does not revive progress or navigation callbacks after blur and refocus', async () => {
  const view = render(<Session />); await screen.findByText('Etapa a');
  const oldComplete = commandCallback('Concluir etapa atual');
  const oldClose = commandCallback('Voltar às rotinas');
  mockFocused = false; view.rerender(<Session />);
  mockFocused = true; view.rerender(<Session />);
  await act(async () => { oldComplete(); oldClose(); });
  expect(progress).not.toHaveBeenCalled(); expect(onClose).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Concluir etapa atual' }));
  await waitFor(() => expect(progress).toHaveBeenCalledTimes(1));
  expect(routines[0].steps[0].completed).toBe(true);
  await waitFor(() => expect(screen.queryByText('Etapa a')).toBeNull());
});
it('does not revive restart after blur and return to the same completed routine', async () => {
  routines[0].steps = routines[0].steps.map(step => ({ ...step, completed: true }));
  const view = render(<Session />); await screen.findByText('Rotina concluída');
  fireEvent.press(screen.getByRole('button', { name: 'Reiniciar rotina' }));
  const oldConfirm = commandCallback('Confirmar reinício');
  mockFocused = false; view.rerender(<Session />);
  mockFocused = true; view.rerender(<Session />);
  await act(async () => oldConfirm());
  expect(progress).not.toHaveBeenCalled(); expect(screen.queryByRole('button', { name: 'Confirmar reinício' })).toBeNull();
});
it('ignores late failure without unlocking a new pending progress operation', async () => {
  let fail!: (error: Error) => void; let finish!: (rows: Routine[]) => void;
  progress.mockImplementationOnce(() => new Promise<Routine[]>((_, reject) => { fail = reject; }));
  progress.mockImplementationOnce(() => new Promise<Routine[]>((resolve) => { finish = resolve; }));
  const view = render(<Session />); await screen.findByText('Etapa a');
  fireEvent.press(screen.getByRole('button', { name: 'Concluir etapa atual' }));
  mockFocused = false; view.rerender(<Session />);
  mockFocused = true; view.rerender(<Session />);
  fireEvent.press(screen.getByRole('button', { name: 'Concluir etapa atual' }));
  await act(async () => fail(new Error('synthetic old failure')));
  expect(screen.queryByText(/último progresso salvo foi mantido/)).toBeNull();
  expect(screen.getByRole('button', { name: 'Concluir etapa atual' })).toBeDisabled();
  await act(async () => finish([{ ...routines[0], steps: routines[0].steps.map((step, index) => ({ ...step, completed: index === 0 })) }]));
  expect(screen.getByRole('button', { name: 'Concluir etapa atual' })).toBeEnabled();
});
it('invalidates commands when the same mounted player changes routine ID', async () => {
  routines.push({ id: 'other', name: 'Outra', steps: [{ id: 'x', title: 'Outra etapa', imageUri: null }] });
  const view = render(<Session />); await screen.findByText('Etapa a');
  const oldComplete = commandCallback('Concluir etapa atual');
  view.rerender(<Session id="other" />); await screen.findByText('Outra etapa');
  await act(async () => oldComplete()); expect(progress).not.toHaveBeenCalled();
});
it('preserves explicit progress under StrictMode replay', async () => {
  render(<StrictMode><Session /></StrictMode>); await screen.findByText('Etapa a');
  fireEvent.press(screen.getByRole('button', { name: 'Concluir etapa atual' }));
  await waitFor(() => expect(progress).toHaveBeenCalledTimes(1));
  expect(routines[0].steps[0].completed).toBe(true);
  await waitFor(() => expect(screen.queryByText('Etapa a')).toBeNull());
  expect(progress).toHaveBeenCalledTimes(1);
});

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { StrictMode } from 'react';
import { CustomCardEditor } from '../../../../src/features/communication/custom-cards/CustomCardEditor';
import { useCustomCards } from '../../../../src/features/communication/custom-cards/CustomCardsProvider';
import { pickCardImage } from '../../../../src/features/communication/custom-cards/media-picker';
jest.mock('../../../../src/features/communication/custom-cards/CustomCardsProvider', () => ({ useCustomCards: jest.fn() }));
jest.mock('../../../../src/features/communication/custom-cards/media-picker', () => ({ pickCardImage: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let mockFocused = true;
jest.mock('expo-router', () => ({ useFocusEffect: (callback: () => (() => void)) => {
  const React = jest.requireActual<typeof import('react')>('react');
  const focused = mockFocused;
  React.useEffect(() => focused ? callback() : undefined, [callback, focused]);
} }));
const save = jest.fn(); const remove = jest.fn(); const close = jest.fn();
const favorites = { favoriteIds: [], favoriteBusy: false, favoriteError: false, setFavorite: jest.fn(), retryFavorite: jest.fn() };
beforeEach(() => {
  mockFocused = true;
  jest.resetAllMocks(); save.mockResolvedValue(undefined); remove.mockResolvedValue(undefined);
  jest.mocked(useCustomCards).mockReturnValue({ ...favorites, cards: [], loading: false, error: null, retry: jest.fn(), save, remove });
});
function callback(name: string): () => void {
  let node = screen.getByRole('button', { name });
  while (node.parent && typeof node.props.onPress !== 'function') node = node.parent;
  expect(typeof node.props.onPress).toBe('function'); return node.props.onPress as () => void;
}
function existingCard() {
  jest.mocked(useCustomCards).mockReturnValue({ ...favorites, cards: [{ id: 'custom-test', title: 'Teste', categoryId: 'needs', imageUri: null }], loading: false, error: null, retry: jest.fn(), save, remove });
}
it('discards save completion after unmount without cancelling the authorized save', async () => {
  let release!: () => void;
  save.mockReturnValue(new Promise<void>(resolve => { release = resolve; }));
  const view = render(<CustomCardEditor onClose={close} />); fill();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar cartão' }));
  expect(save).toHaveBeenCalledTimes(1); view.unmount();
  await act(async () => release());
  expect(close).not.toHaveBeenCalled();
});
it('does not write through a save callback captured before unmount', async () => {
  const view = render(<CustomCardEditor onClose={close} />); fill();
  const oldSave = callback('Salvar cartão'); view.unmount();
  await act(async () => oldSave());
  expect(save).not.toHaveBeenCalled(); expect(close).not.toHaveBeenCalled();
});
it('revokes a captured delete confirmation when keeping the card', async () => {
  existingCard(); render(<CustomCardEditor id="custom-test" onClose={close} />);
  fireEvent.press(screen.getByRole('button', { name: 'Excluir cartão' }));
  const oldConfirm = callback('Confirmar exclusão');
  fireEvent.press(screen.getByRole('button', { name: 'Manter cartão' }));
  await act(async () => oldConfirm());
  expect(remove).not.toHaveBeenCalled(); expect(close).not.toHaveBeenCalled();
});
function fill() {
  fireEvent.changeText(screen.getByLabelText('Título do cartão'), 'Teste');
  fireEvent.press(screen.getByRole('radio', { name: 'Necessidades' }));
}
it('does not revive save, picker or cancel callbacks after blur and return', async () => {
  const view = render(<CustomCardEditor onClose={close} />); fill();
  const oldSave = callback('Salvar cartão'), oldPicker = callback('Escolher arquivo'), oldCancel = callback('Cancelar');
  mockFocused = false; view.rerender(<CustomCardEditor onClose={close} />);
  mockFocused = true; view.rerender(<CustomCardEditor onClose={close} />);
  await act(async () => { oldSave(); oldPicker(); oldCancel(); });
  expect(save).not.toHaveBeenCalled(); expect(pickCardImage).not.toHaveBeenCalled(); expect(close).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar cartão' }));
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
});
it('discards an old picker result without unlocking a newer save', async () => {
  let image!: (value: { uri: string }) => void, finish!: () => void;
  jest.mocked(pickCardImage).mockReturnValue(new Promise(resolve => { image = resolve; }));
  save.mockReturnValue(new Promise<void>(resolve => { finish = resolve; }));
  const view = render(<CustomCardEditor onClose={close} />); fill();
  fireEvent.press(screen.getByRole('button', { name: 'Escolher arquivo' }));
  mockFocused = false; view.rerender(<CustomCardEditor onClose={close} />);
  mockFocused = true; view.rerender(<CustomCardEditor onClose={close} />);
  fireEvent.press(screen.getByRole('button', { name: 'Salvar cartão' }));
  await act(async () => image({ uri: 'file:///synthetic-old.png' }));
  expect(screen.queryByLabelText('Imagem do cartão')).toBeNull();
  expect(screen.getByRole('button', { name: 'Salvar cartão' })).toBeDisabled();
  expect(save).toHaveBeenCalledTimes(1);
  await act(async () => finish()); expect(close).toHaveBeenCalledTimes(1);
});
it('discards an old save rejection after focus returns', async () => {
  let fail!: (error: Error) => void;
  save.mockReturnValue(new Promise<void>((_, reject) => { fail = reject; }));
  const view = render(<CustomCardEditor onClose={close} />); fill();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar cartão' }));
  mockFocused = false; view.rerender(<CustomCardEditor onClose={close} />);
  mockFocused = true; view.rerender(<CustomCardEditor onClose={close} />);
  await act(async () => fail(new Error('synthetic')));
  expect(screen.queryByText(/Seu preenchimento foi mantido/)).toBeNull(); expect(close).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Salvar cartão' })).toBeEnabled();
});
it('rejects an edited or replaced deletion intent but accepts the current confirmation', async () => {
  existingCard(); render(<CustomCardEditor id="custom-test" onClose={close} />);
  fireEvent.press(screen.getByRole('button', { name: 'Excluir cartão' }));
  const oldConfirm = callback('Confirmar exclusão');
  fireEvent.changeText(screen.getByLabelText('Título do cartão'), 'Outro título');
  fireEvent.press(screen.getByRole('button', { name: 'Excluir cartão' }));
  await act(async () => oldConfirm()); expect(remove).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar exclusão' }));
  await waitFor(() => expect(remove).toHaveBeenCalledTimes(1));
});
it('does not revive callbacks when the card ID changes', async () => {
  existingCard(); const view = render(<CustomCardEditor id="custom-test" onClose={close} />);
  const oldSave = callback('Salvar cartão');
  view.rerender(<CustomCardEditor onClose={close} />);
  await act(async () => oldSave()); expect(save).not.toHaveBeenCalled();
});
it('keeps one authorized save in StrictMode and blocks a callback after cancellation', async () => {
  const view = render(<StrictMode><CustomCardEditor onClose={close} /></StrictMode>); fill();
  const oldSave = callback('Salvar cartão');
  fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
  await act(async () => oldSave()); expect(save).not.toHaveBeenCalled(); expect(close).toHaveBeenCalledTimes(1);
  view.unmount(); close.mockClear();
  render(<StrictMode><CustomCardEditor onClose={close} /></StrictMode>); fill();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar cartão' }));
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1)); expect(close).toHaveBeenCalledTimes(1);
});
it('validates both fields without saving or erasing the draft', () => {
  render(<CustomCardEditor onClose={close} />);
  fireEvent.changeText(screen.getByLabelText('Título do cartão'), '   ');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar cartão' }));
  expect(screen.getByText('Informe o título do cartão.')).toBeOnTheScreen();
  expect(screen.getByText('Selecione uma categoria.')).toBeOnTheScreen();
  expect(screen.getByLabelText('Título do cartão')).toHaveProp('value', '   ');
  expect(save).not.toHaveBeenCalled();
});
it('saves without image only after explicit action', async () => {
  render(<CustomCardEditor onClose={close} />); fill();
  expect(save).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar cartão' }));
  await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
  expect(save).toHaveBeenCalledWith({ title: 'Teste', categoryId: 'needs', imageUri: null }, undefined);
});
it('preserves fields after storage failure, supports retry and does not claim success', async () => {
  save.mockRejectedValueOnce(new Error('private data'));
  render(<CustomCardEditor onClose={close} />); fill();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar cartão' }));
  expect(await screen.findByText(/Seu preenchimento foi mantido/)).toBeOnTheScreen();
  expect(close).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Título do cartão')).toHaveProp('value', 'Teste');
  expect(screen.getByRole('radio', { name: 'Necessidades' })).toBeChecked();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar cartão' }));
  await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
});
it('camera denial still allows saving without image', async () => {
  jest.mocked(pickCardImage).mockResolvedValue({ message: 'Câmera não autorizada. Você pode salvar sem imagem.' });
  render(<CustomCardEditor onClose={close} />); fill();
  fireEvent.press(screen.getByRole('button', { name: 'Usar câmera' }));
  expect(await screen.findByText(/Câmera não autorizada/)).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar cartão' }));
  await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
});
it('does not save when canceled', () => {
  render(<CustomCardEditor onClose={close} />); fill();
  fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
  expect(close).toHaveBeenCalled(); expect(save).not.toHaveBeenCalled();
});
it('requires explicit confirmation for deletion and keeps card on failure', async () => {
  jest.mocked(useCustomCards).mockReturnValue({ ...favorites, cards: [{ id: 'custom-test', title: 'Teste', categoryId: 'needs', imageUri: null }], loading: false, error: null, retry: jest.fn(), save, remove });
  remove.mockRejectedValueOnce(new Error('private data'));
  render(<CustomCardEditor id="custom-test" onClose={close} />);
  fireEvent.press(screen.getByRole('button', { name: 'Excluir cartão' }));
  expect(remove).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar exclusão' }));
  expect(await screen.findByText(/O cartão foi mantido/)).toBeOnTheScreen();
  expect(close).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar exclusão' }));
  await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
});

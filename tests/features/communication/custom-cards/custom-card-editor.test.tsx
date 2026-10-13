import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { CustomCardEditor } from '../../../../src/features/communication/custom-cards/CustomCardEditor';
import { useCustomCards } from '../../../../src/features/communication/custom-cards/CustomCardsProvider';
import { pickCardImage } from '../../../../src/features/communication/custom-cards/media-picker';
jest.mock('../../../../src/features/communication/custom-cards/CustomCardsProvider', () => ({ useCustomCards: jest.fn() }));
jest.mock('../../../../src/features/communication/custom-cards/media-picker', () => ({ pickCardImage: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
const save = jest.fn(); const remove = jest.fn(); const close = jest.fn();
beforeEach(() => {
  jest.resetAllMocks(); save.mockResolvedValue(undefined); remove.mockResolvedValue(undefined);
  jest.mocked(useCustomCards).mockReturnValue({ cards: [], loading: false, error: null, retry: jest.fn(), save, remove });
});
function fill() {
  fireEvent.changeText(screen.getByLabelText('Título do cartão'), 'Teste');
  fireEvent.press(screen.getByRole('radio', { name: 'Necessidades' }));
}
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
  jest.mocked(useCustomCards).mockReturnValue({ cards: [{ id: 'custom-test', title: 'Teste', categoryId: 'needs', imageUri: null }], loading: false, error: null, retry: jest.fn(), save, remove });
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

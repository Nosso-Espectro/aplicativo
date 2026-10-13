import { useEffect, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import StartupScreen from '../../../../src/app';
import { SentenceProvider } from '../../../../src/features/communication/sentence/SentenceProvider';
import { CustomCardsProvider } from '../../../../src/features/communication/custom-cards/CustomCardsProvider';
import { CustomCardEditor } from '../../../../src/features/communication/custom-cards/CustomCardEditor';
import { openCardDatabase } from '../../../../src/features/communication/storage/card-database';
import type { CustomCard } from '../../../../src/features/communication/custom-cards/custom-card-validation';
jest.mock('../../../../src/features/communication/storage/card-database', () => ({ openCardDatabase: jest.fn() }));
jest.mock('../../../../src/features/communication/custom-cards/local-image-storage', () => ({ localImages: { copy: jest.fn(), remove: jest.fn(), prune: jest.fn() } }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
let saved: CustomCard[];
function Session() {
  const [editing, setEditing] = useState<string | null>(null);
  useEffect(() => { mockPush.mockImplementation((route: { params: { id: string } }) => setEditing(route.params.id)); }, []);
  return <SentenceProvider><CustomCardsProvider>
    {editing ? <CustomCardEditor id={editing} onClose={() => setEditing(null)} /> : <StartupScreen />}
  </CustomCardsProvider></SentenceProvider>;
}
beforeEach(() => {
  saved = [{ id: 'custom-test', title: 'Primeiro título', categoryId: 'needs', imageUri: null }];
  mockPush.mockReset();
  jest.mocked(openCardDatabase).mockResolvedValue({
    listFavorites: async () => [], setFavorite: async () => [],
    list: async () => saved,
    save: async (card, id) => { saved = saved.map((item) => item.id === id ? { ...card, id } : item); return saved; },
    remove: async (id) => { saved = saved.filter((item) => item.id !== id); return saved; },
  });
});
it('updates the board after edit without rewriting selected snapshots; delete removes only matching occurrences', async () => {
  render(<Session />);
  await screen.findByRole('button', { name: 'Primeiro título' });
  fireEvent.press(screen.getByRole('button', { name: 'Primeiro título' }));
  fireEvent.press(screen.getByRole('button', { name: 'Sim' }));
  fireEvent.press(screen.getByRole('button', { name: 'Primeiro título' }));
  fireEvent.press(screen.getByRole('button', { name: 'Editar cartão: Primeiro título' }));
  fireEvent.changeText(screen.getByLabelText('Título do cartão'), 'Título atualizado');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar cartão' }));
  await screen.findByRole('button', { name: 'Título atualizado' });
  expect(screen.getByLabelText('1. Primeiro título')).toBeOnTheScreen();
  expect(screen.getByLabelText('3. Primeiro título')).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: 'Editar cartão: Título atualizado' }));
  fireEvent.press(screen.getByRole('button', { name: 'Excluir cartão' }));
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar exclusão' }));
  await waitFor(() => expect(screen.getByLabelText('1. Sim')).toBeOnTheScreen());
  expect(screen.queryByLabelText('1. Primeiro título')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Título atualizado' })).toBeNull();
});
it('keeps initial cards usable after storage failure and recovers on retry', async () => {
  jest.mocked(openCardDatabase).mockRejectedValueOnce(new Error('private path'));
  render(<Session />);
  await screen.findByText(/Não foi possível abrir os cartões e favoritos salvos/);
  fireEvent.press(screen.getByRole('button', { name: 'Sim' }));
  expect(screen.getByLabelText('1. Sim')).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: 'Tentar abrir cartões novamente' }));
  expect(await screen.findByRole('button', { name: 'Primeiro título' })).toBeOnTheScreen();
  expect(screen.getByLabelText('1. Sim')).toBeOnTheScreen();
});

import { useEffect, useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import StartupScreen from '../../../../src/app';
import FavoritesScreen from '../../../../src/app/favorites';
import { SentenceProvider } from '../../../../src/features/communication/sentence/SentenceProvider';
import { CustomCardsProvider } from '../../../../src/features/communication/custom-cards/CustomCardsProvider';
import { CustomCardEditor } from '../../../../src/features/communication/custom-cards/CustomCardEditor';
import { openCardDatabase } from '../../../../src/features/communication/storage/card-database';
import type { CustomCard } from '../../../../src/features/communication/custom-cards/custom-card-validation';
jest.mock('../../../../src/features/communication/storage/card-database', () => ({ openCardDatabase: jest.fn() }));
jest.mock('../../../../src/features/communication/custom-cards/local-image-storage', () => ({ localImages: { copy: jest.fn(), remove: jest.fn(), prune: jest.fn() } }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
const mockPush = jest.fn(); const mockBack = jest.fn();
jest.mock('expo-router', () => ({ useFocusEffect: (effect: () => void) => jest.requireActual('react').useEffect(effect, [effect]),
  useRouter: () => ({ push: mockPush, back: mockBack, canGoBack: () => true }) }));
let favoriteIds: string[]; let cards: CustomCard[];
const setFavorite = jest.fn();
function Session({ initial = 'board' }: { initial?: string }) {
  const [route, setRoute] = useState(initial);
  useEffect(() => {
    mockPush.mockImplementation((target: string | { params: { id: string } }) => setRoute(typeof target === 'string' ? target : target.params.id));
    mockBack.mockImplementation(() => setRoute('board'));
  }, []);
  return <SentenceProvider><CustomCardsProvider>
    {route === 'board' ? <StartupScreen /> : route === '/favorites' ? <FavoritesScreen /> : <CustomCardEditor id={route} onClose={() => setRoute('/favorites')} />}
  </CustomCardsProvider></SentenceProvider>;
}
beforeEach(() => {
  jest.clearAllMocks(); favoriteIds = []; cards = [];
  setFavorite.mockReset();
  setFavorite.mockImplementation(async (id: string, selected: boolean) => {
    favoriteIds = selected ? [...favoriteIds.filter((item) => item !== id), id] : favoriteIds.filter((item) => item !== id);
    return [...favoriteIds];
  });
  jest.mocked(openCardDatabase).mockResolvedValue({
    list: async () => [...cards], listFavorites: async () => [...favoriteIds], setFavorite,
    save: async (draft, id) => { cards = cards.map((card) => card.id === id ? { ...draft, id } : card); return [...cards]; },
    remove: async (id) => { cards = cards.filter((card) => card.id !== id); favoriteIds = favoriteIds.filter((item) => item !== id); return [...cards]; },
  });
});
it('offers direct favorites access and an informative empty state — RF-018', async () => {
  render(<Session />);

  await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Favorito: Sim' })).toBeEnabled());

  fireEvent.press(screen.getByRole('button', { name: 'Abrir ferramentas' }));
  fireEvent.press(screen.getByRole('button', { name: 'Abrir favoritos' }));
  expect(screen.getByText('Ainda não há cartões favoritos.')).toBeOnTheScreen();
  expect(screen.getByRole('header', { name: 'Favoritos' })).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: 'Voltar ao quadro' }));

  expect(screen.getByRole('button', { name: 'Sim' })).toBeOnTheScreen();
});
it('marks, unmarks and refavorites in order, retains the sentence and restores favorites in a new session', async () => {
  const view = render(<Session />);

  await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Favorito: Sim' })).toBeEnabled());
  fireEvent.press(screen.getByRole('checkbox', { name: 'Favorito: Sim' }));
  await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Favorito: Sim' })).toBeChecked());
  fireEvent.press(screen.getByRole('checkbox', { name: 'Favorito: Ajuda' }));
  await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Favorito: Ajuda' })).toBeChecked());
  fireEvent.press(screen.getByRole('checkbox', { name: 'Favorito: Sim' }));
  await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Favorito: Sim' })).not.toBeChecked());
  fireEvent.press(screen.getByRole('checkbox', { name: 'Favorito: Sim' }));
  await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Favorito: Sim' })).toBeChecked());

  fireEvent.press(screen.getByRole('button', { name: 'Abrir ferramentas' }));
  fireEvent.press(screen.getByRole('button', { name: 'Abrir favoritos' }));
  expect(screen.getAllByRole('checkbox').map((item) => item.props.accessibilityLabel)).toEqual(['Favorito: Ajuda', 'Favorito: Sim']);
  fireEvent.press(screen.getByRole('button', { name: 'Ajuda' }));
  expect(screen.getByLabelText('1. Ajuda')).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: 'Voltar ao quadro' }));
  expect(screen.getByLabelText('1. Ajuda')).toBeOnTheScreen();
  view.unmount(); render(<Session initial="/favorites" />);
  await screen.findByRole('checkbox', { name: 'Favorito: Sim' });
  expect(screen.getAllByRole('checkbox').map((item) => item.props.accessibilityLabel)).toEqual(['Favorito: Ajuda', 'Favorito: Sim']);
  expect(screen.getByText('Frase vazia')).toBeOnTheScreen();
});
it('keeps last saved marking and order on failure, hides exception content and retries', async () => {
  favoriteIds = ['yes'];
  setFavorite.mockRejectedValueOnce(new Error('private content'));
  render(<Session />);

  await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Favorito: Sim' })).toBeChecked());
  fireEvent.press(screen.getByRole('checkbox', { name: 'Favorito: Ajuda' }));
  expect(await screen.findByText(/A ordem salva foi mantida/)).toBeOnTheScreen();
  expect(screen.queryByText('private content')).toBeNull();
  expect(screen.getByRole('checkbox', { name: 'Favorito: Sim' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'Favorito: Ajuda' })).not.toBeChecked();
  fireEvent.press(screen.getByRole('button', { name: 'Tentar salvar favoritos novamente' }));
  await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Favorito: Ajuda' })).toBeChecked());

  fireEvent.press(screen.getByRole('button', { name: 'Abrir ferramentas' }));
  fireEvent.press(screen.getByRole('button', { name: 'Abrir favoritos' }));
  expect(screen.getAllByRole('checkbox').map((item) => item.props.accessibilityLabel)).toEqual(['Favorito: Sim', 'Favorito: Ajuda']);
});
it('never displays success optimistically and prevents duplicate pending requests', async () => {
  let finish!: (ids: string[]) => void;
  setFavorite.mockImplementationOnce(() => new Promise<string[]>((resolve) => { finish = resolve; }));
  render(<Session />);

  await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Favorito: Sim' })).toBeEnabled());
  fireEvent.press(screen.getByRole('checkbox', { name: 'Favorito: Sim' }));
  expect(screen.getByRole('checkbox', { name: 'Favorito: Sim' })).not.toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'Favorito: Sim' })).toBeDisabled();
  fireEvent.press(screen.getByRole('checkbox', { name: 'Favorito: Sim' }));
  expect(setFavorite).toHaveBeenCalledTimes(1);
  await act(async () => { finish(['yes']); });
  expect(screen.getByRole('checkbox', { name: 'Favorito: Sim' })).toBeChecked();
});
it('shows edited custom content without changing sentence snapshots, and removes deleted favorites', async () => {
  cards = [{ id: 'custom-test', title: 'Teste', categoryId: 'needs', imageUri: null }]; favoriteIds = ['custom-test', 'yes'];
  render(<Session initial="/favorites" />);
  await screen.findByRole('button', { name: 'Teste' });
  fireEvent.press(screen.getByRole('button', { name: 'Teste' }));
  fireEvent.press(screen.getByRole('button', { name: 'Editar cartão: Teste' }));
  fireEvent.changeText(screen.getByLabelText('Título do cartão'), 'Editado');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar cartão' }));
  await screen.findByRole('button', { name: 'Editado' });
  expect(screen.getByLabelText('1. Teste')).toBeOnTheScreen();
  expect(screen.getAllByRole('checkbox').map((item) => item.props.accessibilityLabel)).toEqual(['Favorito: Editado', 'Favorito: Sim']);
  fireEvent.press(screen.getByRole('button', { name: 'Editar cartão: Editado' }));
  fireEvent.press(screen.getByRole('button', { name: 'Excluir cartão' }));
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar exclusão' }));
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Editado' })).toBeNull());
  expect(screen.getAllByRole('checkbox').map((item) => item.props.accessibilityLabel)).toEqual(['Favorito: Sim']);
  expect(screen.getByText('Frase vazia')).toBeOnTheScreen();
});

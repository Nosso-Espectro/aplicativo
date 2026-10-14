import { useEffect, useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RootLayout from '../../../src/app/_layout';
import RoutinesLayout from '../../../src/app/routines/_layout';
import StartupScreen from '../../../src/app';
import FavoritesScreen from '../../../src/app/favorites';
import { LowStimulationProvider } from '../../../src/features/regulation/LowStimulationProvider';
import { LowStimulationControl } from '../../../src/features/regulation/LowStimulationControl';
import { SentenceProvider } from '../../../src/features/communication/sentence/SentenceProvider';
import { CustomCardsProvider } from '../../../src/features/communication/custom-cards/CustomCardsProvider';
import { initialCards } from '../../../src/features/communication/board/initial-cards';
import { openCardDatabase } from '../../../src/features/communication/storage/card-database';
import { openDisplayPreferencesDatabase } from '../../../src/features/regulation/display-preferences-database';
import { localSpeech } from '../../../src/features/communication/speech/local-speech';
jest.mock('../../../src/features/regulation/display-preferences-database', () => ({ openDisplayPreferencesDatabase: jest.fn() }));
jest.mock('../../../src/features/communication/storage/card-database', () => ({ openCardDatabase: jest.fn() }));
jest.mock('../../../src/features/communication/custom-cards/local-image-storage', () => ({ localImages: { copy: jest.fn(), remove: jest.fn(), prune: jest.fn() } }));
jest.mock('../../../src/features/communication/speech/local-speech', () => ({ localSpeech: { isAvailable: jest.fn(), speak: jest.fn(), stop: jest.fn() } }));
jest.mock('../../../src/features/routines/RoutineProvider', () => ({ RoutineProvider: ({ children }: { children: React.ReactNode }) => children }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
const mockPush = jest.fn(); const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useFocusEffect: (effect: () => void) => jest.requireActual('react').useEffect(effect, [effect]),
  useRouter: () => ({ push: mockPush, back: mockBack, canGoBack: () => true }),
  Stack: ({ screenOptions }: { screenOptions: { animation: string } }) => {
    const { Text } = jest.requireActual('react-native');
    return <Text>{`Stack:${screenOptions.animation}`}</Text>;
  },
}));
const save = jest.fn();
let motionEvent: (enabled: boolean) => void;
beforeEach(() => {
  jest.clearAllMocks(); save.mockReset().mockImplementation(async (value: { enabled: boolean }) => ({ ...value }));
  jest.mocked(openDisplayPreferencesDatabase).mockResolvedValue({ read: async () => ({ enabled: false }), save });
  jest.mocked(openCardDatabase).mockResolvedValue({ list: async () => [], listFavorites: async () => ['yes'],
    setFavorite: async () => ['yes'], save: async () => [], remove: async () => [], });
  jest.mocked(localSpeech.isAvailable).mockResolvedValue(true); jest.mocked(localSpeech.speak).mockResolvedValue(undefined);
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(((_event: string, listener: (enabled: boolean) => void) => {
    motionEvent = listener; return { remove: jest.fn() };
  }) as unknown as typeof AccessibilityInfo.addEventListener);
});
afterEach(() => jest.restoreAllMocks());
const toggle = () => screen.getByRole('switch', { name: 'Modo de baixa estimulação' });
function Screens() {
  const [route, setRoute] = useState('board');
  useEffect(() => { mockPush.mockImplementation((target: string) => setRoute(target)); mockBack.mockImplementation(() => setRoute('board')); }, []);
  return <LowStimulationProvider><LowStimulationControl /><SentenceProvider><CustomCardsProvider>
    {route === '/favorites' ? <FavoritesScreen /> : <StartupScreen />}
  </CustomCardsProvider></SentenceProvider></LowStimulationProvider>;
}
it('applies confirmed animation and system motion to the real root Stack without remounting its control — spec005/RF-001', async () => {
  render(<RootLayout />); expect(screen.getByText('Stack:none')).toBeOnTheScreen();
  await screen.findByText('Stack:default'); fireEvent(toggle(), 'valueChange', true);
  await waitFor(() => expect(toggle()).toBeChecked()); expect(screen.getByText('Stack:none')).toBeOnTheScreen();
  fireEvent(toggle(), 'valueChange', false); await waitFor(() => expect(toggle()).not.toBeChecked());
  expect(screen.getByText('Stack:default')).toBeOnTheScreen();
  act(() => motionEvent(true)); expect(screen.getByText('Stack:none')).toBeOnTheScreen(); expect(toggle()).not.toBeChecked();
  expect(save).toHaveBeenCalledTimes(2);
});
it('also disables the nested routines Stack; system motion is not mistaken for a saved choice', async () => {
  render(<LowStimulationProvider><LowStimulationControl /><RoutinesLayout /></LowStimulationProvider>);
  await screen.findByText('Stack:default'); act(() => motionEvent(true)); expect(screen.getByText('Stack:none')).toBeOnTheScreen();
  act(() => motionEvent(false)); fireEvent(toggle(), 'valueChange', true); await waitFor(() => expect(toggle()).toBeChecked());
  expect(screen.getByText('Stack:none')).toBeOnTheScreen();
});
it('retains sentences, saved favorites and navigation across a global mode change — spec005/RF-003', async () => {
  render(<Screens />);
  await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Favorito: Sim' })).toBeEnabled());
  fireEvent.press(screen.getByRole('button', { name: 'Sim' }));
   expect(screen.getByLabelText('1. Sim')).toBeOnTheScreen();
  fireEvent(toggle(), 'valueChange', true); await waitFor(() => expect(toggle()).toBeChecked());
  expect(screen.getByLabelText('1. Sim')).toBeOnTheScreen(); expect(localSpeech.speak).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Abrir ferramentas' }));
  fireEvent.press(screen.getByRole('button', { name: 'Abrir favoritos' }));
  expect(toggle()).toBeChecked(); expect(screen.getByRole('header', { name: 'Favoritos' })).toBeOnTheScreen();
  expect(screen.getByRole('checkbox', { name: 'Favorito: Sim' })).toBeChecked();
  expect(screen.UNSAFE_getAllByType(Image)).toHaveLength(2);
  fireEvent.press(screen.getByRole('button', { name: 'Ler frase' }));
  await waitFor(() => expect(localSpeech.speak).toHaveBeenCalledWith('Sim'));
  fireEvent.press(screen.getByRole('button', { name: 'Voltar ao quadro' }));
  expect(screen.getByRole('header', { name: 'Frase' })).toBeOnTheScreen(); expect(toggle()).toBeChecked();
  fireEvent(toggle(), 'valueChange', false); await waitFor(() => expect(toggle()).not.toBeChecked());
  expect(screen.getByLabelText('1. Sim')).toBeOnTheScreen();
});
it('keeps card preview, its essential image and return usable in low stimulation', async () => {
  render(<Screens />); await waitFor(() => expect(toggle()).toBeEnabled());
  fireEvent(toggle(), 'valueChange', true); await waitFor(() => expect(toggle()).toBeChecked());

  fireEvent.press(screen.getByRole('button', { name: 'Mostrar cartão: Sim' }));
  expect(screen.getByRole('header', { name: 'Sim' })).toBeOnTheScreen();
  const modal = screen.UNSAFE_getAllByType(SafeAreaView).find((view) => view.props.accessibilityViewIsModal);
  expect(modal).toBeDefined();
  const images = modal!.findAllByType(Image);
  expect(images).toHaveLength(1);
  expect(images[0].props.source).toEqual(initialCards.find((card) => card.id === 'yes')?.pictogram);
  fireEvent.press(screen.getByRole('button', { name: 'Voltar ao quadro' }));
  expect(screen.getByRole('button', { name: 'Sim' })).toBeOnTheScreen();
   expect(toggle()).toBeChecked();
});

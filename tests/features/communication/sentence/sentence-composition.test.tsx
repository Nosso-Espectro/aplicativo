import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';
import StartupScreen from '../../../../src/app';
import { SentenceProvider } from '../../../../src/features/communication/sentence/SentenceProvider';
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
jest.mock('expo-router', () => ({ ...jest.requireActual('expo-router'), useFocusEffect: (effect: () => void) => jest.requireActual('react').useEffect(effect, [effect]) }));
jest.mock('../../../../src/features/communication/custom-cards/CustomCardsProvider', () => ({
  useCustomCards: () => ({ cards: [], loading: false, error: null }),
}));

function App() {
  return <SentenceProvider><StartupScreen /></SentenceProvider>;
}

describe('US-002 composition workflow', () => {
  it('composes in order across categories, removes one occurrence and clears', () => {
    render(<App />);
    fireEvent.press(screen.getByRole('button', { name: 'Abrir Comunicação' }));
    fireEvent.press(screen.getByRole('button', { name: 'Necessidades' }));
    fireEvent.press(screen.getByRole('button', { name: 'Água' }));
    fireEvent.press(screen.getByRole('button', { name: 'Solicitações' }));
    fireEvent.press(screen.getByRole('button', { name: 'Ajuda' }));
    fireEvent.press(screen.getByRole('button', { name: 'Sim' }));
    fireEvent.press(screen.getByRole('button', { name: 'Fechar Comunicação' }));
    expect(screen.getByLabelText('1. Água')).toBeOnTheScreen();
    expect(screen.getByLabelText('2. Ajuda')).toBeOnTheScreen();
    expect(screen.getByLabelText('3. Sim')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Remover Ajuda da posição 2' }));
    expect(screen.getByLabelText('2. Sim')).toBeOnTheScreen();
    expect(screen.queryByLabelText('2. Ajuda')).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'Limpar frase' }));
    expect(screen.getByText('Frase vazia')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Limpar frase' })).toBeDisabled();
  });

  it('keeps composition when showing a card and returning without external actions', () => {
    const openUrl = jest.spyOn(Linking, 'openURL');
    try {
      render(<App />);
      fireEvent.press(screen.getByRole('button', { name: 'Abrir Comunicação' }));
      fireEvent.press(screen.getByRole('button', { name: 'Água' }));
      fireEvent.press(screen.getByRole('button', { name: 'Mostrar cartão: Água' }));
      fireEvent.press(screen.getByRole('button', { name: 'Voltar ao quadro' }));
      fireEvent.press(screen.getByRole('button', { name: 'Fechar Comunicação' }));
      expect(screen.getByLabelText('1. Água')).toBeOnTheScreen();
      expect(openUrl).not.toHaveBeenCalled();
    } finally {
      openUrl.mockRestore();
    }
  });

  it('preserves state when a route unmounts, and resets when the session provider remounts', () => {
    function Session({ visible }: { visible: boolean }) {
      return <SentenceProvider>{visible ? <StartupScreen /> : null}</SentenceProvider>;
    }
    const view = render(<Session visible />);
    fireEvent.press(screen.getByRole('button', { name: 'Abrir Comunicação' }));
    fireEvent.press(screen.getByRole('button', { name: 'Sim' }));
    view.rerender(<Session visible={false} />);
    view.rerender(<Session visible />);
    expect(screen.getByLabelText('1. Sim')).toBeOnTheScreen();
    view.unmount();
    render(<Session visible />);
    expect(screen.getByText('Frase vazia')).toBeOnTheScreen();
  });
});

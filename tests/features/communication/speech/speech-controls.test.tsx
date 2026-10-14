import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { StrictMode } from 'react';
import { SpeechControls } from '../../../../src/features/communication/speech/SpeechControls';
import { localSpeech } from '../../../../src/features/communication/speech/local-speech';
import StartupScreen from '../../../../src/app';
import { SentenceProvider } from '../../../../src/features/communication/sentence/SentenceProvider';
jest.mock('expo-router', () => ({ ...jest.requireActual('expo-router'), useFocusEffect: (effect: () => void) => jest.requireActual('react').useEffect(effect, [effect]) }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
jest.mock('../../../../src/features/communication/custom-cards/CustomCardsProvider', () => ({
  useCustomCards: () => ({ cards: [], loading: false, error: null }),
}));

jest.mock('../../../../src/features/communication/speech/local-speech', () => ({
  localSpeech: {
    isAvailable: jest.fn(),
    speak: jest.fn(),
    stop: jest.fn(),
  },
}));

const speech = jest.mocked(localSpeech);
function commandCallback(name: string): () => void {
  let node = screen.getByRole('button', { name });
  while (node.parent && typeof node.props.onPress !== 'function') node = node.parent;
  expect(typeof node.props.onPress).toBe('function'); return node.props.onPress as () => void;
}

describe('US-003 explicit speech controls (RF-009/RF-011)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    speech.isAvailable.mockResolvedValue(true);
    speech.speak.mockResolvedValue(undefined);
    speech.stop.mockResolvedValue(undefined);
  });

  it('does not speak automatically when the sentence changes', () => {
    const view = render(<SpeechControls text="Água" />);
    view.rerender(<SpeechControls text="Água ajuda" />);
    expect(speech.isAvailable).not.toHaveBeenCalled();
    expect(speech.speak).not.toHaveBeenCalled();
  });

  it('orients an empty sentence without querying or using the voice', () => {
    render(<SpeechControls text="  " />);
    fireEvent.press(screen.getByRole('button', { name: 'Ler frase' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/Monte uma frase/);
    expect(speech.isAvailable).not.toHaveBeenCalled();
    expect(speech.speak).not.toHaveBeenCalled();
  });

  it('starts only explicitly, exposes stop on the same control, and returns to idle', async () => {
    let complete!: () => void;
    speech.speak.mockImplementation(() => new Promise<void>((resolve) => { complete = resolve; }));
    render(<SpeechControls text="Água ajuda" />);
    fireEvent.press(screen.getByRole('button', { name: 'Ler frase' }));
    await waitFor(() => expect(speech.speak).toHaveBeenCalledWith('Água ajuda'));
    fireEvent.press(screen.getByRole('button', { name: 'Interromper leitura' }));
    await waitFor(() => expect(speech.stop).toHaveBeenCalledTimes(1));
    await act(async () => { complete(); });
    expect(screen.getByRole('button', { name: 'Ler frase' })).toBeOnTheScreen();
  });

  it('explains voice absence and keeps the visual flow usable', async () => {
    speech.isAvailable.mockResolvedValue(false);
    render(<SpeechControls text="Ajuda" />);
    fireEvent.press(screen.getByRole('button', { name: 'Ler frase' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Não há voz local/);
    expect(speech.speak).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Ler frase' })).toBeOnTheScreen();
  });

  it.each(['isAvailable', 'speak'] as const)('handles %s failure without exposing native errors', async (method) => {
    speech[method].mockRejectedValue(new Error('private native details'));
    render(<SpeechControls text="Ajuda" />);
    fireEvent.press(screen.getByRole('button', { name: 'Ler frase' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/A mensagem continua visível/);
    expect(screen.queryByText('private native details')).toBeNull();
  });

  it('does not start speech after cancelling an outstanding voice query', async () => {
    let available!: (value: boolean) => void;
    speech.isAvailable.mockImplementation(() => new Promise<boolean>((resolve) => { available = resolve; }));
    render(<SpeechControls text="Ajuda" />);
    fireEvent.press(screen.getByRole('button', { name: 'Ler frase' }));
    await act(async () => {});
    fireEvent.press(screen.getByRole('button', { name: 'Interromper leitura' }));
    await act(async () => { available(true); });
    expect(speech.speak).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Ler frase' })).toBeOnTheScreen();
  });

  it('stops playback when the controls unmount', async () => {
    speech.speak.mockReturnValue(new Promise<void>(() => {}));
    const view = render(<SpeechControls text="Ajuda" />);
    fireEvent.press(screen.getByRole('button', { name: 'Ler frase' }));
    await waitFor(() => expect(speech.speak).toHaveBeenCalledTimes(1));
    view.unmount();
    expect(speech.stop).toHaveBeenCalledTimes(1);
  });

  it('allows retrying interruption after a stop failure', async () => {
    let complete!: () => void;
    speech.speak.mockImplementation(() => new Promise<void>((resolve) => { complete = resolve; }));
    speech.stop.mockRejectedValueOnce(new Error('stop failed'));
    render(<SpeechControls text="Ajuda" />);
    fireEvent.press(screen.getByRole('button', { name: 'Ler frase' }));
    await waitFor(() => expect(speech.speak).toHaveBeenCalledTimes(1));
    fireEvent.press(screen.getByRole('button', { name: 'Interromper leitura' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Não foi possível interromper/);
    fireEvent.press(screen.getByRole('button', { name: 'Interromper leitura' }));
    await act(async () => { complete(); });
    expect(speech.stop).toHaveBeenCalledTimes(2);
  });

  it('does not stop a newer instance through a callback captured before unmount', async () => {
    let oldDone!: () => void, newDone!: () => void;
    speech.speak.mockReturnValueOnce(new Promise<void>(resolve => { oldDone = resolve; }))
      .mockReturnValueOnce(new Promise<void>(resolve => { newDone = resolve; }));
    const oldView = render(<SpeechControls text="Mensagem antiga sintética" />);
    fireEvent.press(screen.getByRole('button', { name: 'Ler frase' }));
    await waitFor(() => expect(speech.speak).toHaveBeenCalledTimes(1));
    const oldStop = commandCallback('Interromper leitura'); oldView.unmount();
    await act(async () => {}); expect(speech.stop).toHaveBeenCalledTimes(1);
    render(<SpeechControls text="Mensagem nova sintética" />);
    fireEvent.press(screen.getByRole('button', { name: 'Ler frase' }));
    await waitFor(() => expect(speech.speak).toHaveBeenCalledTimes(2));
    await act(async () => oldStop());
    expect(speech.stop).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Interromper leitura' })).toBeOnTheScreen();
    await act(async () => { oldDone(); newDone(); });
  });

  it('keeps current read and stop usable after StrictMode effect replay', async () => {
    let complete!: () => void;
    speech.speak.mockReturnValue(new Promise<void>(resolve => { complete = resolve; }));
    const view = render(<StrictMode><SpeechControls text="Mensagem sintética" /></StrictMode>);
    fireEvent.press(screen.getByRole('button', { name: 'Ler frase' }));
    await waitFor(() => expect(speech.speak).toHaveBeenCalledTimes(1));
    fireEvent.press(screen.getByRole('button', { name: 'Interromper leitura' }));
    await waitFor(() => expect(speech.stop).toHaveBeenCalledTimes(1));
    await act(async () => complete());
    const oldRead = commandCallback('Ler frase'); view.unmount();
    await act(async () => oldRead());
    expect(speech.isAvailable).toHaveBeenCalledTimes(1); expect(speech.speak).toHaveBeenCalledTimes(1);
    expect(speech.stop).toHaveBeenCalledTimes(1);
  });

  it('keeps the selected sentence visible when local voice is unavailable', async () => {
    speech.isAvailable.mockResolvedValue(false);
    render(<SentenceProvider><StartupScreen /></SentenceProvider>);

    fireEvent.press(screen.getByRole('button', { name: 'Ajuda' }));

    expect(speech.isAvailable).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', { name: 'Ler frase' }));
    await screen.findByRole('alert');
    expect(screen.getByLabelText('1. Ajuda')).toBeOnTheScreen();
    expect(speech.speak).not.toHaveBeenCalled();
  });
});

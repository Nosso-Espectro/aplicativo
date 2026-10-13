import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert, Image, Linking } from 'react-native';
import { CommunicationBoard } from '../../../../src/features/communication/board/CommunicationBoard';
import { initialCards } from '../../../../src/features/communication/board/initial-cards';

describe('US-001 board navigation (RF-001/RF-003/RF-004)', () => {
  it('exposes all ten messages on first opening without requesting network access', () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    try {
      render(<CommunicationBoard />);
      for (const card of initialCards) {
        expect(screen.getByRole('button', { name: card.title })).toBeOnTheScreen();
      }
      const images = screen.UNSAFE_getAllByType(Image);
      expect(images).toHaveLength(initialCards.length + 1);
      expect(screen.getByRole('header', { name: 'TEAr' })).toBeOnTheScreen();
      images.forEach((image) => {
        expect(image.props.source).toBeTruthy();
        expect(image.props.accessible).toBe(false);
      });
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it.each(initialCards)('reaches $title in two taps through its category and returns', (card) => {
    render(<CommunicationBoard />);
    const categoryLabels = { needs: 'Necessidades', feelings: 'Sentimentos', requests: 'Solicitações' };
    const category = screen.getByRole('button', { name: categoryLabels[card.categoryId] });
    fireEvent.press(category);
    expect(screen.getByRole('button', {
      name: categoryLabels[card.categoryId], selected: true,
    })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: card.title }));
    expect(screen.getByRole('header', { name: card.title })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Voltar ao quadro' }));
    expect(screen.getByRole('button', { name: card.title })).toBeOnTheScreen();
  });

  it('filters categories and restores the complete board', () => {
    render(<CommunicationBoard />);
    fireEvent.press(screen.getByRole('button', { name: 'Sentimentos' }));
    expect(screen.queryByRole('button', { name: 'Água' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Dor' })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Todos' }));
    expect(screen.getByRole('button', { name: 'Água' })).toBeOnTheScreen();
  });

  it('communicates absence of data', () => {
    render(<CommunicationBoard cards={[]} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Nenhum cartão disponível.');
  });

  it('opens the provided attribution search only after an explicit action', () => {
    const openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    try {
      render(<CommunicationBoard />);
      fireEvent.press(screen.getByRole('button', { name: 'Água' }));
      expect(openUrl).not.toHaveBeenCalled();
      fireEvent.press(screen.getByRole('link', { name: 'Pictograma de Água: Flaticon' }));
      expect(openUrl).toHaveBeenCalledWith(
        'https://www.flaticon.com/search?word=glass%20of%20water',
      );
    } finally {
      openUrl.mockRestore();
    }
  });

  it('keeps the message available if opening the attribution fails', async () => {
    const openUrl = jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('unavailable'));
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    try {
      render(<CommunicationBoard />);
      fireEvent.press(screen.getByRole('button', { name: 'Sim' }));
      fireEvent.press(screen.getByRole('link', { name: 'Pictograma de Sim: Flaticon' }));
      await waitFor(() => expect(alert).toHaveBeenCalledWith('Não foi possível abrir o link.'));
      expect(screen.getByRole('header', { name: 'Sim' })).toBeOnTheScreen();
    } finally {
      openUrl.mockRestore();
      alert.mockRestore();
    }
  });
});

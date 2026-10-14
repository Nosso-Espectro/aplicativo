import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { QuickPanelScreen } from '../../../src/features/regulation/QuickPanelScreen';
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
it('offers four named, scalable 64dp commands without activation on render', () => {
  const open = jest.fn(); render(<QuickPanelScreen onOpen={open} onClose={jest.fn()} />);
  expect(open).not.toHaveBeenCalled();
  for (const [id, label] of [['communication', 'Comunicação'], ['sounds', 'Sons'], ['timer', 'Timer de transição'], ['contact', 'Contato de confiança']]) {
    const button = screen.getByRole('button', { name: label });
    expect(StyleSheet.flatten(button.props.style).minHeight).toBe(64);
    fireEvent.press(button); expect(open).toHaveBeenLastCalledWith(id);
    expect(screen.getByText(label).props.allowFontScaling).not.toBe(false);
  }
});
it('keeps return independent from any destination or data', () => {
  const close = jest.fn(); const open = jest.fn(); render(<QuickPanelScreen onOpen={open} onClose={close} />);
  fireEvent.press(screen.getByRole('button', { name: 'Voltar ao quadro' }));
  expect(close).toHaveBeenCalledTimes(1); expect(open).not.toHaveBeenCalled();
});

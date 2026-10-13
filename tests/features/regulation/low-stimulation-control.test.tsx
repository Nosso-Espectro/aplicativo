import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { StrictMode } from 'react';
import * as ReactNative from 'react-native';
import { LowStimulationProvider, useLowStimulationPresentation } from '../../../src/features/regulation/LowStimulationProvider';
import { LowStimulationControl } from '../../../src/features/regulation/LowStimulationControl';
import { openDisplayPreferencesDatabase } from '../../../src/features/regulation/display-preferences-database';
import { CommunicationBoard } from '../../../src/features/communication/board/CommunicationBoard';
import { initialCards } from '../../../src/features/communication/board/initial-cards';
import type { LowStimulationPreference } from '../../../src/features/regulation/low-stimulation';
jest.mock('../../../src/features/regulation/display-preferences-database', () => ({ openDisplayPreferencesDatabase: jest.fn() }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
const { AccessibilityInfo, Dimensions, Image, Text } = ReactNative;
const originalDimensions = { window: Dimensions.get('window'), screen: Dimensions.get('screen') };
let saved: LowStimulationPreference;
const read = jest.fn(); const save = jest.fn(); const remove = jest.fn(); const select = jest.fn(); const favorite = jest.fn();
let motionEvent: (enabled: boolean) => void;
function Animation() { return <Text>{useLowStimulationPresentation().navigationAnimation}</Text>; }
function Session() {
  return <LowStimulationProvider><LowStimulationControl /><Animation />
    <CommunicationBoard onSelectCard={select} onFavorite={favorite} />
  </LowStimulationProvider>;
}
beforeEach(() => {
  jest.clearAllMocks(); saved = { enabled: false };
  read.mockReset().mockImplementation(async () => ({ ...saved }));
  save.mockReset().mockImplementation(async (value: LowStimulationPreference) => { saved = { ...value }; return { ...saved }; });
  jest.mocked(openDisplayPreferencesDatabase).mockResolvedValue({ read, save });
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  const dimensions = { width: 390, height: 844, scale: 1, fontScale: 1 };
  Dimensions.set({ window: dimensions, screen: dimensions });
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(((_event: string, listener: (enabled: boolean) => void) => {
    motionEvent = listener; return { remove };
  }) as unknown as typeof AccessibilityInfo.addEventListener);
});
afterEach(() => { jest.restoreAllMocks(); Dimensions.set(originalDimensions); });
const toggle = () => screen.getByRole('switch', { name: 'Modo de baixa estimulação' });
it('starts calmly while unknown without blocking communication or claiming a restored mode', async () => {
  let finish!: (value: LowStimulationPreference) => void;
  read.mockImplementationOnce(() => new Promise<LowStimulationPreference>((resolve) => { finish = resolve; }));
  render(<Session />);
  expect(screen.queryByRole('switch', { name: 'Modo de baixa estimulação' })).toBeNull();
  expect(screen.getByText('Abrindo preferência…')).toBeOnTheScreen(); expect(screen.getByText('none')).toBeOnTheScreen();
  expect(screen.UNSAFE_getAllByType(Image)).toHaveLength(initialCards.length);
  fireEvent.press(screen.getByRole('button', { name: 'Sim' })); expect(select).toHaveBeenCalledWith(initialCards.find((item) => item.id === 'yes'));
  await waitFor(() => expect(read).toHaveBeenCalledTimes(1));
  await act(async () => { finish({ enabled: false }); });
  expect(toggle()).toBeEnabled(); expect(screen.getByText('default')).toBeOnTheScreen();
  expect(screen.UNSAFE_getAllByType(Image)).toHaveLength(initialCards.length + 1);
});
it('activates/deactivates in one change and removes only decorative imagery — spec005/RF-001/RF-003', async () => {
  render(<Session />); await waitFor(() => expect(toggle()).toBeEnabled());
  fireEvent(toggle(), 'valueChange', true); await waitFor(() => expect(toggle()).toBeChecked());
  expect(screen.getByText('none')).toBeOnTheScreen(); expect(screen.getByRole('header', { name: 'TEAr' })).toBeOnTheScreen();
  expect(screen.UNSAFE_getAllByType(Image)).toHaveLength(initialCards.length);
  for (const card of initialCards) expect(screen.getByRole('button', { name: card.title })).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('checkbox', { name: 'Favorito: Sim' })); expect(favorite).toHaveBeenCalledWith('yes', true);
  fireEvent(toggle(), 'valueChange', false); await waitFor(() => expect(toggle()).not.toBeChecked());
  expect(screen.getByText('default')).toBeOnTheScreen(); expect(screen.UNSAFE_getAllByType(Image)).toHaveLength(initialCards.length + 1);
  expect(save.mock.calls).toEqual([[{ enabled: true }], [{ enabled: false }]]);
});
it('restores the saved voluntary choice after provider remount, without an automatic write', async () => {
  saved = { enabled: true }; const view = render(<Session />); await waitFor(() => expect(toggle()).toBeChecked());
  view.unmount(); render(<Session />); await waitFor(() => expect(toggle()).toBeChecked());
  expect(save).not.toHaveBeenCalled(); expect(read).toHaveBeenCalledTimes(2);
});
it('preserves confirmed presentation on failed activation and retries the intended choice', async () => {
  save.mockRejectedValueOnce(new Error('private storage detail')); render(<Session />); await waitFor(() => expect(toggle()).toBeEnabled());
  fireEvent(toggle(), 'valueChange', true); await screen.findByText(/A preferência salva foi mantida/);
  expect(toggle()).not.toBeChecked(); expect(screen.getByText('default')).toBeOnTheScreen();
  expect(screen.queryByText('private storage detail')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Tentar salvar preferência novamente' }));
  await waitFor(() => expect(toggle()).toBeChecked()); expect(save).toHaveBeenCalledTimes(2);
});
it('preserves an enabled choice when disabling fails, and retries false rather than treating it as absent', async () => {
  saved = { enabled: true }; save.mockRejectedValueOnce(new Error('private detail')); render(<Session />);
  await waitFor(() => expect(toggle()).toBeChecked()); fireEvent(toggle(), 'valueChange', false);
  await screen.findByRole('button', { name: 'Tentar salvar preferência novamente' }); expect(toggle()).toBeChecked();
  expect(screen.getByText('none')).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: 'Tentar salvar preferência novamente' }));
  await waitFor(() => expect(toggle()).not.toBeChecked()); expect(saved).toEqual({ enabled: false });
});
it('blocks duplicate pending writes and does not publish optimistic success', async () => {
  let finish!: (value: LowStimulationPreference) => void;
  save.mockImplementationOnce(() => new Promise<LowStimulationPreference>((resolve) => { finish = resolve; }));
  render(<Session />); await waitFor(() => expect(toggle()).toBeEnabled());
  fireEvent(toggle(), 'valueChange', true); fireEvent(toggle(), 'valueChange', true);
  expect(toggle()).toBeDisabled(); expect(toggle()).not.toBeChecked(); expect(save).toHaveBeenCalledTimes(1);
  expect(screen.getByText('Salvando preferência…')).toBeOnTheScreen();
  await act(async () => { finish({ enabled: true }); }); expect(toggle()).toBeChecked(); expect(toggle()).toBeEnabled();
});
it('keeps essential tools usable after restoration failure and retries without resetting stored data', async () => {
  saved = { enabled: true }; read.mockRejectedValueOnce(new Error('private detail')); render(<Session />);
  await screen.findByText('Não foi possível abrir a preferência.');
  expect(screen.queryByRole('switch', { name: 'Modo de baixa estimulação' })).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Ajuda' })); expect(select).toHaveBeenCalled();
  expect(screen.queryByText('private detail')).toBeNull(); expect(save).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Tentar abrir preferência novamente' }));
  await waitFor(() => expect(toggle()).toBeChecked()); expect(saved).toEqual({ enabled: true });
});
it('recovers from unavailable database initialization rather than keeping a rejected initialization forever', async () => {
  jest.mocked(openDisplayPreferencesDatabase).mockRejectedValueOnce(new Error('unavailable'));
  render(<Session />); await screen.findByRole('button', { name: 'Tentar abrir preferência novamente' });
  fireEvent.press(screen.getByRole('button', { name: 'Tentar abrir preferência novamente' }));
  await waitFor(() => expect(toggle()).toBeEnabled()); expect(openDisplayPreferencesDatabase).toHaveBeenCalledTimes(2);
});
it('honors system motion independently and unsubscribes without modifying device settings', async () => {
  const view = render(<Session />); await screen.findByText('default');
  act(() => motionEvent(true)); expect(screen.getByText('none')).toBeOnTheScreen(); expect(toggle()).not.toBeChecked();
  expect(screen.UNSAFE_getAllByType(Image)).toHaveLength(initialCards.length + 1); expect(save).not.toHaveBeenCalled();
  act(() => motionEvent(false)); expect(screen.getByText('default')).toBeOnTheScreen();
  view.unmount(); expect(remove).toHaveBeenCalledTimes(1);
});
it('does not overwrite a newer system motion event with a stale query response', async () => {
  let finish!: (enabled: boolean) => void;
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockImplementationOnce(() => new Promise<boolean>((resolve) => { finish = resolve; }));
  render(<Session />); await waitFor(() => expect(toggle()).toBeEnabled());
  act(() => motionEvent(true)); await act(async () => { finish(false); });
  expect(screen.getByText('none')).toBeOnTheScreen(); expect(toggle()).not.toBeChecked();
});
it('uses calm navigation if system motion cannot be read without blocking the voluntary preference', async () => {
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockRejectedValueOnce(new Error('unavailable'));
  render(<Session />); await waitFor(() => expect(toggle()).toBeEnabled()); expect(screen.getByText('none')).toBeOnTheScreen();
  fireEvent(toggle(), 'valueChange', true); await waitFor(() => expect(toggle()).toBeChecked());
});
it('keeps the native switch and label legible with a non-color state and 48dp target — spec005/RF-002', async () => {
  render(<Session />); await waitFor(() => expect(toggle()).toBeEnabled());
  expect(toggle()).toHaveStyle({ minHeight: 48, minWidth: 48 });
  expect(screen.getByText('Baixa estimulação')).toHaveStyle({ color: '#202124', fontSize: 16, flex: 1 });
  expect(toggle().props.accessibilityState).toMatchObject({ checked: false, disabled: false });
  expect(screen.getByText('Baixa estimulação').props.allowFontScaling).not.toBe(false);
});
it('stacks enlarged text and switch rather than squeezing the label beside a fixed target', async () => {
  const dimensions = { width: 320, height: 640, scale: 1, fontScale: 2 };
  Dimensions.set({ window: dimensions, screen: dimensions });
  render(<Session />); await waitFor(() => expect(toggle()).toBeEnabled());
  expect(screen.getByText('Baixa estimulação')).toHaveStyle({ flex: 0, alignSelf: 'stretch' });
  expect(toggle()).toHaveStyle({ minHeight: 48, minWidth: 48 });
  for (const card of initialCards) expect(screen.getByRole('button', { name: card.title })).toBeOnTheScreen();
});
it('deduplicates initial storage opening across StrictMode effect replay', async () => {
  render(<StrictMode><Session /></StrictMode>); await waitFor(() => expect(toggle()).toBeEnabled());
  expect(openDisplayPreferencesDatabase).toHaveBeenCalledTimes(1); expect(read).toHaveBeenCalledTimes(1);
  expect(save).not.toHaveBeenCalled();
});

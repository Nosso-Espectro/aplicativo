import { act, waitFor } from '@testing-library/react-native';
import { renderRouter, fireEvent, screen } from 'expo-router/testing-library';
import { Slot, router } from 'expo-router';
import { AccessibilityInfo } from 'react-native';
import StartupScreen from '../../../src/app';
import CheckInScreen from '../../../src/app/check-in';
import CheckInLayout from '../../../src/app/check-in/_layout';
import { checkInQuestions } from '../../../src/features/sensory-check-in/check-in-model';
import { SentenceProvider } from '../../../src/features/communication/sentence/SentenceProvider';
import { CustomCardsProvider } from '../../../src/features/communication/custom-cards/CustomCardsProvider';
import { LowStimulationProvider } from '../../../src/features/regulation/LowStimulationProvider';
import { LowStimulationControl } from '../../../src/features/regulation/LowStimulationControl';
import { openCardDatabase } from '../../../src/features/communication/storage/card-database';
import { openDisplayPreferencesDatabase } from '../../../src/features/regulation/display-preferences-database';
import { localSpeech } from '../../../src/features/communication/speech/local-speech';

jest.mock('../../../src/features/communication/storage/card-database', () => ({ openCardDatabase: jest.fn() }));
jest.mock('../../../src/features/regulation/display-preferences-database', () => ({ openDisplayPreferencesDatabase: jest.fn() }));
jest.mock('../../../src/features/communication/custom-cards/local-image-storage', () => ({ localImages: { prune: jest.fn() } }));
jest.mock('../../../src/features/communication/speech/local-speech', () => ({ localSpeech: { isAvailable: jest.fn(), speak: jest.fn(), stop: jest.fn() } }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
function GlobalLayout() {
  return <LowStimulationProvider><LowStimulationControl /><SentenceProvider><CustomCardsProvider><Slot /></CustomCardsProvider></SentenceProvider></LowStimulationProvider>;
}
const routes = { _layout: GlobalLayout, index: StartupScreen, 'check-in/_layout': CheckInLayout, 'check-in/index': CheckInScreen };
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  jest.mocked(openCardDatabase).mockResolvedValue({ list: async () => [], listFavorites: async () => [], setFavorite: jest.fn(), save: jest.fn(), remove: jest.fn() });
  jest.mocked(openDisplayPreferencesDatabase).mockResolvedValue({ read: async () => ({ enabled: false }), save: jest.fn(async value => ({ ...value })) });
});
afterEach(() => jest.restoreAllMocks());
async function mount(initialUrl: string) {
  const view = renderRouter(routes, { initialUrl });
  await act(async () => {});
  return view;
}
async function press(name: string) { await act(async () => fireEvent.press(screen.getByRole('button', { name }))); }
async function answer(label: string) { await act(async () => fireEvent.press(screen.getByRole('radio', { name: label }))); }
function expectUnanswered() { for (const option of screen.getAllByRole('radio')) expect(option).not.toBeChecked(); }

it('opens from the real board and answers all eight items without network, speech, summary or inference', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  const view = await mount('/');
  await press('Abrir check-in corporal e sensorial'); expect(view.getPathname()).toBe('/check-in');
  for (const [index, question] of checkInQuestions.entries()) {
    expect(screen.getByRole('header', { name: question.title })).toBeOnTheScreen();
    expect(screen.getByText(`Pergunta ${index + 1} de 8`)).toBeOnTheScreen(); expectUnanswered();
    const command = index === 7 ? 'Finalizar check-in' : 'Continuar';
    expect(screen.getByRole('button', { name: command })).toBeDisabled();
    await answer(question.id === 'temperature' ? 'Confortável' : 'Não sei');
    await press(command);
  }
  expect(screen.getByRole('header', { name: 'Check-in encerrado.' })).toBeOnTheScreen();
  expect(screen.getByText('As respostas não foram salvas.')).toBeOnTheScreen();
  expect(screen.queryAllByRole('radio')).toHaveLength(0); expect(fetch).not.toHaveBeenCalled();
  expect(localSpeech.speak).not.toHaveBeenCalled();
  expect(screen.queryByText(/Resumo|Sugestões|Água/)).toBeNull();
});
it('can skip every item including the final one and finishes with no supplied data', async () => {
  await mount('/check-in');
  for (const question of checkInQuestions) {
    expect(screen.getByRole('header', { name: question.title })).toBeOnTheScreen(); await press('Pular pergunta');
  }
  expect(screen.getByText('Check-in encerrado.')).toBeOnTheScreen();
  await press('Voltar ao quadro'); expect(screen.getByRole('header', { name: 'Comunicação' })).toBeOnTheScreen();
});
it('revises a selected answer, preserves other items and unsets a previously answered skipped item', async () => {
  await mount('/check-in');
  await answer('Sim'); await press('Continuar'); await answer('Não sei'); await press('Pergunta anterior');
  expect(screen.getByRole('radio', { name: 'Sim' })).toBeChecked();
  await answer('Não'); expect(screen.getByRole('radio', { name: 'Não' })).toBeChecked();
  expect(screen.getByRole('radio', { name: 'Sim' })).not.toBeChecked();
  await press('Pular pergunta'); expect(screen.getByRole('radio', { name: 'Não sei' })).toBeChecked();
  await press('Pergunta anterior'); expectUnanswered(); expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
});
it('discards answers on explicit exit and starts empty on returning in the same router session', async () => {
  const view = await mount('/'); await press('Abrir check-in corporal e sensorial');
  await answer('Sim'); await press('Continuar'); await answer('Não');
  await press('Voltar ao quadro'); expect(view.getPathname()).toBe('/');
  await press('Abrir check-in corporal e sensorial'); expect(screen.getByText('Pergunta 1 de 8')).toBeOnTheScreen(); expectUnanswered();
});
it('discards a session when native navigation goes back and when the route unmounts', async () => {
  const view = await mount('/'); await press('Abrir check-in corporal e sensorial');
  await answer('Sim'); await press('Continuar');
  await act(async () => router.back()); expect(view.getPathname()).toBe('/');
  await press('Abrir check-in corporal e sensorial'); expectUnanswered(); expect(screen.getByText('Pergunta 1 de 8')).toBeOnTheScreen();
  await answer('Não sei'); view.unmount(); await mount('/check-in');
  expectUnanswered(); expect(screen.getByText('Pergunta 1 de 8')).toBeOnTheScreen();
});
it('supports direct entry with no responses in params and preserves global low stimulation on exit and reentry', async () => {
  const view = await mount('/check-in?answer=yes&question=alone'); expectUnanswered();
  const toggle = screen.getByRole('switch', { name: 'Modo de baixa estimulação' });
  await act(async () => fireEvent(toggle, 'valueChange', true)); await waitFor(() => expect(toggle).toBeChecked());
  await answer('Sim'); await press('Pular pergunta'); await press('Voltar ao quadro'); expect(view.getPathname()).toBe('/');
  await press('Abrir check-in corporal e sensorial'); expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked();
  expectUnanswered(); expect(screen.getByText('Este check-in não é um diagnóstico.')).toBeOnTheScreen();
  expect(localSpeech.speak).not.toHaveBeenCalled();
  expect(jest.mocked(openCardDatabase).mock.results).toHaveLength(1);
});

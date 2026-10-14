import { act, waitFor } from '@testing-library/react-native';
import { renderRouter, fireEvent, screen } from 'expo-router/testing-library';
import { Slot, router } from 'expo-router';
import { AccessibilityInfo, Linking } from 'react-native';
import StartupScreen from '../../../src/app';
import CheckInScreen from '../../../src/app/check-in';
import CheckInLayout from '../../../src/app/check-in/_layout';
import WaterCard from '../../../src/app/check-in/water';
import Regulation from '../../../src/app/regulation';
import TrustedContact from '../../../src/app/trusted-contact';
import { checkInQuestions } from '../../../src/features/sensory-check-in/check-in-model';
import { SentenceProvider } from '../../../src/features/communication/sentence/SentenceProvider';
import { CustomCardsProvider } from '../../../src/features/communication/custom-cards/CustomCardsProvider';
import { LowStimulationProvider } from '../../../src/features/regulation/LowStimulationProvider';
import { LowStimulationControl } from '../../../src/features/regulation/LowStimulationControl';
import { openCardDatabase } from '../../../src/features/communication/storage/card-database';
import { openDisplayPreferencesDatabase } from '../../../src/features/regulation/display-preferences-database';
import { localSpeech } from '../../../src/features/communication/speech/local-speech';
import { initialCards } from '../../../src/features/communication/board/initial-cards';
import { openTrustedContactDatabase } from '../../../src/features/support-plan/trusted-contact-database';
import { emptyTrustedContact } from '../../../src/features/support-plan/trusted-contact';
import { openWhatsAppDraft } from '../../../src/features/support-plan/whatsapp-handoff';

jest.mock('../../../src/features/communication/storage/card-database', () => ({ openCardDatabase: jest.fn() }));
jest.mock('../../../src/features/regulation/display-preferences-database', () => ({ openDisplayPreferencesDatabase: jest.fn() }));
jest.mock('../../../src/features/communication/custom-cards/local-image-storage', () => ({ localImages: { prune: jest.fn() } }));
jest.mock('../../../src/features/communication/speech/local-speech', () => ({ localSpeech: { isAvailable: jest.fn(), speak: jest.fn(), stop: jest.fn() } }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
jest.mock('../../../src/features/support-plan/trusted-contact-database', () => ({ openTrustedContactDatabase: jest.fn() }));
jest.mock('../../../src/features/support-plan/whatsapp-handoff', () => ({ openWhatsAppDraft: jest.fn() }));
function GlobalLayout() {
  return <LowStimulationProvider><LowStimulationControl /><SentenceProvider><CustomCardsProvider><Slot /></CustomCardsProvider></SentenceProvider></LowStimulationProvider>;
}
const routes = { _layout: GlobalLayout, index: StartupScreen, 'check-in/_layout': CheckInLayout, 'check-in/index': CheckInScreen,
  'check-in/water': WaterCard, regulation: Regulation, 'trusted-contact': TrustedContact };
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  jest.mocked(openCardDatabase).mockResolvedValue({ list: async () => [], listFavorites: async () => [], setFavorite: jest.fn(), save: jest.fn(), remove: jest.fn() });
  jest.mocked(openDisplayPreferencesDatabase).mockResolvedValue({ read: async () => ({ enabled: false }), save: jest.fn(async value => ({ ...value })) });
  jest.mocked(openTrustedContactDatabase).mockResolvedValue({ read: async () => ({ ...emptyTrustedContact }), save: jest.fn() });
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
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

it('opens from the real board and answers all eight items without network, speech or inference', async () => {
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
  expect(screen.getByRole('header', { name: 'Resumo do check-in' })).toBeOnTheScreen();
  for (const question of checkInQuestions) {
    expect(screen.getByLabelText(`${question.title} ${question.id === 'temperature' ? 'Confortável' : 'Não sei'}`)).toBeOnTheScreen();
  }
  expect(screen.queryAllByRole('radio')).toHaveLength(0); expect(fetch).not.toHaveBeenCalled();
  expect(localSpeech.speak).not.toHaveBeenCalled();
  expect(screen.getByText('Este resumo não é um diagnóstico.')).toBeOnTheScreen();
  expect(openWhatsAppDraft).not.toHaveBeenCalled(); expect(Linking.openURL).not.toHaveBeenCalled();
});
it('can skip every item including the final one and finishes with no supplied data', async () => {
  await mount('/check-in');
  for (const question of checkInQuestions) {
    expect(screen.getByRole('header', { name: question.title })).toBeOnTheScreen(); await press('Pular pergunta');
  }
  expect(screen.getByText('Resumo do check-in')).toBeOnTheScreen();
  expect(screen.getByText('Nenhuma resposta fornecida.')).toBeOnTheScreen();
  await press('Voltar ao quadro'); expect(screen.getByRole('header', { name: 'Frase' })).toBeOnTheScreen();
});

async function finishWithThirst() {
  await answer('Sim'); await press('Continuar');
  for (let index = 1; index < checkInQuestions.length; index++) await press('Pular pergunta');
}
it('shows only supplied answers in the summary, excludes skipped answers and resets on explicit exit', async () => {
  const view = await mount('/check-in'); await finishWithThirst();
  expect(screen.getByLabelText('Você está com sede? Sim')).toBeOnTheScreen();
  for (const question of checkInQuestions.slice(1)) expect(screen.queryByText(question.title)).toBeNull();
  expect(screen.queryByText('Nenhuma resposta fornecida.')).toBeNull();
  expect(view.getSearchParams()).toEqual({});
  await press('Voltar ao quadro'); await press('Abrir check-in corporal e sensorial'); expectUnanswered();
});
it('opens the actual regulation route only on choice, drops the summary and preserves low stimulation', async () => {
  const view = await mount('/'); await press('Abrir check-in corporal e sensorial'); await finishWithThirst();
  const toggle = screen.getByRole('switch', { name: 'Modo de baixa estimulação' });
  await act(async () => fireEvent(toggle, 'valueChange', true)); await waitFor(() => expect(toggle).toBeChecked());
  await press('Você pode abrir o painel de regulação'); expect(view.getPathname()).toBe('/regulation');
  expect(view.getSearchParams()).toEqual({}); expect(screen.getByRole('header', { name: 'Painel de regulação' })).toBeOnTheScreen();
  expect(localSpeech.speak).not.toHaveBeenCalled(); expect(Linking.openURL).not.toHaveBeenCalled();
  await press('Voltar ao quadro'); await press('Abrir check-in corporal e sensorial'); expectUnanswered();
  expect(screen.queryByText('Resumo do check-in')).toBeNull();
  expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked();
});
it('opens the actual contact editor without transmitting responses or opening WhatsApp, including storage failure', async () => {
  jest.mocked(openTrustedContactDatabase).mockRejectedValueOnce(new Error('synthetic private error'));
  const view = await mount('/check-in'); await finishWithThirst(); await press('Você pode revisar seu contato de confiança');
  expect(view.getPathname()).toBe('/trusted-contact'); expect(view.getSearchParams()).toEqual({});
  await screen.findByRole('button', { name: 'Tentar abrir contato novamente' });
  expect(screen.queryByText('synthetic private error')).toBeNull(); expect(screen.queryByText('Você está com sede?')).toBeNull();
  expect(openWhatsAppDraft).not.toHaveBeenCalled(); expect(Linking.openURL).not.toHaveBeenCalled();
  await press('Tentar abrir contato novamente'); await screen.findByText('Ainda não há contato de confiança salvo.');
  expect(openWhatsAppDraft).not.toHaveBeenCalled();
  await press('Cancelar e voltar'); expect(view.getPathname()).toBe('/');
  await press('Abrir check-in corporal e sensorial'); expectUnanswered();
});
it('opens only the real local Water CAA card offline without composition, speech, external sending or reminders', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  const view = await mount('/check-in'); await finishWithThirst(); await press('Mostrar cartão Água');
  expect(view.getPathname()).toBe('/check-in/water'); expect(view.getSearchParams()).toEqual({});
  expect(screen.getByRole('header', { name: 'Água' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Água' })).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Falar frase' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Novo cartão' })).toBeNull();
  await press('Água'); expect(screen.getByRole('link', { name: 'Pictograma de Água: Flaticon' })).toBeOnTheScreen();
  const modalBack = screen.getAllByRole('button', { name: 'Voltar ao quadro' }).at(-1)!;
  await act(async () => fireEvent.press(modalBack));
  expect(screen.queryByRole('link', { name: 'Pictograma de Água: Flaticon' })).toBeNull();
  expect(localSpeech.speak).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
  expect(openWhatsAppDraft).not.toHaveBeenCalled(); expect(Linking.openURL).not.toHaveBeenCalled();
  await press('Voltar ao quadro'); await press('Abrir check-in corporal e sensorial'); expectUnanswered();
});
it('keeps the Water fallback available when the expected card is absent and ignores supplied response params', async () => {
  jest.spyOn(initialCards, 'filter').mockReturnValueOnce([]);
  const view = await mount('/check-in/water?answer=yes');
  expect(screen.getByText('Cartão Água indisponível.')).toBeOnTheScreen();
  expect(screen.queryByText('Você está com sede?')).toBeNull();
  await press('Voltar ao quadro'); expect(view.getPathname()).toBe('/');
  expect(localSpeech.speak).not.toHaveBeenCalled(); expect(Linking.openURL).not.toHaveBeenCalled();
});
it('does not resurrect a summary after native back or unmount/reentry', async () => {
  const view = await mount('/'); await press('Abrir check-in corporal e sensorial'); await finishWithThirst();
  await act(async () => router.back()); await press('Abrir check-in corporal e sensorial'); expectUnanswered();
  await finishWithThirst(); view.unmount(); await mount('/check-in');
  expectUnanswered(); expect(screen.queryByText('Resumo do check-in')).toBeNull();
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

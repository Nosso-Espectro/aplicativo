/// <reference types="node" />
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { useEffect, StrictMode } from 'react';
import { act, render, waitFor } from '@testing-library/react-native';
import { renderRouter, screen, fireEvent } from 'expo-router/testing-library';
import { Slot } from 'expo-router';
import { AccessibilityInfo, AppState, Pressable, Text } from 'react-native';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { setStringAsync } from 'expo-clipboard';
import StartupScreen from '../../../src/app';
import ScriptsLayout from '../../../src/app/scripts/_layout';
import ScriptsRoute from '../../../src/app/scripts';
import NewScript from '../../../src/app/scripts/new';
import CopyScript from '../../../src/app/scripts/copy/[id]';
import EditScript from '../../../src/app/scripts/edit/[id]';
import Detail from '../../../src/app/scripts/[source]/[id]';
import { ScriptProvider, useScripts } from '../../../src/features/communication-scripts/ScriptProvider';
import { openScriptDatabase } from '../../../src/features/communication-scripts/script-database';
import { initialScripts } from '../../../src/features/communication-scripts/script-catalog';
import { LowStimulationProvider } from '../../../src/features/regulation/LowStimulationProvider';
import { LowStimulationControl } from '../../../src/features/regulation/LowStimulationControl';
import { SentenceProvider } from '../../../src/features/communication/sentence/SentenceProvider';
import { CustomCardsProvider } from '../../../src/features/communication/custom-cards/CustomCardsProvider';
import { openCardDatabase } from '../../../src/features/communication/storage/card-database';
import { openDisplayPreferencesDatabase } from '../../../src/features/regulation/display-preferences-database';
import { localSpeech } from '../../../src/features/communication/speech/local-speech';
import { RegulationSoundsProvider, useRegulationSounds } from '../../../src/features/regulation-sounds/RegulationSoundsProvider';
import type { SoundEngine, SoundStatus } from '../../../src/features/regulation-sounds/sound-controller';
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(), StringFormat: { PLAIN_TEXT: 'plainText' } }));
jest.mock('../../../src/features/communication/storage/card-database', () => ({ openCardDatabase: jest.fn() }));
jest.mock('../../../src/features/regulation/display-preferences-database', () => ({ openDisplayPreferencesDatabase: jest.fn() }));
jest.mock('../../../src/features/communication/custom-cards/local-image-storage', () => ({ localImages: { prune: jest.fn() } }));
jest.mock('../../../src/features/communication/speech/local-speech', () => ({ localSpeech: { isAvailable: jest.fn(), speak: jest.fn(), stop: jest.fn() } }));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'Icon');
let directory: string; let connections: DatabaseSync[]; let failCommit: boolean; let holdCommit: Promise<void> | null;
let releaseCommit: () => void; let scriptContext: ReturnType<typeof useScripts>; let soundContext: ReturnType<typeof useRegulationSounds>;
let engine: SoundEngine; let nativeStatus: SoundStatus; let changed: (status: SoundStatus) => void;
const factory = jest.fn(async (_id, callback) => { changed = callback; return engine; });
function SoundProbe() {
  const context = useRegulationSounds(); useEffect(() => { soundContext = context; }, [context]);
  return <Pressable accessibilityRole="button" accessibilityLabel="Reproduzir som sintético" onPress={() => {
    context?.controller.foreground(true); context?.controller.select('white'); void context?.controller.play();
  }}><Text>Som sintético</Text></Pressable>;
}
function GlobalLayout() {
  return <LowStimulationProvider><LowStimulationControl /><RegulationSoundsProvider factory={factory}><SoundProbe />
    <SentenceProvider><CustomCardsProvider><Slot /></CustomCardsProvider></SentenceProvider>
  </RegulationSoundsProvider></LowStimulationProvider>;
}
const routes = { _layout: GlobalLayout, index: StartupScreen, 'scripts/_layout': ScriptsLayout, 'scripts/index': ScriptsRoute,
  'scripts/new': NewScript, 'scripts/copy/[id]': CopyScript, 'scripts/edit/[id]': EditScript, 'scripts/[source]/[id]': Detail };
beforeEach(() => {
  jest.clearAllMocks(); directory = mkdtempSync(join(tmpdir(), 'tear-personal-script-flow-')); connections = []; failCommit = false; holdCommit = null;
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
  jest.mocked(setStringAsync).mockResolvedValue(true); jest.mocked(localSpeech.isAvailable).mockResolvedValue(true);
  jest.mocked(localSpeech.speak).mockResolvedValue(); jest.mocked(localSpeech.stop).mockResolvedValue();
  jest.mocked(openCardDatabase).mockResolvedValue({ list: async () => [], listFavorites: async () => [], setFavorite: jest.fn(), save: jest.fn(), remove: jest.fn() });
  jest.mocked(openDisplayPreferencesDatabase).mockResolvedValue({ read: async () => ({ enabled: false }), save: async value => ({ ...value }) });
  nativeStatus = { loaded: true, playing: false, buffering: false, failed: false };
  engine = { configure: jest.fn(async () => {}), play: jest.fn(() => { nativeStatus.playing = true; changed({ ...nativeStatus }); }),
    pause: jest.fn(() => { nativeStatus.playing = false; }), volume: jest.fn(), lockScreen: jest.fn(), dispose: jest.fn(), status: () => ({ ...nativeStatus }) };
  jest.mocked(openDatabaseAsync).mockImplementation(async name => {
    expect(name).toBe('tear-communication-scripts.db'); const sql = new DatabaseSync(join(directory, name)); connections.push(sql); let written = false;
    const adapter = {
      execAsync: async (statement: string) => { sql.exec(statement); },
      runAsync: async (statement: string, ...params: (string | number | null)[]) => { written = true; return sql.prepare(statement).run(...params); },
      getAllAsync: async (statement: string) => sql.prepare(statement).all(), closeAsync: async () => sql.close(),
      withExclusiveTransactionAsync: async (operation: (tx: SQLiteDatabase) => Promise<void>) => {
        sql.exec('BEGIN'); written = false;
        try { await operation(adapter as unknown as SQLiteDatabase); if (written && holdCommit) await holdCommit;
          if (written && failCommit) throw new Error('synthetic private failure'); sql.exec('COMMIT'); }
        catch (error) { sql.exec('ROLLBACK'); throw error; }
      },
    }; return adapter as unknown as SQLiteDatabase;
  });
});
afterEach(() => { for (const db of connections) { try { db.close(); } catch {} } rmSync(directory, { recursive: true, force: true }); jest.restoreAllMocks(); });
async function mount(url = '/scripts') { const view = renderRouter(routes, { initialUrl: url }); await act(async () => {}); return view; }
async function press(name: string) { await act(async () => fireEvent.press(screen.getByRole('button', { name }))); }
async function check(name: string) { await act(async () => fireEvent.press(screen.getByRole('checkbox', { name }))); }
async function create(text: string) {
  await press('Novo script'); fireEvent.changeText(screen.getByLabelText('Texto do script'), text); await press('Salvar script');
  await screen.findByRole('header', { name: 'Script de comunicação' });
}
it('creates, edits, cancels and reopens personal content and initial/personal favorites offline without changing the catalog', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline')); const view = await mount('/');
  await press('Abrir scripts de comunicação'); await screen.findByRole('button', { name: 'Novo script' }); await create('Script sintético');
  await check('Favorito'); await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Favorito' })).toBeChecked());
  await press('Editar script'); fireEvent.changeText(screen.getByLabelText('Texto do script'), 'Draft não salvar'); await press('Cancelar');
  expect(screen.getByText('Script sintético')).toBeOnTheScreen(); await press('Editar script');
  fireEvent.changeText(screen.getByLabelText('Texto do script'), 'Script confirmado');
  await act(async () => fireEvent.press(screen.getByRole('radio', { name: 'Mais tempo' }))); await press('Salvar script');
  await screen.findByText('Script confirmado'); await press('Voltar aos scripts');
  await check(`Favorito: ${initialScripts[0].text}`); await check('Somente favoritos');
  expect(screen.getAllByRole('button', { name: /^Copiar script:/ })).toHaveLength(2);
  expect(screen.getByText(initialScripts[0].text)).toBeOnTheScreen(); view.unmount();
  await mount(); await check('Somente favoritos'); expect(screen.getByText('Script confirmado')).toBeOnTheScreen();
  expect(screen.getByText(initialScripts[0].text)).toBeOnTheScreen(); expect(fetch).not.toHaveBeenCalled(); expect(localSpeech.speak).not.toHaveBeenCalled();
});
it('creates an independent initial copy only after saving and removes only the confirmed personal script/favorite', async () => {
  await mount(); await press(`Abrir script: ${initialScripts[0].text}`); await press('Criar cópia');
  fireEvent.changeText(screen.getByLabelText('Texto do script'), 'Não salvar'); await press('Cancelar');
  expect(screen.getByText(initialScripts[0].text)).toBeOnTheScreen(); expect(connections[0].prepare('SELECT COUNT(*) AS count FROM personal_scripts').get()).toEqual({ count: 0 });
  await press('Criar cópia'); fireEvent.changeText(screen.getByLabelText('Texto do script'), 'Cópia pessoal'); await press('Salvar script');
  await screen.findByText('Cópia pessoal'); await check('Favorito'); await press('Excluir script'); await press('Manter script');
  expect(screen.queryByRole('button', { name: 'Confirmar exclusão do script' })).toBeNull();
  await press('Excluir script'); await press('Confirmar exclusão do script'); await screen.findByRole('button', { name: 'Novo script' });
  expect(screen.queryByText('Cópia pessoal')).toBeNull(); expect(screen.getByText(initialScripts[0].text)).toBeOnTheScreen();
  expect(connections[0].prepare('SELECT COUNT(*) AS count FROM script_favorites').get()).toEqual({ count: 0 });
});
it('validates required text and keeps editor draft/error on rollback with explicit retry', async () => {
  await mount(); await press('Novo script'); await press('Salvar script'); await screen.findByText('Informe o texto do script.');
  fireEvent.changeText(screen.getByLabelText('Texto do script'), 'Texto sintético'); failCommit = true; await press('Salvar script');
  await screen.findByText(/Seu preenchimento foi mantido/); expect(screen.getByLabelText('Texto do script')).toHaveDisplayValue('Texto sintético');
  expect(screen.queryByText('synthetic private failure')).toBeNull(); failCommit = false; await press('Salvar script'); await screen.findByText('Texto sintético');
});
it('does not navigate or publish favorite state before commit and prevents duplicate writes', async () => {
  const view = await mount(); await press('Novo script'); fireEvent.changeText(screen.getByLabelText('Texto do script'), 'Pendente');
  holdCommit = new Promise(resolve => { releaseCommit = resolve; }); await press('Salvar script');
  expect(view.getPathname()).toBe('/scripts/new'); expect(screen.getByRole('button', { name: 'Salvar script' })).toBeDisabled();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar script' }));
  await act(async () => { holdCommit = null; releaseCommit(); }); await screen.findByText('Pendente');
  expect(connections[0].prepare('SELECT COUNT(*) AS count FROM personal_scripts').get()).toEqual({ count: 1 });
  holdCommit = new Promise(resolve => { releaseCommit = resolve; }); await check('Favorito');
  expect(screen.getByRole('checkbox', { name: 'Favorito' })).not.toBeChecked(); expect(screen.getByRole('checkbox', { name: 'Favorito' })).toBeDisabled();
  await act(async () => { holdCommit = null; releaseCommit(); }); await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Favorito' })).toBeChecked());
});
it('retains confirmed favorites and deletion target on rollback instead of publishing success', async () => {
  await mount(); await create('Alvo'); failCommit = true; await check('Favorito');
  await screen.findByText(/versão salva foi mantida/); expect(screen.getByRole('checkbox', { name: 'Favorito' })).not.toBeChecked();
  await press('Excluir script'); await press('Confirmar exclusão do script'); await screen.findByText(/Não foi possível remover/);
  expect(screen.getByRole('button', { name: 'Confirmar exclusão do script' })).toBeOnTheScreen(); failCommit = false;
  await press('Confirmar exclusão do script'); await screen.findByRole('button', { name: 'Novo script' }); expect(screen.queryByText('Alvo')).toBeNull();
});
it('refuses an obsolete editor revision or a removed target without adopting a newer revision silently', async () => {
  await mount(); await create('Versão inicial'); await press('Editar script'); fireEvent.changeText(screen.getByLabelText('Texto do script'), 'Draft antigo');
  const other = await openScriptDatabase(); const current = (await other.read()).personal[0]; await other.save({ text: 'Outra conexão', categoryId: 'other' }, current);
  await press('Salvar script'); await screen.findByText(/Seu preenchimento foi mantido/);
  expect(screen.getByLabelText('Texto do script')).toHaveDisplayValue('Draft antigo');
  await other.remove((await other.read()).personal[0]); await press('Salvar script'); await screen.findByText(/Seu preenchimento foi mantido/);
  expect((await other.read()).personal).toEqual([]);
});
it('keeps initial catalog/copy useful during storage opening failure and offers actual retry/fallback routes', async () => {
  jest.mocked(openDatabaseAsync).mockRejectedValueOnce(new Error('synthetic private path'));
  const view = await mount(); await screen.findByRole('button', { name: 'Tentar abrir scripts pessoais novamente' });
  expect(screen.queryByText('synthetic private path')).toBeNull(); await press(`Copiar script: ${initialScripts[0].text}`);
  expect(setStringAsync).toHaveBeenCalledWith(initialScripts[0].text, { inputFormat: 'plainText' });
  await press('Tentar abrir scripts pessoais novamente'); await waitFor(() => expect(screen.getByRole('button', { name: 'Novo script' })).toBeEnabled());
  await press('Voltar ao quadro'); expect(view.getPathname()).toBe('/');
});
it('offers fallback for missing routes and preserves mode9 when creating/editing/cancelling', async () => {
  const view = await mount('/scripts/edit/missing'); await screen.findByText('Script não encontrado.'); await press('Voltar aos scripts');
  const toggle = screen.getByRole('switch', { name: 'Modo de baixa estimulação' });
  await act(async () => fireEvent(toggle, 'valueChange', true)); await waitFor(() => expect(toggle).toBeChecked()); await create('Modo sintético');
  await press('Editar script'); await press('Cancelar'); expect(screen.getByRole('switch', { name: 'Modo de baixa estimulação' })).toBeChecked();
  await press('Voltar aos scripts'); await press('Voltar ao quadro'); expect(view.getPathname()).toBe('/');
});
it('reads only an explicitly chosen confirmed script and pauses existing sounds before voice, without auto resume', async () => {
  await mount(); await create('Voz sintética'); expect(localSpeech.isAvailable).not.toHaveBeenCalled();
  let complete!: () => void; jest.mocked(localSpeech.speak).mockImplementationOnce(() => new Promise(resolve => { complete = resolve; }));
  await press('Reproduzir som sintético'); await press('Ler frase'); await waitFor(() => expect(localSpeech.speak).toHaveBeenCalledWith('Voz sintética'));
  expect(jest.mocked(engine.pause).mock.invocationCallOrder[0]).toBeLessThan(jest.mocked(localSpeech.speak).mock.invocationCallOrder[0]);
  expect(soundContext?.state.speechActive).toBe(true); await press('Interromper leitura'); expect(localSpeech.stop).toHaveBeenCalled();
  await act(async () => complete()); expect(soundContext?.state.speechActive).toBe(false); expect(engine.play).toHaveBeenCalledTimes(1);
  await press('Editar script'); fireEvent.changeText(screen.getByLabelText('Texto do script'), 'Draft sem voz');
  expect(screen.queryByRole('button', { name: 'Ler frase' })).toBeNull(); expect(localSpeech.speak).toHaveBeenCalledTimes(1);
});
it('preserves text/copy when voice is unavailable and prevents late speech after leaving during voice query', async () => {
  await mount(); await create('Sem voz'); jest.mocked(localSpeech.isAvailable).mockResolvedValueOnce(false); await press('Ler frase');
  await screen.findByText(/Não há voz local/); await press('Copiar script'); expect(setStringAsync).toHaveBeenCalledWith('Sem voz', { inputFormat: 'plainText' });
  let resolve!: (value: boolean) => void; jest.mocked(localSpeech.isAvailable).mockImplementationOnce(() => new Promise(done => { resolve = done; }));
  await press('Ler frase'); await press('Voltar aos scripts'); await act(async () => resolve(true)); expect(localSpeech.speak).not.toHaveBeenCalled();
  expect(localSpeech.stop).toHaveBeenCalled();
});
function ProviderProbe() { const context = useScripts(); useEffect(() => { scriptContext = context; }, [context]); return null; }
it('shares one database initialization in StrictMode and returns the exact created id with another connection present', async () => {
  render(<StrictMode><ScriptProvider><ProviderProbe /></ScriptProvider></StrictMode>); await act(async () => {});
  expect(openDatabaseAsync).toHaveBeenCalledTimes(1); const other = await openScriptDatabase(); await other.save({ text: 'Externo', categoryId: 'other' });
  let saved: Awaited<ReturnType<typeof scriptContext.save>>;
  await act(async () => { saved = await scriptContext.save({ text: 'Criado aqui', categoryId: 'help' }, null); });
  expect(saved!.text).toBe('Criado aqui'); expect(scriptContext.personal.map(item => item.text)).toEqual(['Externo', 'Criado aqui']);
});
it('blocks duplicate provider mutations and discards unmounted publication/navigation after the human commit', async () => {
  const view = render(<ScriptProvider><ProviderProbe /></ScriptProvider>); await act(async () => {});
  holdCommit = new Promise(resolve => { releaseCommit = resolve; });
  let saving!: ReturnType<typeof scriptContext.save>;
  await act(async () => { saving = scriptContext.save({ text: 'Operação humana', categoryId: 'other' }, null); });
  expect(await scriptContext.save({ text: 'Duplicata', categoryId: 'other' }, null)).toBeNull(); view.unmount();
  await act(async () => { holdCommit = null; releaseCommit(); }); expect(await saving).toBeNull();
  expect((await (await openScriptDatabase()).read()).personal.map(item => item.text)).toEqual(['Operação humana']);
});

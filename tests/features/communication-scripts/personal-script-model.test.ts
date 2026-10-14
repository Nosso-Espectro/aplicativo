import { initialScripts } from '../../../src/features/communication-scripts/script-catalog';
import { draftFromInitialScript, normalizedScriptDraft, resolveScript, scriptFavorite, scriptIdentity, scriptRevision } from '../../../src/features/communication-scripts/personal-script-model';
it('normalizes required free text and allows only the five categories plus Other', () => {
  expect(normalizedScriptDraft({ text: '  Texto sintético  ', categoryId: 'other' })).toEqual({ text: 'Texto sintético', categoryId: 'other' });
  expect(() => normalizedScriptDraft({ text: ' ', categoryId: 'help' })).toThrow();
  expect(() => normalizedScriptDraft({ text: 'Texto', categoryId: 'unknown' as 'help' })).toThrow();
  expect(() => scriptIdentity('../private')).toThrow(); expect(() => scriptRevision(Number.MAX_SAFE_INTEGER + 1)).toThrow();
});
it('copies initial content independently and resolves only a confirmed source and personal revision', () => {
  const copy = draftFromInitialScript(initialScripts[0]); copy.text = 'Outra mensagem';
  expect(initialScripts[0].text).toBe('Poderia me ajudar, por favor?');
  const personal = { ...copy, id: initialScripts[0].id, revision: 2 };
  const workspace = { personal: [personal], favorites: [] };
  expect(resolveScript(workspace, { source: 'initial', id: personal.id })).toEqual(initialScripts[0]);
  expect(resolveScript(workspace, { source: 'personal', id: personal.id, revision: 2 })).toEqual(personal);
  expect(() => resolveScript(workspace, { source: 'personal', id: personal.id, revision: 1 })).toThrow();
  expect(() => resolveScript(workspace, { source: 'initial', id: 'absent' })).toThrow();
});
it('separates initial and personal favorites even when their identifiers match', () => {
  const workspace = { personal: [], favorites: [{ source: 'initial' as const, id: 'ask-help', selected: true, revision: 1 }] };
  expect(scriptFavorite(workspace, 'initial', 'ask-help')?.selected).toBe(true);
  expect(scriptFavorite(workspace, 'personal', 'ask-help')).toBeUndefined();
});

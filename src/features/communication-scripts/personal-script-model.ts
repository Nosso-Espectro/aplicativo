import { initialScripts, scriptCategories, type CommunicationScript, type ScriptCategoryId } from './script-catalog';
export type PersonalCategoryId = ScriptCategoryId | 'other';
export const personalScriptCategories = [...scriptCategories, { id: 'other', label: 'Outros' }] as const;
export type ScriptDraft = { text: string; categoryId: PersonalCategoryId };
export type SavedPersonalScript = ScriptDraft & { id: string; revision: number };
export type ScriptReference = { source: 'initial'; id: string } | { source: 'personal'; id: string; revision: number };
export type ScriptFavorite = { source: 'initial' | 'personal'; id: string; selected: boolean; revision: number };
export type ScriptWorkspace = { personal: SavedPersonalScript[]; favorites: ScriptFavorite[]; createdScriptId?: string };
export function scriptIdentity(id: string) {
  if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error('Invalid script identity.');
  return id;
}
export function scriptRevision(revision: number, minimum = 1) {
  if (!Number.isSafeInteger(revision) || revision < minimum) throw new Error('Invalid script revision.');
  return revision;
}
export function normalizedScriptDraft(input: ScriptDraft): ScriptDraft {
  if (!input || typeof input.text !== 'string' || !input.text.trim() || !personalScriptCategories.some(category => category.id === input.categoryId)) {
    throw new Error('Invalid script draft.');
  }
  return { text: input.text.trim(), categoryId: input.categoryId };
}
export function draftFromInitialScript(script: CommunicationScript): ScriptDraft {
  return normalizedScriptDraft({ text: script.text, categoryId: script.categoryId });
}
export function resolveScript(workspace: ScriptWorkspace, ref: ScriptReference) {
  const id = scriptIdentity(ref.id);
  if (ref.source === 'initial') {
    const script = initialScripts.find(item => item.id === id);
    if (!script) throw new Error('Script unavailable.'); return script;
  }
  if (ref.source !== 'personal') throw new Error('Invalid script source.');
  const script = workspace.personal.find(item => item.id === id);
  if (!script || scriptRevision(ref.revision) !== script.revision) throw new Error('Script changed.');
  return script;
}
export function scriptFavorite(workspace: ScriptWorkspace, source: ScriptFavorite['source'], id: string) {
  return workspace.favorites.find(item => item.source === source && item.id === id);
}

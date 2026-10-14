export const scriptCategories = [
  { id: 'help', label: 'Pedir ajuda' }, { id: 'time', label: 'Mais tempo' },
  { id: 'clarification', label: 'Esclarecimento' }, { id: 'end', label: 'Encerrar conversa' },
  { id: 'overload', label: 'Sobrecarga' },
] as const;
export type ScriptCategoryId = typeof scriptCategories[number]['id'];
export type CommunicationScript = { id: string; categoryId: ScriptCategoryId; text: string };
export const initialScripts: readonly CommunicationScript[] = [
  { id: 'ask-help', categoryId: 'help', text: 'Poderia me ajudar, por favor?' },
  { id: 'ask-time', categoryId: 'time', text: 'Preciso de mais tempo para responder.' },
  { id: 'ask-clarification', categoryId: 'clarification', text: 'Você pode explicar de outra forma, por favor?' },
  { id: 'end-conversation', categoryId: 'end', text: 'Preciso encerrar esta conversa agora.' },
  { id: 'inform-overload', categoryId: 'overload', text: 'Estou com sobrecarga e preciso de uma pausa.' },
];
export function scriptsInCategory(scripts: readonly CommunicationScript[], category: ScriptCategoryId | 'all') {
  return scripts.filter(script => category === 'all' || script.categoryId === category);
}

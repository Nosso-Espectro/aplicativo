import type { CommunicationCard } from '../board/initial-cards';

export type SentenceEntry = { entryId: number; card: CommunicationCard };
export type SentenceState = { entries: readonly SentenceEntry[]; nextId: number };
export type SentenceAction =
  | { type: 'add'; card: CommunicationCard }
  | { type: 'remove'; entryId: number }
  | { type: 'remove-card'; cardId: string }
  | { type: 'clear' };

export function createSentenceState(): SentenceState {
  return { entries: [], nextId: 1 };
}

function snapshotCard(card: CommunicationCard): CommunicationCard {
  const pictogram = card.pictogram;
  return {
    ...card,
    pictogram: Array.isArray(pictogram)
      ? pictogram.map((source) => ({ ...source }))
      : typeof pictogram === 'object' && pictogram !== null
        ? { ...pictogram }
        : pictogram,
  };
}

export function sentenceReducer(state: SentenceState, action: SentenceAction): SentenceState {
  switch (action.type) {
    case 'add':
      return {
        entries: [...state.entries, { entryId: state.nextId, card: snapshotCard(action.card) }],
        nextId: state.nextId + 1,
      };
    case 'remove':
      return { ...state, entries: state.entries.filter((entry) => entry.entryId !== action.entryId) };
    case 'remove-card':
      return { ...state, entries: state.entries.filter((entry) => entry.card.id !== action.cardId) };
    case 'clear':
      return { ...state, entries: [] };
  }
}

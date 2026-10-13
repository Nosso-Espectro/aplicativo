import { createSentenceState, sentenceReducer } from '../../../../src/features/communication/sentence/sentence-state';
import type { CommunicationCard } from '../../../../src/features/communication/board/initial-cards';

const water: CommunicationCard = { id: 'water', title: 'Água', categoryId: 'needs', pictogram: { uri: 'file:///water.png' } };
const help: CommunicationCard = { id: 'help', title: 'Ajuda', categoryId: 'requests' };

describe('US-002 sentence state (RF-005 to RF-008)', () => {
  it('preserves selection order, duplicates and removes only the selected occurrence', () => {
    let state = createSentenceState();
    for (const card of [water, help, water]) state = sentenceReducer(state, { type: 'add', card });
    expect(state.entries.map((entry) => entry.card.title)).toEqual(['Água', 'Ajuda', 'Água']);
    state = sentenceReducer(state, { type: 'remove', entryId: state.entries[0].entryId });
    expect(state.entries.map((entry) => entry.card.title)).toEqual(['Ajuda', 'Água']);
  });

  it('clears the sentence and starts a new session empty', () => {
    const state = sentenceReducer(createSentenceState(), { type: 'add', card: water });
    expect(sentenceReducer(state, { type: 'clear' }).entries).toEqual([]);
    expect(createSentenceState().entries).toEqual([]);
    expect(state.entries).toHaveLength(1);
  });

  it('retains the selected title and local image when the source card changes', () => {
    const card = { ...water, pictogram: { uri: 'file:///original.png' } };
    const state = sentenceReducer(createSentenceState(), { type: 'add', card });
    card.title = 'Título editado';
    card.pictogram.uri = 'file:///edited.png';
    expect(state.entries[0].card.title).toBe('Água');
    expect(state.entries[0].card.pictogram).toEqual({ uri: 'file:///original.png' });
  });

  it('does not impose a functional sentence limit', () => {
    let state = createSentenceState();
    for (let i = 0; i < 1000; i++) state = sentenceReducer(state, { type: 'add', card: water });
    expect(state.entries).toHaveLength(1000);
    expect(new Set(state.entries.map((entry) => entry.entryId)).size).toBe(1000);
  });

  it('removes all references to a deleted card without reordering other entries', () => {
    let state = createSentenceState();
    for (const card of [help, water, help, water]) state = sentenceReducer(state, { type: 'add', card });
    state = sentenceReducer(state, { type: 'remove-card', cardId: water.id });
    expect(state.entries.map((entry) => entry.card.title)).toEqual(['Ajuda', 'Ajuda']);
  });
});

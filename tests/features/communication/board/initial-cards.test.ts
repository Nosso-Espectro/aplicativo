import { categories, initialCards } from '../../../../src/features/communication/board/initial-cards';

describe('US-001 approved offline catalog (RF-001/RF-002)', () => {
  it('contains every essential message once in its approved category', () => {
    expect(initialCards.map((card) => card.title)).toEqual([
      'Sim', 'Não', 'Ajuda', 'Água', 'Banheiro', 'Fome',
      'Dor', 'Silêncio', 'Sair daqui', 'Preciso de tempo',
    ]);
    expect(new Set(initialCards.map((card) => card.id)).size).toBe(10);
    expect(categories.map((category) => initialCards
      .filter((card) => card.categoryId === category.id)
      .map((card) => card.title))).toEqual([
      ['Água', 'Banheiro', 'Fome'],
      ['Dor'],
      ['Sim', 'Não', 'Ajuda', 'Silêncio', 'Sair daqui', 'Preciso de tempo'],
    ]);
  });
});

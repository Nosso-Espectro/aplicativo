import { validateCard, validatedCard } from '../../../../src/features/communication/custom-cards/custom-card-validation';

describe('custom card validation — RF-013', () => {
  it.each(['', '   ', '\n\t', '\u00a0'])('rejects an empty title %p without changing the draft', (title) => {
    const draft = { title, categoryId: 'needs', imageUri: null };
    expect(validateCard(draft).title).toBeTruthy();
    expect(draft.title).toBe(title);
    expect(() => validatedCard(draft)).toThrow();
  });
  it.each(['', 'unknown'])('rejects category %p', (categoryId) => {
    expect(validateCard({ title: 'Teste', categoryId, imageUri: null }).categoryId).toBeTruthy();
  });
  it('trims only the ends and accepts a card without image', () => {
    expect(validatedCard({ title: '  Teste de cartão  ', categoryId: 'feelings', imageUri: null }))
      .toEqual({ title: 'Teste de cartão', categoryId: 'feelings', imageUri: null });
  });
});

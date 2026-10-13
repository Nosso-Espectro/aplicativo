import { categories, type CategoryId } from '../board/initial-cards';

export type CardDraft = { title: string; categoryId: string; imageUri: string | null };
export type CustomCard = { id: string; title: string; categoryId: CategoryId; imageUri: string | null };
export function validateCard(draft: CardDraft) {
  return {
    title: draft.title.trim() ? null : 'Informe o título do cartão.',
    categoryId: categories.some((category) => category.id === draft.categoryId)
      ? null : 'Selecione uma categoria.',
  };
}
export function validatedCard(draft: CardDraft): Omit<CustomCard, 'id'> {
  const errors = validateCard(draft);
  if (errors.title || errors.categoryId) throw new Error('Invalid card.');
  return { ...draft, title: draft.title.trim(), categoryId: draft.categoryId as CategoryId };
}

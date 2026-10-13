import type { CardDatabase } from '../storage/card-database';
import { validatedCard, type CardDraft } from './custom-card-validation';
import { localImages } from './local-image-storage';

export function createCardStorage(db: CardDatabase, images = localImages) {
  return {
    list: () => db.list(),
    async save(draft: CardDraft, id?: string, previousImage: string | null = null) {
      const card = validatedCard(draft);
      let copied: string | null = null;
      try {
        if (card.imageUri && card.imageUri !== previousImage) {
          copied = await images.copy(card.imageUri);
          card.imageUri = copied;
        }
        return await db.save(card, id);
      } catch {
        if (copied) await images.remove(copied).catch(() => undefined);
        throw new Error('Unable to save card.');
      }
    },
    remove: (id: string) => db.remove(id),
    // Old files survive edits during this session so sentence image snapshots stay valid.
    async prune() {
      const cards = await db.list();
      await images.prune(cards.flatMap((card) => card.imageUri ? [card.imageUri] : []));
    },
  };
}

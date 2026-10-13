import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { categories, initialCards } from '../board/initial-cards';
import type { CustomCard } from '../custom-cards/custom-card-validation';

export const schema = `
CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, label TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY, origin TEXT NOT NULL CHECK(origin IN ('initial', 'custom')),
  title TEXT NOT NULL CHECK(length(trim(title)) > 0),
  category_id TEXT NOT NULL REFERENCES categories(id), image_uri TEXT
);
CREATE TABLE IF NOT EXISTS favorites (
  card_id TEXT PRIMARY KEY REFERENCES cards(id) ON DELETE CASCADE,
  position INTEGER NOT NULL UNIQUE
);
PRAGMA user_version = 1;`;

export interface CardDatabase {
  list(): Promise<CustomCard[]>;
  save(card: Omit<CustomCard, 'id'>, id?: string): Promise<CustomCard[]>;
  remove(id: string): Promise<CustomCard[]>;
}
type Row = { id: string; title: string; category_id: CustomCard['categoryId']; image_uri: string | null };
async function readCards(db: SQLiteDatabase): Promise<CustomCard[]> {
  const rows = await db.getAllAsync<Row>("SELECT * FROM cards WHERE origin = 'custom' ORDER BY rowid");
  return rows.map((row) => ({ id: row.id, title: row.title, categoryId: row.category_id, imageUri: row.image_uri }));
}

export async function openCardDatabase(): Promise<CardDatabase> {
  const db = await openDatabaseAsync('tear.db');
  try {
    await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
    await db.withExclusiveTransactionAsync(async (tx) => {
      await tx.execAsync(schema);
      for (const category of categories) {
        await tx.runAsync('INSERT OR IGNORE INTO categories (id, label) VALUES (?, ?)', category.id, category.title);
      }
      for (const card of initialCards) {
        await tx.runAsync("INSERT OR IGNORE INTO cards (id, origin, title, category_id) VALUES (?, 'initial', ?, ?)", card.id, card.title, card.categoryId);
      }
    });
  } catch {
    await db.closeAsync();
    throw new Error('Local storage unavailable.');
  }
  // Serialize reads and mutations; only publish the rows from a committed transaction.
  let pending: Promise<unknown> = Promise.resolve();
  const enqueue = (operation: () => Promise<CustomCard[]>) => {
    const next = pending.then(operation);
    pending = next.catch(() => undefined);
    return next;
  };
  return {
    list: () => enqueue(() => readCards(db)),
    save: (card, id) => enqueue(async () => {
      let rows: CustomCard[] = [];
      await db.withExclusiveTransactionAsync(async (tx) => {
        if (id) {
          const result = await tx.runAsync("UPDATE cards SET title = ?, category_id = ?, image_uri = ? WHERE id = ? AND origin = 'custom'", card.title, card.categoryId, card.imageUri, id);
          if (result.changes !== 1) throw new Error('Card unavailable.');
        } else {
          await tx.runAsync("INSERT INTO cards (id, origin, title, category_id, image_uri) VALUES ('custom-' || lower(hex(randomblob(16))), 'custom', ?, ?, ?)", card.title, card.categoryId, card.imageUri);
        }
        rows = await readCards(tx);
      });
      return rows;
    }),
    remove: (id) => enqueue(async () => {
      let rows: CustomCard[] = [];
      await db.withExclusiveTransactionAsync(async (tx) => {
        const result = await tx.runAsync("DELETE FROM cards WHERE id = ? AND origin = 'custom'", id);
        if (result.changes !== 1) throw new Error('Card unavailable.');
        rows = await readCards(tx);
      });
      return rows;
    }),
  };
}

import type { CardDatabase } from './card-database';

export async function openCardDatabase(): Promise<CardDatabase> {
  throw new Error('Native storage required.');
}

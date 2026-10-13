import { createCardStorage } from '../../../../src/features/communication/custom-cards/custom-card-storage';
import type { CustomCard } from '../../../../src/features/communication/custom-cards/custom-card-validation';
jest.mock('../../../../src/features/communication/custom-cards/local-image-storage', () => ({ localImages: {} }));
const draft = { title: '  Teste  ', categoryId: 'needs', imageUri: null };
function setup() {
  const db = { list: jest.fn<Promise<CustomCard[]>, []>().mockResolvedValue([]), save: jest.fn().mockResolvedValue([]), remove: jest.fn().mockResolvedValue([]), listFavorites: jest.fn().mockResolvedValue([]), setFavorite: jest.fn().mockResolvedValue([]) };
  const images = { copy: jest.fn().mockResolvedValue('file:///private/copy.jpg'), remove: jest.fn().mockResolvedValue(undefined), prune: jest.fn().mockResolvedValue(undefined) };
  return { db, images, storage: createCardStorage(db, images) };
}
it('saves optional-image cards without copying anything', async () => {
  const { storage, db, images } = setup();
  await storage.save(draft);
  expect(db.save).toHaveBeenCalledWith({ title: 'Teste', categoryId: 'needs', imageUri: null }, undefined);
  expect(images.copy).not.toHaveBeenCalled();
});
it('copies accepted images before committing a private URI', async () => {
  const { storage, db, images } = setup();
  await storage.save({ ...draft, imageUri: 'file:///cache/test.jpg' });
  expect(images.copy).toHaveBeenCalledWith('file:///cache/test.jpg');
  expect(db.save).toHaveBeenCalledWith(expect.objectContaining({ imageUri: 'file:///private/copy.jpg' }), undefined);
});
it('does not copy unchanged images on edit or delete old session snapshot files', async () => {
  const { storage, images } = setup();
  await storage.save({ ...draft, imageUri: 'file:///private/old.jpg' }, 'custom-test', 'file:///private/old.jpg');
  expect(images.copy).not.toHaveBeenCalled();
  expect(images.remove).not.toHaveBeenCalled();
});
it('copy failure leaves original draft intact and does not commit', async () => {
  const { storage, db, images } = setup();
  images.copy.mockRejectedValue(new Error('private path'));
  const input = { ...draft, imageUri: 'file:///cache/test.jpg' };
  await expect(storage.save(input)).rejects.toThrow('Unable to save card.');
  expect(input.imageUri).toBe('file:///cache/test.jpg');
  expect(db.save).not.toHaveBeenCalled();
});
it('failed commit removes only the new copy and supports retry', async () => {
  const { storage, db, images } = setup();
  db.save.mockRejectedValueOnce(new Error('full disk'));
  const input = { ...draft, imageUri: 'file:///cache/test.jpg' };
  await expect(storage.save(input, 'custom-test', 'file:///private/old.jpg')).rejects.toThrow('Unable to save card.');
  expect(images.remove).toHaveBeenCalledWith('file:///private/copy.jpg');
  await expect(storage.save(input)).resolves.toEqual([]);
});
it('startup cleanup retains only persisted image URIs', async () => {
  const { storage, db, images } = setup();
  db.list.mockResolvedValue([{ id: 'custom-test', title: 'Teste', categoryId: 'needs', imageUri: 'file:///private/saved.jpg' }]);
  await storage.prune();
  expect(images.prune).toHaveBeenCalledWith(['file:///private/saved.jpg']);
});
it('rejects invalid cards before touching image storage or database', async () => {
  const { storage, db, images } = setup();
  await expect(storage.save({ ...draft, title: ' ' })).rejects.toThrow();
  expect(db.save).not.toHaveBeenCalled(); expect(images.copy).not.toHaveBeenCalled();
});

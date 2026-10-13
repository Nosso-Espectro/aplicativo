import { createRoutineStorage } from '../../../src/features/routines/routine-storage';
import type { RoutineDatabase } from '../../../src/features/routines/routine-database';
import type { Routine } from '../../../src/features/routines/routine-model';
jest.mock('expo-file-system', () => ({ Directory: jest.fn(), File: jest.fn(), Paths: { document: 'file:///private/' } }));
const images = { copy: jest.fn(), remove: jest.fn(), prune: jest.fn() };
const db: RoutineDatabase = { list: jest.fn(), save: jest.fn(), progress: jest.fn() };
beforeEach(() => { jest.clearAllMocks(); images.copy.mockResolvedValue('file:///private/routine-images/copied.png'); images.remove.mockResolvedValue(undefined); });
it('copies only changed images and retains unchanged private references', async () => {
  const previous: Routine = { id: 'routine-a', name: 'Teste', steps: [{ id: 'a', title: 'Uma', imageUri: 'file:///private/routine-images/existing.png' }] };
  jest.mocked(db.save).mockResolvedValue([]);
  await createRoutineStorage(db, images).save({ name: 'Editada', steps: [...previous.steps, { id: 'b', title: 'Duas', imageUri: 'content://picker/test.png' }] }, previous);
  expect(images.copy).toHaveBeenCalledTimes(1);
  expect(db.save).toHaveBeenCalledWith({ name: 'Editada', steps: [previous.steps[0], { id: 'b', title: 'Duas', imageUri: 'file:///private/routine-images/copied.png' }] }, 'routine-a');
});
it('removes newly copied images after commit failure, never prior saved images', async () => {
  jest.mocked(db.save).mockRejectedValueOnce(new Error('synthetic private error'));
  await expect(createRoutineStorage(db, images).save({ name: 'Teste', steps: [{ id: 'a', title: 'Etapa', imageUri: 'file:///cache/test.png' }] })).rejects.toThrow('Could not save routine.');
  expect(images.remove).toHaveBeenCalledWith('file:///private/routine-images/copied.png');
});
it('rejects remote images without persisting or downloading them', async () => {
  await expect(createRoutineStorage(db, images).save({ name: 'Teste', steps: [{ id: 'a', title: 'Etapa', imageUri: 'https://example.com/test.png' }] })).rejects.toThrow();
  expect(db.save).not.toHaveBeenCalled(); expect(images.copy).not.toHaveBeenCalled();
});
it('prunes only the routine namespace with all retained image references', async () => {
  jest.mocked(db.list).mockResolvedValue([{ id: 'r', name: 'Teste', steps: [{ id: 'a', title: 'Etapa', imageUri: 'file:///private/routine-images/keep.png' }] }]);
  await createRoutineStorage(db, images).prune();
  expect(images.prune).toHaveBeenCalledWith(['file:///private/routine-images/keep.png']);
});
it('cleans earlier copies when a later step image fails before the transaction', async () => {
  images.copy.mockResolvedValueOnce('file:///private/routine-images/first.png').mockRejectedValueOnce(new Error('synthetic copy failure'));
  await expect(createRoutineStorage(db, images).save({ name: 'Teste', steps: [
    { id: 'a', title: 'Primeira', imageUri: 'file:///cache/first.png' },
    { id: 'b', title: 'Segunda', imageUri: 'file:///cache/second.png' },
  ] })).rejects.toThrow('Could not save routine.');
  expect(db.save).not.toHaveBeenCalled();
  expect(images.remove).toHaveBeenCalledWith('file:///private/routine-images/first.png');
});

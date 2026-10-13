import { Directory, File } from 'expo-file-system';
import { localImages } from '../../../../src/features/communication/custom-cards/local-image-storage';
jest.mock('expo-file-system', () => ({ File: jest.fn(), Directory: jest.fn(), Paths: { document: 'file:///private/' } }));
const copy = jest.fn(); const remove = jest.fn(); const create = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(Directory).mockImplementation(() => ({ uri: 'file:///private/communication-images/', create } as unknown as Directory));
  jest.mocked(File).mockImplementation((...paths) => ({
    uri: paths.length === 1 ? paths[0] : `file:///private/communication-images/${paths[1]}`,
    extension: '.png', exists: true, size: 24, copy, delete: remove,
  } as unknown as File));
});
it('copies local media into the private directory, retaining the format', async () => {
  const uri = await localImages.copy('file:///cache/synthetic.png');
  expect(uri).toMatch(/^file:\/\/\/private\/communication-images\/.*\.png$/);
  expect(create).toHaveBeenCalledWith({ intermediates: true, idempotent: true });
  expect(copy).toHaveBeenCalledTimes(1);
});
it('rejects remote media before creating or copying files', async () => {
  await expect(localImages.copy('https://example.com/synthetic.png')).rejects.toThrow('Local image required.');
  expect(copy).not.toHaveBeenCalled(); expect(create).not.toHaveBeenCalled();
});
it('never deletes an external picker source and accepts a trailing directory slash', async () => {
  await localImages.remove('file:///cache/synthetic.png');
  expect(remove).not.toHaveBeenCalled();
  await localImages.remove('file:///private/communication-images/synthetic.png');
  expect(remove).toHaveBeenCalledTimes(1);
});
it('cleans up a failed copy and returns only a generic error', async () => {
  copy.mockImplementationOnce(() => { throw new Error('private path'); });
  await expect(localImages.copy('file:///cache/synthetic.png')).rejects.toThrow('Image unavailable.');
  expect(remove).toHaveBeenCalledTimes(1);
});

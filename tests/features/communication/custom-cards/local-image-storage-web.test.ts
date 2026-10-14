import { createLocalImageStorage, isLocalImage, localImages } from '../../../../src/features/communication/custom-cards/local-image-storage.web';

it('exports the factory required by routines without importing a native filesystem', async () => {
  const routines = createLocalImageStorage('routine-images');
  expect(routines).not.toBe(localImages);
  await expect(routines.copy('file:///synthetic.png')).rejects.toThrow('Native image storage required.');
  await expect(localImages.copy('https://example.invalid/synthetic.png')).rejects.toThrow('Native image storage required.');
  await expect(routines.prune([])).resolves.toBeUndefined();
  await expect(routines.remove('file:///synthetic.png')).resolves.toBeUndefined();
});
it('retains local URI validation and never accepts a remote or browser blob as native storage', () => {
  expect(isLocalImage('file:///synthetic.png')).toBe(true);
  expect(isLocalImage('content://synthetic/image')).toBe(true);
  expect(isLocalImage('https://example.invalid/synthetic.png')).toBe(false);
  expect(isLocalImage('blob:synthetic')).toBe(false);
});

import * as Picker from 'expo-image-picker';
import { pickCardImage } from '../../../../src/features/communication/custom-cards/media-picker';
jest.mock('expo-image-picker', () => ({ requestCameraPermissionsAsync: jest.fn(), launchCameraAsync: jest.fn(), launchImageLibraryAsync: jest.fn() }));
const cameraPermission = jest.mocked(Picker.requestCameraPermissionsAsync);
const library = jest.mocked(Picker.launchImageLibraryAsync);
const camera = jest.mocked(Picker.launchCameraAsync);
beforeEach(() => jest.resetAllMocks());

it('asks for camera permission only on explicit camera choice, and handles denial', async () => {
  cameraPermission.mockResolvedValue({ granted: false } as Awaited<ReturnType<typeof Picker.requestCameraPermissionsAsync>>);
  expect((await pickCardImage('camera')).message).toMatch(/sem imagem/);
  expect(camera).not.toHaveBeenCalled();
});
it('uses the system image/file picker without requesting broad library/camera permission', async () => {
  library.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///cache/test.png' }] } as Picker.ImagePickerResult);
  expect(await pickCardImage('file')).toEqual({ uri: 'file:///cache/test.png' });
  expect(cameraPermission).not.toHaveBeenCalled();
  expect(library).toHaveBeenCalledWith(expect.objectContaining({ shouldDownloadFromNetwork: false, base64: false, exif: false, mediaTypes: ['images'] }));
});
it('opens camera after permission is granted', async () => {
  cameraPermission.mockResolvedValue({ granted: true } as Awaited<ReturnType<typeof Picker.requestCameraPermissionsAsync>>);
  camera.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///cache/camera.jpg' }] } as Picker.ImagePickerResult);
  expect(await pickCardImage('camera')).toEqual({ uri: 'file:///cache/camera.jpg' });
});
it('cancellation leaves the draft alone', async () => {
  library.mockResolvedValue({ canceled: true, assets: null });
  expect(await pickCardImage('file')).toEqual({});
});
it('rejects remote image URIs without attempting a download', async () => {
  library.mockResolvedValue({ canceled: false, assets: [{ uri: 'https://example.com/image.png' }] } as Picker.ImagePickerResult);
  expect((await pickCardImage('file')).message).toMatch(/sem imagem/);
});
it('hides native exception content and offers visual recovery', async () => {
  library.mockRejectedValue(new Error('private text and path'));
  expect((await pickCardImage('file')).message).toBe('Não foi possível obter a imagem. Você pode salvar sem imagem ou tentar novamente.');
});

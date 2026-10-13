import * as ImagePicker from 'expo-image-picker';

export type MediaResult = { uri?: string; message?: string };
export async function pickCardImage(source: 'file' | 'camera'): Promise<MediaResult> {
  try {
    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return { message: 'Câmera não autorizada. Você pode salvar sem imagem ou escolher um arquivo.' };
    }
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'], allowsEditing: false, quality: 1,
      base64: false, exif: false, allowsMultipleSelection: false,
      shouldDownloadFromNetwork: false,
    };
    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled) return {};
    const uri = result.assets[0]?.uri;
    if (!uri || (!uri.startsWith('file://') && !uri.startsWith('content://'))) {
      return { message: 'Imagem indisponível no dispositivo. Você pode salvar sem imagem.' };
    }
    return { uri };
  } catch {
    return { message: 'Não foi possível obter a imagem. Você pode salvar sem imagem ou tentar novamente.' };
  }
}

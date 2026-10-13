import { Directory, File, Paths } from 'expo-file-system';

export function isLocalImage(uri: string) {
  return uri.startsWith('file://') || uri.startsWith('content://');
}
export function createLocalImageStorage(directoryName: string) {
  const imageDirectory = () => new Directory(Paths.document, directoryName);
  return {
    async copy(uri: string): Promise<string> {
      if (!isLocalImage(uri)) throw new Error('Local image required.');
      const folder = imageDirectory();
      folder.create({ intermediates: true, idempotent: true });
      const extension = new File(uri).extension.replace(/[^a-zA-Z0-9.]/g, '') || '.jpg';
      const destination = new File(folder, `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`);
      try {
        new File(uri).copy(destination);
        if (!destination.exists || destination.size === 0) throw new Error('Image unavailable.');
        return destination.uri;
      } catch {
        if (destination.exists) destination.delete();
        throw new Error('Image unavailable.');
      }
    },
    async remove(uri: string) {
      const folder = imageDirectory();
      const prefix = folder.uri.endsWith('/') ? folder.uri : `${folder.uri}/`;
      if (!uri.startsWith(prefix)) return;
      const file = new File(uri);
      if (file.exists) file.delete();
    },
    async prune(retained: readonly string[]) {
      const folder = imageDirectory();
      if (!folder.exists) return;
      const keep = new Set(retained);
      for (const file of folder.list()) {
        if (file instanceof File && !keep.has(file.uri)) file.delete();
      }
    },
  };
}
export const localImages = createLocalImageStorage('communication-images');

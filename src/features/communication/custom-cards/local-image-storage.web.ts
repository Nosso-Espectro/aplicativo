export function isLocalImage(uri: string) {
  return uri.startsWith('file://') || uri.startsWith('content://');
}
export function createLocalImageStorage(_directoryName: string) {
  return {
    async copy(_uri: string): Promise<string> { throw new Error('Native image storage required.'); },
    async remove(_uri: string) {},
    async prune(_retained: readonly string[]) {},
  };
}
export const localImages = createLocalImageStorage('communication-images');

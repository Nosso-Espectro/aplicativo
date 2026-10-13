export const localImages = {
  async copy(_uri: string): Promise<string> { throw new Error('Native image storage required.'); },
  async remove(_uri: string) {},
  async prune(_retained: readonly string[]) {},
};

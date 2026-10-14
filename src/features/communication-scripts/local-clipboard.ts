let queue: Promise<void> = Promise.resolve();
export const localClipboard = {
  async copy(text: string): Promise<boolean> {
    if (typeof text !== 'string' || !text.trim()) throw new Error('Invalid clipboard text');
    const operation = queue.then(async () => {
      // Load the SDK only for an explicit copy, matching other local capabilities.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sdk = require('expo-clipboard') as typeof import('expo-clipboard');
      return await sdk.setStringAsync(text, { inputFormat: sdk.StringFormat.PLAIN_TEXT }) === true;
    });
    // A late write from a previous screen must precede a newer human copy.
    queue = operation.then(() => undefined, () => undefined);
    return operation;
  },
};

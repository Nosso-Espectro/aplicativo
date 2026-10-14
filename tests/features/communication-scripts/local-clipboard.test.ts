import { setStringAsync, getStringAsync, addClipboardListener } from 'expo-clipboard';
import { localClipboard } from '../../../src/features/communication-scripts/local-clipboard';
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(), getStringAsync: jest.fn(), addClipboardListener: jest.fn(), StringFormat: { PLAIN_TEXT: 'plainText' } }));
beforeEach(() => { jest.clearAllMocks(); jest.mocked(setStringAsync).mockResolvedValue(true); });
it('copies plain literal text only when requested and never reads or watches the previous clipboard', async () => {
  expect(setStringAsync).not.toHaveBeenCalled();
  expect(await localClipboard.copy('  Texto sintético\ncom duas linhas.  ')).toBe(true);
  expect(setStringAsync).toHaveBeenCalledWith('  Texto sintético\ncom duas linhas.  ', { inputFormat: 'plainText' });
  expect(getStringAsync).not.toHaveBeenCalled(); expect(addClipboardListener).not.toHaveBeenCalled();
});
it('rejects an empty request before writing and preserves false or rejected writes without false success', async () => {
  await expect(localClipboard.copy('  ')).rejects.toThrow(); expect(setStringAsync).not.toHaveBeenCalled();
  jest.mocked(setStringAsync).mockResolvedValueOnce(false); expect(await localClipboard.copy('Teste')).toBe(false);
  jest.mocked(setStringAsync).mockRejectedValueOnce(new Error('synthetic failure'));
  await expect(localClipboard.copy('Teste')).rejects.toThrow('synthetic failure');
  expect(await localClipboard.copy('Tentar de novo')).toBe(true);
});
it('serializes human copies across screens so a late write cannot overwrite the newer request', async () => {
  let release!: (value: boolean) => void;
  jest.mocked(setStringAsync).mockImplementationOnce(() => new Promise(resolve => { release = resolve; }));
  const first = localClipboard.copy('Primeira'); const second = localClipboard.copy('Segunda');
  await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  expect(setStringAsync).toHaveBeenCalledTimes(1); release(true);
  expect(await first).toBe(true); expect(await second).toBe(true);
  expect(jest.mocked(setStringAsync).mock.calls.map(call => call[0])).toEqual(['Primeira', 'Segunda']);
});

import { Platform } from 'react-native';
import { openHistoryDatabase } from '../../../src/features/history/history-database';
import { historyStorage } from '../../../src/features/history/history-storage';
jest.mock('../../../src/features/history/history-database', () => ({ openHistoryDatabase: jest.fn() }));
it('rejects web without opening SQLite, retries opening failure and reuses only successful opening', async () => {
  const os = Platform.OS;
  try {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    await expect(historyStorage()).rejects.toThrow(); expect(openHistoryDatabase).not.toHaveBeenCalled();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    jest.mocked(openHistoryDatabase).mockRejectedValueOnce(new Error('synthetic open failure'));
    await expect(historyStorage()).rejects.toThrow();
    const db = { list: jest.fn(), save: jest.fn(), remove: jest.fn() }; jest.mocked(openHistoryDatabase).mockResolvedValueOnce(db);
    expect(await historyStorage()).toBe(db); expect(await historyStorage()).toBe(db);
    expect(openHistoryDatabase).toHaveBeenCalledTimes(2);
  } finally { Object.defineProperty(Platform, 'OS', { configurable: true, value: os }); }
});

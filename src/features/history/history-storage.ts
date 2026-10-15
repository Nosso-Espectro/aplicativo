import { Platform } from 'react-native';
import { openHistoryDatabase, type HistoryDatabase } from './history-database';

let opening: Promise<HistoryDatabase> | null = null;
export function historyStorage(): Promise<HistoryDatabase> {
  if (Platform.OS === 'web') return Promise.reject(new Error('History unavailable on web.'));
  opening ??= openHistoryDatabase().catch(error => { opening = null; throw error; });
  return opening;
}

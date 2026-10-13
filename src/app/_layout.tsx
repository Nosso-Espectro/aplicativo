import { Stack } from 'expo-router';
import { SentenceProvider } from '../features/communication/sentence/SentenceProvider';

export default function RootLayout() {
  return (
    <SentenceProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SentenceProvider>
  );
}

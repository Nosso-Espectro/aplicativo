import { Stack } from 'expo-router';
import { SentenceProvider } from '../features/communication/sentence/SentenceProvider';
import { CustomCardsProvider } from '../features/communication/custom-cards/CustomCardsProvider';

export default function RootLayout() {
  return (
    <SentenceProvider>
      <CustomCardsProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </CustomCardsProvider>
    </SentenceProvider>
  );
}

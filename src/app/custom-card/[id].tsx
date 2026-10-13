import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from 'react-native';
import { CustomCardEditor } from '../../features/communication/custom-cards/CustomCardEditor';
import { useCustomCards } from '../../features/communication/custom-cards/CustomCardsProvider';

export default function EditCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { loading } = useCustomCards();
  if (loading) return <Text accessibilityLiveRegion="polite">Abrindo cartão…</Text>;
  return <CustomCardEditor key={id} id={id} onClose={() => router.canGoBack() ? router.back() : router.replace('/')} />;
}

import { useRouter } from 'expo-router';
import { CustomCardEditor } from '../../features/communication/custom-cards/CustomCardEditor';

export default function NewCardScreen() {
  const router = useRouter();
  return <CustomCardEditor onClose={() => router.canGoBack() ? router.back() : router.replace('/')} />;
}

import { useRouter } from 'expo-router';
import { TrustedContactScreen } from '../features/support-plan/TrustedContactScreen';

export default function TrustedContactRoute() {
  const router = useRouter();
  return <TrustedContactScreen onClose={() => router.canGoBack() ? router.back() : router.replace('/')} />;
}

import { useRouter } from 'expo-router';
import { SupportCardScreen } from '../features/support-plan/SupportCardScreen';

export default function SupportCardRoute() {
  const router = useRouter();
  return <SupportCardScreen onClose={() => router.canGoBack() ? router.back() : router.replace('/regulation')} />;
}

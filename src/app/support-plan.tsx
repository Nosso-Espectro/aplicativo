import { useRouter } from 'expo-router';
import { SupportPlanScreen } from '../features/support-plan/SupportPlanScreen';

export default function SupportPlanRoute() {
  const router = useRouter();
  return <SupportPlanScreen onClose={() => router.canGoBack() ? router.back() : router.replace('/')} />;
}

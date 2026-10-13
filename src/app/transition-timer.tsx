import { useRouter } from 'expo-router';
import { TransitionTimerScreen } from '../features/transition-timer/TransitionTimerScreen';
export default function TransitionTimerRoute() {
  const router = useRouter();
  return <TransitionTimerScreen onClose={() => router.canGoBack() ? router.back() : router.replace('/')} />;
}

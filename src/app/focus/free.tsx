import { useRouter } from 'expo-router';
import { StopwatchProvider } from '../../features/focus/StopwatchProvider';
import { StopwatchScreen } from '../../features/focus/StopwatchScreen';
export default function FreeStopwatchRoute() {
  const router = useRouter();
  return <StopwatchProvider><StopwatchScreen onClose={() => router.canGoBack() ? router.back() : router.replace('/focus')} /></StopwatchProvider>;
}

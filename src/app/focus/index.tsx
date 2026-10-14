import { PomodoroScreen } from '../../features/focus/PomodoroScreen';
import { usePanelReturn } from '../../features/regulation/usePanelReturn';
import { useRouter } from 'expo-router';
export default function FocusRoute() {
  const router = useRouter();
  return <PomodoroScreen onClose={usePanelReturn('Voltar ao quadro').onClose} onFree={() => router.push('/focus/free')} />;
}

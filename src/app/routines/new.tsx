import { useRouter } from 'expo-router';
import { RoutineEditor } from '../../features/routines/RoutineEditor';

export default function NewRoutineScreen() {
  const router = useRouter();
  return <RoutineEditor onClose={() => router.canGoBack() ? router.back() : router.replace('/routines')} />;
}

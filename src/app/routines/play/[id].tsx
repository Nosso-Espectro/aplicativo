import { useLocalSearchParams, useRouter } from 'expo-router';
import { RoutinePlayer } from '../../../features/routines/RoutinePlayer';

export default function PlayRoutineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return <RoutinePlayer id={id} onClose={() => router.canGoBack() ? router.back() : router.replace('/routines')}
    onEdit={() => router.push({ pathname: '/routines/[id]', params: { id } })} />;
}

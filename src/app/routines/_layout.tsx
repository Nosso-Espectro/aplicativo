import { Stack } from 'expo-router';
import { RoutineProvider } from '../../features/routines/RoutineProvider';

export default function RoutinesLayout() {
  return <RoutineProvider><Stack screenOptions={{ headerShown: false }} /></RoutineProvider>;
}

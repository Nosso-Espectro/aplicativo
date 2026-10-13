import { Stack } from 'expo-router';
import { RoutineProvider } from '../../features/routines/RoutineProvider';
import { useLowStimulationPresentation } from '../../features/regulation/LowStimulationProvider';

export default function RoutinesLayout() {
  const { navigationAnimation } = useLowStimulationPresentation();
  return <RoutineProvider><Stack screenOptions={{ headerShown: false, animation: navigationAnimation }} /></RoutineProvider>;
}

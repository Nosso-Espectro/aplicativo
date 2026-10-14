import { Stack } from 'expo-router';
import { useLowStimulationPresentation } from '../../features/regulation/LowStimulationProvider';
export default function CheckInLayout() {
  const { navigationAnimation } = useLowStimulationPresentation();
  return <Stack screenOptions={{ headerShown: false, animation: navigationAnimation }} />;
}

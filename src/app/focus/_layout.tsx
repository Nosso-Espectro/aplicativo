import { Stack } from 'expo-router';
import { PomodoroProvider } from '../../features/focus/PomodoroProvider';
import { useLowStimulationPresentation } from '../../features/regulation/LowStimulationProvider';
export default function FocusLayout() {
  const { navigationAnimation } = useLowStimulationPresentation();
  return <PomodoroProvider><Stack screenOptions={{ headerShown: false, animation: navigationAnimation, gestureEnabled: false }} /></PomodoroProvider>;
}

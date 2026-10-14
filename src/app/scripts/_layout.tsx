import { Stack } from 'expo-router';
import { useLowStimulationPresentation } from '../../features/regulation/LowStimulationProvider';
import { ScriptProvider } from '../../features/communication-scripts/ScriptProvider';
export default function ScriptsLayout() {
  const { navigationAnimation } = useLowStimulationPresentation();
  return <ScriptProvider><Stack screenOptions={{ headerShown: false, animation: navigationAnimation }} /></ScriptProvider>;
}

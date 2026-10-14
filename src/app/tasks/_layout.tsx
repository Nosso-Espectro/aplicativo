import { Stack } from 'expo-router';
import { TaskProvider } from '../../features/task-breakdown/TaskProvider';
import { useLowStimulationPresentation } from '../../features/regulation/LowStimulationProvider';
export default function TasksLayout() {
  const { navigationAnimation } = useLowStimulationPresentation();
  return <TaskProvider><Stack screenOptions={{ headerShown: false, animation: navigationAnimation }} /></TaskProvider>;
}

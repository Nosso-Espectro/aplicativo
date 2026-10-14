import { useRouter } from 'expo-router';
import { TaskEditor } from '../../features/task-breakdown/TaskEditor';
export default function NewTaskScreen() {
  const router = useRouter();
  return <TaskEditor onClose={() => router.replace('/tasks')} />;
}

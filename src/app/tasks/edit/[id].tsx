import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTasks } from '../../../features/task-breakdown/TaskProvider';
import { TaskEditor } from '../../../features/task-breakdown/TaskEditor';
import { TaskUnavailable } from '../../../features/task-breakdown/TaskUnavailable';
export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const router = useRouter(); const context = useTasks();
  const task = typeof id === 'string' ? context.tasks.find(value => value.id === id) : undefined;
  const close = () => task ? router.replace({ pathname: '/tasks/[id]', params: { id: task.id } }) : router.replace('/tasks');
  if (context.loading || context.error || !task) return <TaskUnavailable onClose={() => router.replace('/tasks')} />;
  return <TaskEditor key={id} task={task} onClose={close} />;
}

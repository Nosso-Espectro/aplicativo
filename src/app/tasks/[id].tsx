import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTasks } from '../../features/task-breakdown/TaskProvider';
import { TaskDetail } from '../../features/task-breakdown/TaskDetail';
import { TaskUnavailable } from '../../features/task-breakdown/TaskUnavailable';
export default function TaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const router = useRouter(); const context = useTasks();
  const task = typeof id === 'string' ? context.tasks.find(value => value.id === id) : undefined;
  const close = () => router.replace('/tasks');
  if (context.loading || context.error || !task) return <TaskUnavailable onClose={close} />;
  return <TaskDetail key={id} task={task} onClose={close} onEdit={() => router.push({ pathname: '/tasks/edit/[id]', params: { id: task.id } })} />;
}

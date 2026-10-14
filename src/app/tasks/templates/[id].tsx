import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTasks } from '../../../features/task-breakdown/TaskProvider';
import { TemplateDetail } from '../../../features/task-breakdown/TemplateDetail';
import { TaskUnavailable } from '../../../features/task-breakdown/TaskUnavailable';
export default function TemplateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const router = useRouter(); const context = useTasks();
  const template = typeof id === 'string' ? context.templates.find(value => value.id === id) : undefined;
  const close = () => router.replace('/tasks/templates');
  if (context.loading || context.error || !template) return <TaskUnavailable model onClose={close} />;
  return <TemplateDetail key={id} template={template} onClose={close}
    onEdit={() => router.push({ pathname: '/tasks/templates/edit/[id]', params: { id: template.id } })}
    onCreated={task => router.replace({ pathname: '/tasks/[id]', params: { id: task.id } })} />;
}

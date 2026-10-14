import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTasks } from '../../../../features/task-breakdown/TaskProvider';
import { TaskEditor } from '../../../../features/task-breakdown/TaskEditor';
import { TaskUnavailable } from '../../../../features/task-breakdown/TaskUnavailable';
export default function EditTemplateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const router = useRouter(); const context = useTasks();
  const template = typeof id === 'string' ? context.templates.find(value => value.id === id) : undefined;
  const close = () => router.replace('/tasks/templates');
  if (context.loading || context.error || !template) return <TaskUnavailable model onClose={close} />;
  return <TaskEditor key={id} template={template} onClose={() => router.replace({ pathname: '/tasks/templates/[id]', params: { id: template.id } })} />;
}

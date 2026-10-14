import { Text } from 'react-native';
import { useTasks } from './TaskProvider';
import { TaskCommand, TaskPage, taskStyles as styles } from './TaskUI';
export function TaskUnavailable({ onClose }: { onClose(): void }) {
  const context = useTasks();
  return <TaskPage>
    <TaskCommand icon="arrow-back" label="Voltar às tarefas" onPress={onClose} />
    <Text accessibilityRole="alert" style={styles.text}>{context.loading ? 'Abrindo tarefa...' : context.error ?? 'Tarefa não encontrada.'}</Text>
    {context.error && <TaskCommand icon="refresh" label="Tentar abrir tarefas novamente" onPress={context.retry} />}
  </TaskPage>;
}

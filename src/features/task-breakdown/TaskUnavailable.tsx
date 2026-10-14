import { Text } from 'react-native';
import { useTasks } from './TaskProvider';
import { TaskCommand, TaskPage, taskStyles as styles } from './TaskUI';
export function TaskUnavailable({ onClose, model = false }: { onClose(): void; model?: boolean }) {
  const context = useTasks();
  return <TaskPage>
    <TaskCommand icon="arrow-back" label={model ? 'Voltar aos modelos' : 'Voltar às tarefas'} onPress={onClose} />
    <Text accessibilityRole="alert" style={styles.text}>{context.loading ? (model ? 'Abrindo modelo...' : 'Abrindo tarefa...') : context.error ?? (model ? 'Modelo não encontrado.' : 'Tarefa não encontrada.')}</Text>
    {context.error && <TaskCommand icon="refresh" label="Tentar abrir tarefas novamente" onPress={context.retry} />}
  </TaskPage>;
}

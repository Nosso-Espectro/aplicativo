import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useTasks } from '../../features/task-breakdown/TaskProvider';
import { TaskCommand, TaskPage, taskStyles as styles } from '../../features/task-breakdown/TaskUI';
import { taskProgress } from '../../features/task-breakdown/task-model';
export default function TasksScreen() {
  const router = useRouter(); const context = useTasks();
  return <TaskPage>
    <TaskCommand icon="arrow-back" label="Voltar ao quadro" onPress={() => router.replace('/')} />
    <Text accessibilityRole="header" style={styles.heading}>Tarefas</Text>
    {context.loading && <Text accessibilityLiveRegion="polite" style={styles.text}>Abrindo tarefas...</Text>}
    {context.error && <Text accessibilityRole="alert" style={styles.error}>{context.error}</Text>}
    {context.error && <TaskCommand icon="refresh" label="Tentar abrir tarefas novamente" onPress={context.retry} />}
    <TaskCommand icon="add" label="Nova tarefa" disabled={context.loading || context.busy || Boolean(context.error)} onPress={() => router.push('/tasks/new')} />
    <TaskCommand icon="library-books" label="Modelos de tarefas" onPress={() => router.push('/tasks/templates')} />
    {!context.loading && !context.error && context.tasks.length === 0 && <Text style={styles.text}>Ainda não há tarefas salvas.</Text>}
    {context.tasks.map(task => {
      const progress = taskProgress(task.steps);
      return <View key={task.id} style={styles.step}>
        <Text accessibilityRole="header" style={styles.label}>{task.title}</Text>
        <Text style={styles.text}>{`${progress.completed} de ${progress.total} etapas concluídas (${Math.round(progress.fraction * 100)}%).`}</Text>
        <TaskCommand icon="checklist" label={`Abrir tarefa: ${task.title}`} disabled={context.loading || Boolean(context.error)}
          onPress={() => router.push({ pathname: '/tasks/[id]', params: { id: task.id } })} />
      </View>;
    })}
  </TaskPage>;
}

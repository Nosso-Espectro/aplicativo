import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useTasks } from '../../../features/task-breakdown/TaskProvider';
import { TaskCommand, TaskPage, taskStyles as styles } from '../../../features/task-breakdown/TaskUI';
export default function TemplatesScreen() {
  const context = useTasks(); const router = useRouter();
  return <TaskPage>
    <TaskCommand icon="arrow-back" label="Voltar às tarefas" onPress={() => router.replace('/tasks')} />
    <Text accessibilityRole="header" style={styles.heading}>Modelos de tarefas</Text>
    {context.loading && <Text accessibilityLiveRegion="polite" style={styles.text}>Abrindo modelos...</Text>}
    {context.error && <Text accessibilityRole="alert" style={styles.error}>{context.error}</Text>}
    {context.error && <TaskCommand icon="refresh" label="Tentar abrir modelos novamente" onPress={context.retry} />}
    {!context.loading && !context.error && context.templates.length === 0 && <Text style={styles.text}>Ainda não há modelos salvos.</Text>}
    {context.templates.map(template => <View key={template.id} style={styles.step}>
      <Text accessibilityRole="header" style={styles.label}>{template.title}</Text>
      <Text style={styles.text}>{`${template.steps.length} etapa${template.steps.length === 1 ? '' : 's'}`}</Text>
      <TaskCommand icon="library-books" label={`Abrir modelo: ${template.title}`} disabled={context.loading || Boolean(context.error)}
        onPress={() => router.push({ pathname: '/tasks/templates/[id]', params: { id: template.id } })} />
    </View>)}
  </TaskPage>;
}

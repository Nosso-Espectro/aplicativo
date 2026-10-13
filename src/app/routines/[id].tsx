import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from 'react-native';
import { RoutineEditor } from '../../features/routines/RoutineEditor';
import { useRoutines } from '../../features/routines/RoutineProvider';
import { RoutineCommand, RoutinePage, routineStyles as styles } from '../../features/routines/RoutineUI';

export default function EditRoutineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useRoutines();
  const routine = context.routines.find((item) => item.id === id);
  const close = () => router.canGoBack() ? router.back() : router.replace('/routines');
  if (!context.loading && !context.error && routine) return <RoutineEditor key={id} routine={routine} onClose={close} />;
  return <RoutinePage>
    <RoutineCommand icon="arrow-back" label="Voltar às rotinas" onPress={close} />
    <Text accessibilityRole="alert" style={styles.text}>{context.loading ? 'Abrindo rotina…' : context.error ?? 'Rotina não encontrada.'}</Text>
    {context.error && <RoutineCommand icon="refresh" label="Tentar abrir rotinas novamente" onPress={context.retry} />}
  </RoutinePage>;
}

import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useRoutines } from '../../features/routines/RoutineProvider';
import { RoutineCommand, RoutinePage, routineStyles as styles } from '../../features/routines/RoutineUI';

export default function RoutinesScreen() {
  const router = useRouter();
  const context = useRoutines();
  return <RoutinePage>
    <RoutineCommand icon="arrow-back" label="Voltar à comunicação" onPress={() => router.replace('/')} />
    <Text accessibilityRole="header" style={styles.heading}>Rotinas</Text>
    {context.loading && <Text accessibilityLiveRegion="polite" style={styles.text}>Abrindo rotinas…</Text>}
    {context.error && <Text accessibilityRole="alert" style={styles.error}>{context.error}</Text>}
    {context.error && <RoutineCommand icon="refresh" label="Tentar abrir rotinas novamente" onPress={context.retry} />}
    <RoutineCommand icon="add" label="Nova rotina" disabled={context.loading || Boolean(context.error)} onPress={() => router.push('/routines/new')} />
    {!context.loading && !context.error && context.routines.length === 0 && <Text style={styles.text}>Ainda não há rotinas salvas.</Text>}
    {context.routines.map((routine) => <View key={routine.id} style={styles.step}>
      <Text accessibilityRole="header" style={styles.label}>{routine.name}</Text>
      <Text style={styles.text}>{routine.steps.length === 0 ? 'Sem etapas' : `${routine.steps.length} etapa${routine.steps.length === 1 ? '' : 's'}`}</Text>
      <RoutineCommand icon="edit" label={`Abrir rotina: ${routine.name}`} onPress={() => router.push({ pathname: '/routines/[id]', params: { id: routine.id } })} />
    </View>)}
  </RoutinePage>;
}

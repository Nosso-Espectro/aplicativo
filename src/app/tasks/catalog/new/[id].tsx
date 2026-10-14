import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { BackHandler, Text } from 'react-native';
import { commonTaskDraft } from '../../../../features/task-breakdown/common-task-catalog';
import { TaskEditor } from '../../../../features/task-breakdown/TaskEditor';
import { useTasks } from '../../../../features/task-breakdown/TaskProvider';
import { TaskCommand, TaskPage, taskStyles as styles } from '../../../../features/task-breakdown/TaskUI';
function CatalogEditor({ id, onClose, onSaved, isActive }: { id: unknown; onClose(): void; onSaved(): void; isActive(): boolean }) {
  const [draft] = useState(() => { try { return commonTaskDraft(id); } catch { return null; } });
  if (draft) return <TaskEditor initialDraft={draft} onClose={onClose} onSaved={onSaved} isActive={isActive} />;
  return <TaskPage>
    <TaskCommand icon="arrow-back" label="Voltar aos modelos comuns" onPress={onClose} />
    <Text accessibilityRole="alert" style={styles.error}>Este modelo comum não está disponível.</Text>
  </TaskPage>;
}
export default function CommonTaskEditorRoute() {
  const { id } = useLocalSearchParams<{ id: string }>(); const router = useRouter(); const context = useTasks();
  const [focused, setFocused] = useState(false); const busy = useRef(context.busy);
  useLayoutEffect(() => { busy.current = context.busy; }, [context.busy]);
  const activeRef = useRef(false);
  useFocusEffect(useCallback(() => {
    let active = true; activeRef.current = true; setFocused(true);
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!active) return false;
      if (!busy.current) router.replace('/tasks/catalog'); return true;
    });
    return () => { active = false; activeRef.current = false; setFocused(false); back.remove(); };
  }, [router]));
  return focused ? <CatalogEditor key={typeof id === 'string' ? id : 'invalid'} id={id}
    onClose={() => router.replace('/tasks/catalog')} onSaved={() => router.replace('/tasks')} isActive={() => activeRef.current} /> : null;
}

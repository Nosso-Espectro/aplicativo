import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { BackHandler, Text, View } from 'react-native';
import { getCommonTaskCatalog } from './common-task-catalog';
import { TaskCommand, TaskPage, taskStyles as styles } from './TaskUI';
export function CommonTaskCatalogScreen({ onClose, onUse, content }: { onClose(): void; onUse(id: string): void; content?: unknown }) {
  const catalog = content === undefined ? getCommonTaskCatalog() : getCommonTaskCatalog(content);
  const actions = useRef({ onClose, onUse }); const focused = useRef(false); const opening = useRef(false);
  const [message, setMessage] = useState<string | null>(null);
  useLayoutEffect(() => { actions.current = { onClose, onUse }; });
  useFocusEffect(useCallback(() => {
    focused.current = true; opening.current = false;
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!focused.current) return false; actions.current.onClose(); return true;
    });
    return () => { focused.current = false; back.remove(); };
  }, []));
  return <TaskPage>
    <TaskCommand icon="arrow-back" label="Voltar aos modelos" onPress={() => { if (focused.current) actions.current.onClose(); }} />
    <Text accessibilityRole="header" style={styles.heading}>Modelos comuns</Text>
    {!catalog ? <Text accessibilityRole="alert" style={styles.error}>Os modelos comuns não estão disponíveis nesta versão.</Text> : catalog.items.map(item => <View key={item.id} style={styles.step}>
      <Text accessibilityRole="header" style={styles.label}>{item.title}</Text>
      {item.steps.map((step, index) => <Text key={index} style={styles.text}>{`${index + 1}. ${step}`}</Text>)}
      <TaskCommand icon="content-copy" label={`Usar modelo comum: ${item.title}`} onPress={() => {
        if (!focused.current || opening.current) return;
        opening.current = true; setMessage(null);
        try { actions.current.onUse(item.id); }
        catch { opening.current = false; setMessage('Não foi possível abrir a cópia. Tente novamente.'); }
      }} />
    </View>)}
    {message && <Text accessibilityRole="alert" style={styles.error}>{message}</Text>}
  </TaskPage>;
}

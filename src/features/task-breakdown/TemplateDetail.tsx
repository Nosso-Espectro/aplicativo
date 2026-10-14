import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import type { SavedTask, SavedTemplate } from './task-database';
import { useTasks } from './TaskProvider';
import { TaskCommand, TaskPage, taskStyles as styles } from './TaskUI';
export function TemplateDetail({ template, onClose, onEdit, onCreated }: {
  template: SavedTemplate; onClose(): void; onEdit(): void; onCreated(task: SavedTask): void;
}) {
  const context = useTasks(); const active = useRef(false); const inFlight = useRef(false);
  const [removing, setRemoving] = useState<SavedTemplate | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const disabled = context.busy || context.loading || Boolean(context.error);
  async function change(remove: SavedTemplate | null) {
    if (disabled || inFlight.current) return;
    inFlight.current = true; setMessage(null);
    try {
      if (remove) { if (await context.removeTemplate(remove) && active.current) onClose(); }
      else { const task = await context.createTaskFromTemplate(template); if (task && active.current) onCreated(task); }
    } catch { if (active.current) setMessage('Não foi possível concluir a alteração. Os dados salvos foram mantidos. Tente novamente.'); }
    finally { inFlight.current = false; }
  }
  return <TaskPage>
    <TaskCommand icon="arrow-back" label="Voltar aos modelos" onPress={onClose} />
    <Text accessibilityRole="header" style={styles.heading}>{template.title}</Text>
    {template.steps.length === 0 && <Text style={styles.text}>Ainda não há etapas neste modelo.</Text>}
    {template.steps.map((step, index) => <Text key={step.id} style={styles.text}>{`${index + 1}. ${step.title}`}</Text>)}
    {context.busy && <Text accessibilityLiveRegion="polite" style={styles.text}>Salvando alteração...</Text>}
    {message && <Text accessibilityRole="alert" style={styles.error}>{message}</Text>}
    <TaskCommand icon="content-copy" label="Criar tarefa deste modelo" primary disabled={disabled} onPress={() => void change(null)} />
    <TaskCommand icon="edit" label="Editar modelo" disabled={disabled} onPress={onEdit} />
    <TaskCommand icon="delete-outline" label="Remover modelo" disabled={disabled} onPress={() => { setRemoving(template); setMessage(null); }} />
    {removing && <View style={styles.confirmation}>
      <Text accessibilityRole="alert" style={styles.text}>Remover este modelo? As tarefas já criadas serão mantidas.</Text>
      <TaskCommand icon="delete" label="Confirmar remoção do modelo" disabled={disabled} onPress={() => void change(removing)} />
      <TaskCommand icon="close" label="Manter modelo" disabled={context.busy} onPress={() => setRemoving(null)} />
    </View>}
  </TaskPage>;
}

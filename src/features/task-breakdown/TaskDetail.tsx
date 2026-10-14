import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { SavedTask } from './task-database';
import { taskProgress } from './task-model';
import { useTasks } from './TaskProvider';
import { TaskCommand, TaskPage, taskStyles as styles } from './TaskUI';

export function TaskDetail({ task, onClose, onEdit, onModelCreated }: { task: SavedTask; onClose(): void; onEdit(): void; onModelCreated(): void }) {
  const context = useTasks();
  const [removing, setRemoving] = useState<SavedTask | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const active = useRef(false); const inFlight = useRef(false);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const progress = taskProgress(task.steps);
  const disabled = context.loading || context.busy || Boolean(context.error);
  async function change(operation: () => Promise<boolean>, close = false) {
    if (disabled || inFlight.current) return;
    inFlight.current = true; setMessage(null);
    try { const saved = await operation(); if (saved && close && active.current) onClose(); }
    catch { if (active.current) setMessage('Não foi possível alterar a tarefa. Os dados salvos foram mantidos. Tente novamente.'); }
    finally { inFlight.current = false; }
  }
  async function saveModel() {
    if (disabled || inFlight.current) return;
    inFlight.current = true; setMessage(null);
    try { if (await context.createTemplate(task) && active.current) onModelCreated(); }
    catch { if (active.current) setMessage('Não foi possível salvar o modelo. A tarefa foi mantida. Tente novamente.'); }
    finally { inFlight.current = false; }
  }
  return <TaskPage>
    <TaskCommand icon="arrow-back" label="Voltar às tarefas" onPress={onClose} />
    <Text accessibilityRole="header" style={styles.heading}>{task.title}</Text>
    <Text accessibilityLiveRegion="polite" style={styles.text}>{`${progress.completed} de ${progress.total} etapas concluídas (${Math.round(progress.fraction * 100)}%).`}</Text>
    {task.steps.length === 0 && <Text style={styles.text}>Ainda não há etapas nesta tarefa.</Text>}
    {task.steps.map((step, index) => <Pressable key={step.id} accessibilityRole="checkbox"
      accessibilityLabel={`Etapa ${index + 1}: ${step.title}`} accessibilityState={{ checked: step.completed, disabled }}
      disabled={disabled} style={[styles.command, disabled && styles.dimmed]}
      onPress={() => void change(() => context.complete(task, step.id, !step.completed))}>
      <MaterialIcons name={step.completed ? 'check-box' : 'check-box-outline-blank'} size={24} color="#16634D" accessible={false} />
      <View style={{ flex: 1, gap: 4 }}><Text style={styles.text}>{step.title}</Text>
        <Text style={styles.text}>{step.completed ? 'Concluída' : 'Não concluída'}</Text></View>
    </Pressable>)}
    {context.busy && <Text accessibilityLiveRegion="polite" style={styles.text}>Salvando alteração...</Text>}
    {message && <Text accessibilityRole="alert" style={styles.error}>{message}</Text>}
    <TaskCommand icon="edit" label="Editar tarefa" disabled={disabled} onPress={onEdit} />
    <TaskCommand icon="library-add" label="Salvar como modelo" disabled={disabled} onPress={() => void saveModel()} />
    <TaskCommand icon="delete-outline" label="Remover tarefa" disabled={disabled} onPress={() => { setRemoving(task); setMessage(null); }} />
    {removing && <View style={styles.confirmation}>
      <Text accessibilityRole="alert" style={styles.text}>Remover esta tarefa e todas as suas etapas? As outras tarefas serão mantidas.</Text>
      <TaskCommand icon="delete" label="Confirmar remoção da tarefa" disabled={disabled} onPress={() => void change(() => context.remove(removing), true)} />
      <TaskCommand icon="close" label="Manter tarefa" disabled={context.busy} onPress={() => setRemoving(null)} />
    </View>}
  </TaskPage>;
}

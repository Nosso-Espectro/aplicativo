import { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { newTaskStep, normalizedTaskDraft, removeTaskStep, reorderTaskStep, type TaskDraft } from './task-model';
import type { SavedTask, SavedTemplate } from './task-database';
import { templateFromTask } from './task-template-model';
import { useTasks } from './TaskProvider';
import { TaskCommand, TaskPage, taskStyles as styles } from './TaskUI';

type EditorProps = ({ task?: SavedTask; template?: never; initialDraft?: never }
  | { task?: never; template: SavedTemplate; initialDraft?: never }
  | { task?: never; template?: never; initialDraft: TaskDraft }) & { onClose(): void; onSaved?(): void; isActive?(): boolean };
export function TaskEditor({ task, template, initialDraft, onClose, onSaved, isActive }: EditorProps) {
  const context = useTasks();
  const source = template ?? task;
  const kind = template ? 'modelo' : 'tarefa'; const article = template ? 'do modelo' : 'da tarefa';
  const [draft, setDraft] = useState<TaskDraft>({ title: source?.title ?? initialDraft?.title ?? '', steps: template
    ? template.steps.map(step => ({ ...step, completed: false })) : (task ?? initialDraft)?.steps.map(step => ({ ...step })) ?? [] });
  const currentDraft = useRef(draft);
  const [expected] = useState(source ? { id: source.id, revision: source.revision } : null);
  const [message, setMessage] = useState<string | null>(null);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inFlight = useRef(false);
  const active = useRef(false);
  const titleInput = useRef<TextInput>(null);
  const stepInputs = useRef(new Map<string, TextInput>());
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const unavailable = context.loading || Boolean(context.error) || context.busy || saving;
  function changeDraft(update: (current: TaskDraft) => TaskDraft) {
    if (!active.current || (isActive && !isActive()) || inFlight.current || unavailable) return;
    const next = update(currentDraft.current); currentDraft.current = next; setDraft(next);
  }
  function move(id: string, direction: 'up' | 'down') {
    if (!active.current || inFlight.current || unavailable) return;
    const index = draft.steps.findIndex(step => step.id === id);
    changeDraft(value => ({ ...value, steps: reorderTaskStep(value.steps, id, direction) }));
    setRemoving(null); setOrderMessage(`Etapa movida para a posição ${index + (direction === 'up' ? 0 : 2)}.`);
  }
  async function save() {
    if (!active.current || (isActive && !isActive()) || currentDraft.current !== draft || inFlight.current || unavailable) return;
    setMessage(null);
    if (!draft.title.trim()) { setMessage(`Informe o título ${article}.`); titleInput.current?.focus(); return; }
    const missing = draft.steps.find(step => !step.title.trim());
    if (missing) { setMessage('Informe o título de cada etapa.'); stepInputs.current.get(missing.id)?.focus(); return; }
    inFlight.current = true; setSaving(true);
    try {
      const saved = template && expected ? await context.saveTemplate(templateFromTask(draft), expected)
        : await context.save(normalizedTaskDraft(draft), expected);
      if (saved && active.current && (!isActive || isActive())) (onSaved ?? onClose)();
    } catch { if (active.current) setMessage(`Não foi possível salvar ${template ? 'o modelo' : 'a tarefa'}. Seu preenchimento foi mantido. Tente novamente ou cancele.`); }
    finally { inFlight.current = false; if (active.current) setSaving(false); }
  }
  return <TaskPage>
    <TaskCommand icon="arrow-back" label="Cancelar" disabled={saving} onPress={onClose} />
    <Text accessibilityRole="header" style={styles.heading}>{template ? 'Editar modelo' : task ? 'Editar tarefa' : 'Nova tarefa'}</Text>
    {context.loading && <Text accessibilityLiveRegion="polite" style={styles.text}>Abrindo tarefas...</Text>}
    {context.error && <Text accessibilityRole="alert" style={styles.error}>{context.error}</Text>}
    {context.error && <TaskCommand icon="refresh" label="Tentar abrir tarefas novamente" onPress={context.retry} />}
    <Text style={styles.label}>{`Título ${article}`}</Text>
    <TextInput ref={titleInput} accessibilityLabel={`Título ${article}`} value={draft.title} multiline editable={!unavailable}
      style={styles.input} onChangeText={title => { changeDraft(value => ({ ...value, title })); setMessage(null); }} />
    <Text accessibilityRole="header" style={styles.label}>Etapas</Text>
    {draft.steps.length === 0 && <Text style={styles.text}>{template ? 'Ainda não há etapas neste modelo.' : 'Ainda não há etapas nesta tarefa.'}</Text>}
    {orderMessage && <Text accessibilityLiveRegion="polite" style={styles.text}>{orderMessage}</Text>}
    {draft.steps.map((step, index) => <View key={step.id} style={styles.step}>
      <Text accessibilityRole="header" style={styles.label}>Etapa {index + 1}</Text>
      {!template && <Text style={styles.text}>{step.completed ? 'Concluída' : 'Não concluída'}</Text>}
      <TextInput ref={input => { if (input) stepInputs.current.set(step.id, input); else stepInputs.current.delete(step.id); }}
        accessibilityLabel={`Título da etapa ${index + 1}`} value={step.title} multiline editable={!unavailable} style={styles.input}
        onChangeText={title => { changeDraft(value => ({ ...value, steps: value.steps.map(item => item.id === step.id ? { ...item, title } : item) })); setMessage(null); setRemoving(null); setOrderMessage(null); }} />
      <View style={styles.row}>
        <TaskCommand icon="arrow-upward" label={`Subir etapa ${index + 1}`} disabled={unavailable || index === 0} onPress={() => move(step.id, 'up')} />
        <TaskCommand icon="arrow-downward" label={`Descer etapa ${index + 1}`} disabled={unavailable || index === draft.steps.length - 1} onPress={() => move(step.id, 'down')} />
        <TaskCommand icon="delete-outline" label={`Remover etapa ${index + 1}`} disabled={unavailable} onPress={() => setRemoving(step.id)} />
      </View>
      {removing === step.id && <View style={styles.confirmation}>
        <Text accessibilityRole="alert" style={styles.text}>{`Remover esta etapa${step.completed ? ' concluída' : ''} ${article}?`}</Text>
        <TaskCommand icon="delete" label="Confirmar remoção da etapa" disabled={unavailable} onPress={() => {
          changeDraft(value => ({ ...value, steps: removeTaskStep(value.steps, step.id) })); setRemoving(null); setOrderMessage(null);
        }} />
        <TaskCommand icon="close" label="Manter etapa" disabled={unavailable} onPress={() => setRemoving(null)} />
      </View>}
    </View>)}
    <TaskCommand icon="add" label="Adicionar etapa" disabled={unavailable} onPress={() => {
      const step = newTaskStep(); changeDraft(value => ({ ...value, steps: [...value.steps, step] })); setRemoving(null); setOrderMessage(null);
    }} />
    {message && <Text accessibilityRole="alert" style={styles.error}>{message}</Text>}
    {saving && <Text accessibilityLiveRegion="polite" style={styles.text}>{`Salvando ${kind}...`}</Text>}
    <TaskCommand icon="save" label={`Salvar ${kind}`} primary disabled={unavailable} onPress={() => void save()} />
  </TaskPage>;
}

import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { ComponentProps } from 'react';
import { useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { checkInOptions, checkInQuestions, checkInReducer, emptyCheckIn } from './check-in-model';
import { checkInSummary, type CheckInTool } from './check-in-summary';

function Command({ label, icon, disabled = false, onPress }: {
  label: string; icon: ComponentProps<typeof MaterialIcons>['name']; disabled?: boolean; onPress(): void;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }}
    disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.command, pressed && styles.pressed]}>
    <MaterialIcons name={icon} size={24} color={disabled ? '#62676D' : '#16634D'} accessible={false} />
    <Text style={[styles.text, styles.commandLabel, disabled && styles.disabled]}>{label}</Text>
  </Pressable>;
}

export function CheckInForm({ onExit, onOpenTool }: { onExit(): void; onOpenTool(tool: CheckInTool): void }) {
  const [state, dispatch] = useReducer(checkInReducer, undefined, emptyCheckIn);
  const scroll = useRef<ScrollView>(null);
  const leaving = useRef(false);
  useFocusEffect(useCallback(() => {
    leaving.current = false;
    return () => dispatch({ type: 'reset' });
  }, []));
  useEffect(() => { scroll.current?.scrollTo({ y: 0, animated: false }); }, [state.index, state.finished]);
  const question = checkInQuestions[state.index];
  const summary = state.finished ? checkInSummary(state.answers) : [];
  function leave(action: () => void) {
    if (leaving.current) return;
    leaving.current = true;
    dispatch({ type: 'reset' }); action();
  }
  return <SafeAreaView style={styles.screen}>
    <ScrollView ref={scroll} contentContainerStyle={styles.content}>
      <Command label="Voltar ao quadro" icon="arrow-back" onPress={() => leave(onExit)} />
      <Text accessibilityRole="header" style={styles.heading}>Check-in corporal e sensorial</Text>
      {state.finished ? <>
        <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.question}>Resumo do check-in</Text>
        {summary.length === 0 && <Text style={styles.text}>Nenhuma resposta fornecida.</Text>}
        {summary.map(item => <View key={item.id} accessible accessibilityLabel={`${item.question} ${item.answer}`} style={styles.summaryItem}>
          <Text style={styles.text}>{item.question}</Text>
          <Text style={[styles.text, styles.answer]}>{item.answer}</Text>
        </View>)}
        <Text accessibilityRole="header" style={styles.question}>Possibilidades</Text>
        <Command label="Você pode abrir o painel de regulação" icon="dashboard" onPress={() => leave(() => onOpenTool('regulation'))} />
        <Command label="Você pode revisar seu contato de confiança" icon="chat-bubble-outline" onPress={() => leave(() => onOpenTool('trusted-contact'))} />
        <Command label="Mostrar cartão Água" icon="local-drink" onPress={() => leave(() => onOpenTool('water'))} />
        <Text style={styles.note}>Este resumo não é um diagnóstico.</Text>
      </> : <>
        <Text style={styles.text}>{`Pergunta ${state.index + 1} de ${checkInQuestions.length}`}</Text>
        <View key={question.id} style={styles.questionGroup}>
          <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.question}>{question.title}</Text>
          <View style={styles.options}>
            {checkInOptions(question.id).map(option => {
              const selected = state.answers[question.id] === option.value;
              return <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label}
                accessibilityState={{ checked: selected }}
                onPress={() => dispatch({ type: 'answer', question: question.id, value: option.value })}
                style={({ pressed }) => [styles.option, selected && styles.selected, pressed && styles.pressed]}>
                <MaterialIcons name={selected ? 'radio-button-checked' : 'radio-button-unchecked'} size={24} color="#16634D" accessible={false} />
                <Text style={styles.text}>{option.label}</Text>
              </Pressable>;
            })}
          </View>
        </View>
        <Command label={state.index === checkInQuestions.length - 1 ? 'Finalizar check-in' : 'Continuar'}
          icon="arrow-forward" disabled={!state.answers[question.id]}
          onPress={() => dispatch({ type: 'next', question: question.id })} />
        <Command label="Pular pergunta" icon="skip-next" onPress={() => dispatch({ type: 'skip', question: question.id })} />
        {state.index > 0 && <Command label="Pergunta anterior" icon="arrow-back"
          onPress={() => dispatch({ type: 'previous', question: question.id })} />}
        <Text style={styles.note}>Este check-in não é um diagnóstico.</Text>
      </>}
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, gap: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
  heading: { fontSize: 26, fontWeight: '600', color: '#202124' },
  question: { fontSize: 22, fontWeight: '600', color: '#202124' },
  text: { fontSize: 18, color: '#202124', flexShrink: 1 },
  note: { fontSize: 16, color: '#454A50' },
  questionGroup: { gap: 16 }, options: { gap: 8 },
  summaryItem: { gap: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#72777D' },
  answer: { fontWeight: '600' },
  option: { minHeight: 56, padding: 14, borderWidth: 1, borderColor: '#72777D', borderRadius: 4,
    flexDirection: 'row', alignItems: 'center', gap: 12 },
  selected: { backgroundColor: '#EAF3EF', borderColor: '#16634D' },
  command: { minHeight: 48, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  commandLabel: { fontWeight: '600', color: '#16634D' },
  disabled: { color: '#62676D' }, pressed: { backgroundColor: '#EDF0F2' },
});

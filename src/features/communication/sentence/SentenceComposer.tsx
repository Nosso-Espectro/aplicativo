import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSentence } from './SentenceProvider';

export function SentenceComposer() {
  const { state, dispatch } = useSentence();
  const empty = state.entries.length === 0;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.heading}>Frase</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpar frase"
          accessibilityState={{ disabled: empty }}
          disabled={empty}
          onPress={() => dispatch({ type: 'clear' })}
          style={({ pressed }) => [styles.clear, pressed && styles.pressed]}
        >
          <Text style={[styles.controlLabel, empty && styles.disabled]}>Limpar</Text>
        </Pressable>
      </View>
      {empty ? (
        <Text style={styles.empty}>Frase vazia</Text>
      ) : (
        <View style={styles.entries}>
          {state.entries.map((entry, index) => (
            <View key={entry.entryId} style={styles.entry}>
              {entry.card.pictogram && (
                <Image
                  accessible={false}
                  source={entry.card.pictogram}
                  resizeMode="contain"
                  style={styles.image}
                />
              )}
              <Text accessibilityLabel={`${index + 1}. ${entry.card.title}`} style={styles.label}>
                {entry.card.title}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remover ${entry.card.title} da posição ${index + 1}`}
                onPress={() => dispatch({ type: 'remove', entryId: entry.entryId })}
                style={({ pressed }) => [styles.remove, pressed && styles.pressed]}
              >
                <Text style={styles.controlLabel}>Remover</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderBottomWidth: 1, borderBottomColor: '#72777D', paddingBottom: 20, gap: 12 },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' },
  heading: { color: '#202124', fontSize: 22, fontWeight: '600' },
  clear: { minHeight: 48, padding: 12, justifyContent: 'center' },
  controlLabel: { color: '#16634D', fontSize: 18, fontWeight: '600' },
  disabled: { color: '#72777D' },
  empty: { color: '#303438', fontSize: 18 },
  entries: { gap: 12 },
  entry: {
    padding: 12, borderWidth: 1, borderColor: '#72777D', borderRadius: 8,
    flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12,
  },
  image: { width: 48, height: 48 },
  label: { color: '#202124', fontSize: 22, flexGrow: 1, flexShrink: 1 },
  remove: { minHeight: 48, padding: 12, justifyContent: 'center' },
  pressed: { opacity: 0.7 },
});

import { useState, type ReactNode } from 'react';
import {
  Image,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  categories,
  initialCards,
  pictogramSearchTerms,
  type CategoryId,
  type CommunicationCard,
} from './initial-cards';

type BoardProps = {
  cards?: readonly CommunicationCard[];
  onSelectCard?: (card: CommunicationCard) => void;
  sentence?: ReactNode;
};

export function CommunicationBoard({ cards = initialCards, onSelectCard, sentence }: BoardProps) {
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const [selectedCard, setSelectedCard] = useState<CommunicationCard | null>(null);
  const { width, fontScale } = useWindowDimensions();
  const singleColumn = width < 340 || fontScale >= 1.5;
  const visibleCards = cards.filter(
    (card) => category === 'all' || card.categoryId === category,
  );
  const searchTerm = selectedCard && pictogramSearchTerms[selectedCard.id];
  const attributionUrl = searchTerm
    ? `https://www.flaticon.com/search?word=${encodeURIComponent(searchTerm)}`
    : null;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.brand}>TEAr</Text>
        <Text accessibilityRole="header" style={styles.heading}>Comunicação</Text>
        {sentence}
        <View style={styles.categories}>
          {[{ id: 'all' as const, title: 'Todos' }, ...categories].map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              accessibilityState={{ selected: category === item.id }}
              onPress={() => setCategory(item.id)}
              style={({ pressed }) => [
                styles.category,
                category === item.id && styles.activeCategory,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[
                styles.categoryLabel,
                category === item.id && styles.activeCategoryLabel,
              ]}>{item.title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.grid}>
          {visibleCards.map((card) => (
            <View
              key={card.id}
              style={[styles.card, { width: singleColumn ? '100%' : '48%' }]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={card.title}
                accessibilityHint={onSelectCard ? 'Adicionar à frase' : 'Mostrar cartão'}
                onPress={() => onSelectCard ? onSelectCard(card) : setSelectedCard(card)}
                style={({ pressed }) => [styles.cardContent, pressed && styles.pressed]}
              >
              {card.pictogram && (
                <Image
                  accessible={false}
                  source={card.pictogram}
                  resizeMode="contain"
                  style={styles.pictogram}
                />
              )}
              <Text style={styles.cardLabel}>{card.title}</Text>
              </Pressable>
              {onSelectCard && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Mostrar cartão: ${card.title}`}
                  onPress={() => setSelectedCard(card)}
                  style={({ pressed }) => [styles.preview, pressed && styles.pressed]}
                >
                  <Text style={styles.creditLabel}>Ver cartão</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
        {visibleCards.length === 0 && (
          <Text accessibilityRole="alert" style={styles.empty}>
            Nenhum cartão disponível.
          </Text>
        )}
      </ScrollView>
      <Modal
        visible={selectedCard !== null}
        animationType="none"
        onRequestClose={() => setSelectedCard(null)}
      >
        <SafeAreaView style={styles.screen} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={styles.message}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar ao quadro"
              onPress={() => setSelectedCard(null)}
              style={({ pressed }) => [styles.back, pressed && styles.pressed]}
            >
              <Text style={styles.categoryLabel}>Voltar ao quadro</Text>
            </Pressable>
            {selectedCard?.pictogram && (
              <Image
                accessible={false}
                source={selectedCard.pictogram}
                resizeMode="contain"
                style={styles.largePictogram}
              />
            )}
            <Text accessibilityRole="header" style={styles.messageLabel}>
              {selectedCard?.title}
            </Text>
            {attributionUrl && (
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`Pictograma de ${selectedCard?.title}: Flaticon`}
                onPress={() => {
                  void Linking.openURL(attributionUrl).catch(() => {
                    Alert.alert('Não foi possível abrir o link.');
                  });
                }}
                style={styles.credit}
              >
                <Text style={styles.creditLabel}>Pictograma: Flaticon</Text>
              </Pressable>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, gap: 20, maxWidth: 720, width: '100%', alignSelf: 'center' },
  brand: { color: '#16634D', fontSize: 24, fontWeight: '700' },
  heading: { color: '#202124', fontSize: 26, fontWeight: '600' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  category: {
    minHeight: 48, maxWidth: '100%', padding: 12, borderBottomWidth: 3,
    borderBottomColor: '#A0A4A8', justifyContent: 'center',
  },
  activeCategory: { borderBottomColor: '#16634D', backgroundColor: '#EEF6F2' },
  categoryLabel: { color: '#303438', fontSize: 18, fontWeight: '600' },
  activeCategoryLabel: { color: '#16634D' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  card: {
    minHeight: 132, alignItems: 'center', justifyContent: 'center',
    gap: 12, backgroundColor: '#F7F8FA', borderColor: '#72777D',
    borderWidth: 1, borderRadius: 8,
  },
  cardContent: { minHeight: 132, width: '100%', padding: 16, gap: 12, alignItems: 'center', justifyContent: 'center' },
  preview: { minHeight: 48, width: '100%', padding: 12, alignItems: 'center', justifyContent: 'center' },
  cardLabel: { color: '#202124', fontSize: 22, fontWeight: '600', textAlign: 'center' },
  pictogram: { width: 72, height: 72 },
  pressed: { opacity: 0.7 },
  empty: { color: '#303438', fontSize: 20 },
  message: {
    flexGrow: 1, padding: 24, gap: 32, alignItems: 'center',
    justifyContent: 'center', maxWidth: 720, width: '100%', alignSelf: 'center',
  },
  back: { minHeight: 48, padding: 12, alignSelf: 'flex-start' },
  largePictogram: { width: 160, height: 160 },
  messageLabel: { color: '#202124', fontSize: 36, fontWeight: '700', textAlign: 'center' },
  credit: { minHeight: 48, padding: 12, justifyContent: 'center' },
  creditLabel: { color: '#16634D', fontSize: 16, textDecorationLine: 'underline' },
});

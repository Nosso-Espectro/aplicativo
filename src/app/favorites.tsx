import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { CommunicationBoard } from '../features/communication/board/CommunicationBoard';
import { initialCards } from '../features/communication/board/initial-cards';
import { useCustomCards } from '../features/communication/custom-cards/CustomCardsProvider';
import { FavoriteFeedback } from '../features/communication/favorites/FavoriteFeedback';
import { SentenceComposer } from '../features/communication/sentence/SentenceComposer';
import { useSentence } from '../features/communication/sentence/SentenceProvider';

export default function FavoritesScreen() {
  const router = useRouter();
  const custom = useCustomCards();
  const { dispatch } = useSentence();
  const allCards = [...initialCards, ...custom.cards.map((card) => ({
    ...card, pictogram: card.imageUri ? { uri: card.imageUri } : undefined,
  }))];
  const byId = new Map(allCards.map((card) => [card.id, card]));
  const cards = custom.favoriteIds.flatMap((id) => { const card = byId.get(id); return card ? [card] : []; });
  return <CommunicationBoard heading="Favoritos" cards={cards} showCategories={false}
    emptyMessage={custom.loading || custom.error ? '' : 'Ainda não há cartões favoritos.'}
    navigation={<Pressable accessibilityRole="button" accessibilityLabel="Voltar ao quadro"
      onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.back}>
      <MaterialIcons name="arrow-back" size={24} color="#16634D" accessible={false} />
      <Text style={styles.label}>Voltar ao quadro</Text>
    </Pressable>}
    feedback={<FavoriteFeedback />} favoriteIds={custom.favoriteIds}
    favoriteDisabled={custom.loading || Boolean(custom.error) || custom.favoriteBusy}
    onFavorite={(id, selected) => void custom.setFavorite(id, selected)}
    storageStatus={custom.loading ? 'Abrindo favoritos…' : custom.error}
    onRetryStorage={custom.error ? custom.retry : undefined}
    sentence={<SentenceComposer />} onSelectCard={(card) => dispatch({ type: 'add', card })}
    customCardIds={custom.cards.map((card) => card.id)}
    onEditCard={(id) => router.push({ pathname: '/custom-card/[id]', params: { id } })}
  />;
}
const styles = StyleSheet.create({
  back: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  label: { fontSize: 18, color: '#16634D', flexShrink: 1 },
});

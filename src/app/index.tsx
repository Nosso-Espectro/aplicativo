import { CommunicationBoard } from '../features/communication/board/CommunicationBoard';
import { SentenceComposer } from '../features/communication/sentence/SentenceComposer';
import { useSentence } from '../features/communication/sentence/SentenceProvider';
import { useRouter } from 'expo-router';
import { useCustomCards } from '../features/communication/custom-cards/CustomCardsProvider';
import { initialCards } from '../features/communication/board/initial-cards';
import { Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { FavoriteFeedback } from '../features/communication/favorites/FavoriteFeedback';

export default function StartupScreen() {
  const { dispatch } = useSentence();
  const router = useRouter();
  const custom = useCustomCards();
  return (
    <CommunicationBoard
      favoriteIds={custom.favoriteIds}
      favoriteDisabled={custom.loading || Boolean(custom.error) || custom.favoriteBusy}
      onFavorite={(id, selected) => void custom.setFavorite(id, selected)}
      feedback={<FavoriteFeedback />}
      navigation={<View><Pressable accessibilityRole="button" accessibilityLabel="Abrir favoritos"
        onPress={() => router.push('/favorites')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="star-border" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Favoritos</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir rotinas" onPress={() => router.push('/routines')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="format-list-numbered" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Rotinas</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil de comunicação" onPress={() => router.push('/profile')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="person-outline" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Perfil de comunicação</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir plano de apoio" onPress={() => router.push('/support-plan')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="assignment" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Plano de Apoio</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir contato de confiança" onPress={() => router.push('/trusted-contact')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="chat-bubble-outline" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Contato de confiança</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir timer de transição" onPress={() => router.push('/transition-timer')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="timer" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Timer de transição</Text>
      </Pressable></View>}
      cards={[...initialCards, ...custom.cards.map((card) => ({
        ...card, pictogram: card.imageUri ? { uri: card.imageUri } : undefined,
      }))]}
      customCardIds={custom.cards.map((card) => card.id)}
      onNewCard={() => router.push('/custom-card/new')}
      onEditCard={(id) => router.push({ pathname: '/custom-card/[id]', params: { id } })}
      storageStatus={custom.loading ? 'Abrindo cartões próprios…' : custom.error}
      onRetryStorage={custom.error ? custom.retry : undefined}
      sentence={<SentenceComposer />}
      onSelectCard={(card) => dispatch({ type: 'add', card })}
    />
  );
}

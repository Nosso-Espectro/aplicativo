import { CommunicationHome } from '../features/communication/board/CommunicationHome';
import { SentenceComposer } from '../features/communication/sentence/SentenceComposer';
import { useSentence } from '../features/communication/sentence/SentenceProvider';
import { useRouter } from 'expo-router';
import { useCustomCards } from '../features/communication/custom-cards/CustomCardsProvider';
import { initialCards } from '../features/communication/board/initial-cards';
import { Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { FavoriteFeedback } from '../features/communication/favorites/FavoriteFeedback';
import { useState } from 'react';

export default function StartupScreen() {
  const { dispatch } = useSentence();
  const router = useRouter();
  const custom = useCustomCards();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = (path: Parameters<typeof router.push>[0]) => { setDrawerOpen(false); router.push(path); };
  return (
    <CommunicationHome
      drawerOpen={drawerOpen}
      onDrawerChange={setDrawerOpen}
      favoriteIds={custom.favoriteIds}
      favoriteDisabled={custom.loading || Boolean(custom.error) || custom.favoriteBusy}
      onFavorite={(id, selected) => void custom.setFavorite(id, selected)}
      feedback={<FavoriteFeedback />}
      navigation={<View><Pressable accessibilityRole="button" accessibilityLabel="Abrir painel de regulação"
        onPress={() => navigate('/regulation')}
        style={{ minHeight: 64, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 16 }}>
        <MaterialIcons name="dashboard" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Painel de regulação</Text>
      </Pressable><Pressable accessibilityRole="button" accessibilityLabel="Abrir favoritos"
        onPress={() => navigate('/favorites')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="star-border" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Favoritos</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir rotinas" onPress={() => navigate('/routines')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="format-list-numbered" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Rotinas</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir tarefas" onPress={() => navigate('/tasks')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="checklist" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Tarefas</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir check-in corporal e sensorial" onPress={() => navigate('/check-in')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="fact-check" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Check-in corporal e sensorial</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir histórico" onPress={() => navigate('/history')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="history" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Histórico</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil de comunicação" onPress={() => navigate('/profile')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="person-outline" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Perfil de comunicação</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir scripts de comunicação" onPress={() => navigate('/scripts')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="forum" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Scripts de comunicação</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir plano de apoio" onPress={() => navigate('/support-plan')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="assignment" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Plano de Apoio</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir contato de confiança" onPress={() => navigate('/trusted-contact')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="chat-bubble-outline" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Contato de confiança</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir sons" onPress={() => navigate('/regulation-sounds')}
        style={{ minHeight: 48, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <MaterialIcons name="graphic-eq" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Sons</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir Pomodoro" onPress={() => navigate('/focus')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="schedule" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Pomodoro</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir timer de transição" onPress={() => navigate('/transition-timer')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="timer" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Timer de transição</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir lembretes de água" onPress={() => navigate('/hydration')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="water-drop" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Lembretes de água</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir meditação" onPress={() => navigate('/meditation')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="self-improvement" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Meditação</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir guia de Zazen" onPress={() => navigate('/meditation/zazen')}
        style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 }}>
        <MaterialIcons name="menu-book" size={24} color="#16634D" accessible={false} />
        <Text style={{ color: '#16634D', fontSize: 18, flexShrink: 1 }}>Guia de Zazen</Text>
      </Pressable></View>}
      cards={[...initialCards, ...custom.cards.map((card) => ({
        ...card, pictogram: card.imageUri ? { uri: card.imageUri } : undefined,
      }))]}
      customCardIds={custom.cards.map((card) => card.id)}
      onNewCard={() => navigate('/custom-card/new')}
      onEditCard={(id) => navigate({ pathname: '/custom-card/[id]', params: { id } })}
      storageStatus={custom.loading ? 'Abrindo cartões próprios…' : custom.error}
      onRetryStorage={custom.error ? custom.retry : undefined}
      sentence={<SentenceComposer />}
      onSelectCard={(card) => dispatch({ type: 'add', card })}
    />
  );
}

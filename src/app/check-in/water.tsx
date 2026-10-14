import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { CommunicationBoard } from '../../features/communication/board/CommunicationBoard';
import { initialCards } from '../../features/communication/board/initial-cards';

export default function WaterCardScreen() {
  const router = useRouter();
  return <CommunicationBoard cards={initialCards.filter(card => card.id === 'water')} heading="Água" showCategories={false}
    emptyMessage="Cartão Água indisponível."
    navigation={<Pressable accessibilityRole="button" accessibilityLabel="Voltar ao quadro" onPress={() => router.replace('/')}
      style={{ minHeight: 48, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <MaterialIcons name="arrow-back" size={24} color="#16634D" accessible={false} />
      <Text style={{ fontSize: 18, color: '#16634D', flexShrink: 1 }}>Voltar ao quadro</Text>
    </Pressable>} />;
}

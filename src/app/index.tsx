import { CommunicationBoard } from '../features/communication/board/CommunicationBoard';
import { SentenceComposer } from '../features/communication/sentence/SentenceComposer';
import { useSentence } from '../features/communication/sentence/SentenceProvider';
import { useRouter } from 'expo-router';
import { useCustomCards } from '../features/communication/custom-cards/CustomCardsProvider';
import { initialCards } from '../features/communication/board/initial-cards';

export default function StartupScreen() {
  const { dispatch } = useSentence();
  const router = useRouter();
  const custom = useCustomCards();
  return (
    <CommunicationBoard
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

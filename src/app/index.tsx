import { CommunicationBoard } from '../features/communication/board/CommunicationBoard';
import { SentenceComposer } from '../features/communication/sentence/SentenceComposer';
import { useSentence } from '../features/communication/sentence/SentenceProvider';

export default function StartupScreen() {
  const { dispatch } = useSentence();
  return (
    <CommunicationBoard
      sentence={<SentenceComposer />}
      onSelectCard={(card) => dispatch({ type: 'add', card })}
    />
  );
}

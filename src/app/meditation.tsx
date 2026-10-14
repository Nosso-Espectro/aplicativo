import { MeditationProvider } from '../features/meditation/MeditationProvider';
import { MeditationScreen } from '../features/meditation/MeditationScreen';
import { usePanelReturn } from '../features/regulation/usePanelReturn';
export default function MeditationRoute() {
  const back = usePanelReturn('Voltar ao quadro');
  return <MeditationProvider><MeditationScreen onClose={back.onClose} backLabel={back.backLabel} /></MeditationProvider>;
}

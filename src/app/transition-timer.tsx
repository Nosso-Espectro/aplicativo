import { usePanelReturn } from '../features/regulation/usePanelReturn';
import { TransitionTimerScreen } from '../features/transition-timer/TransitionTimerScreen';
export default function TransitionTimerRoute() {
  return <TransitionTimerScreen {...usePanelReturn('Voltar ao quadro')} />;
}

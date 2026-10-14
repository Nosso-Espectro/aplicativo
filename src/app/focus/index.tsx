import { PomodoroScreen } from '../../features/focus/PomodoroScreen';
import { usePanelReturn } from '../../features/regulation/usePanelReturn';
export default function FocusRoute() { return <PomodoroScreen onClose={usePanelReturn('Voltar ao quadro').onClose} />; }

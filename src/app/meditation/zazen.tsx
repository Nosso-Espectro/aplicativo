import { ZazenGuideScreen } from '../../features/meditation/ZazenGuideScreen';
import { usePanelReturn } from '../../features/regulation/usePanelReturn';
export default function ZazenRoute() {
  const back = usePanelReturn('Voltar ao quadro');
  return <ZazenGuideScreen onClose={back.onClose} backLabel={back.backLabel} />;
}

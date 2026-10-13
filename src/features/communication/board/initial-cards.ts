import type { ImageSourcePropType } from 'react-native';

import yes from '../../../../assets/communication/pictograms/check.png';
import no from '../../../../assets/communication/pictograms/remove.png';
import help from '../../../../assets/communication/pictograms/people.png';
import water from '../../../../assets/communication/pictograms/glass-of-water.png';
import bathroom from '../../../../assets/communication/pictograms/toilet.png';
import hunger from '../../../../assets/communication/pictograms/dining.png';
import pain from '../../../../assets/communication/pictograms/muscle-pain.png';
import quiet from '../../../../assets/communication/pictograms/shh.png';
import leave from '../../../../assets/communication/pictograms/exit-door.png';
import time from '../../../../assets/communication/pictograms/deadline.png';

export const categories = [
  { id: 'needs', title: 'Necessidades' },
  { id: 'feelings', title: 'Sentimentos' },
  { id: 'requests', title: 'Solicitações' },
] as const;

export type CategoryId = (typeof categories)[number]['id'];

export type CommunicationCard = {
  id: string;
  title: string;
  categoryId: CategoryId;
  pictogram?: ImageSourcePropType;
};

export const pictogramSearchTerms: Readonly<Record<string, string>> = {
  yes: 'check',
  no: 'cross',
  help: 'help',
  water: 'glass of water',
  bathroom: 'toilet',
  hunger: 'food plate',
  pain: 'pain',
  quiet: 'silence',
  leave: 'exit',
  time: 'hourglass',
};

// Issue #1: user-supplied assets; source/author/license review remains pending.
export const initialCards: readonly CommunicationCard[] = [
  { id: 'yes', title: 'Sim', categoryId: 'requests', pictogram: yes },
  { id: 'no', title: 'Não', categoryId: 'requests', pictogram: no },
  { id: 'help', title: 'Ajuda', categoryId: 'requests', pictogram: help },
  { id: 'water', title: 'Água', categoryId: 'needs', pictogram: water },
  { id: 'bathroom', title: 'Banheiro', categoryId: 'needs', pictogram: bathroom },
  { id: 'hunger', title: 'Fome', categoryId: 'needs', pictogram: hunger },
  { id: 'pain', title: 'Dor', categoryId: 'feelings', pictogram: pain },
  { id: 'quiet', title: 'Silêncio', categoryId: 'requests', pictogram: quiet },
  { id: 'leave', title: 'Sair daqui', categoryId: 'requests', pictogram: leave },
  { id: 'time', title: 'Preciso de tempo', categoryId: 'requests', pictogram: time },
];

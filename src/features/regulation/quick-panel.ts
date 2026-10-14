export const panelDestinations = [
  { id: 'communication', label: 'Comunicação', path: '/' },
  { id: 'sounds', label: 'Sons', path: '/regulation-sounds' },
  { id: 'timer', label: 'Timer de transição', path: '/transition-timer' },
  { id: 'contact', label: 'Contato de confiança', path: '/trusted-contact' },
] as const;
export type PanelDestinationId = typeof panelDestinations[number]['id'];

export function panelDestination(id: PanelDestinationId) {
  const destination = panelDestinations.find(candidate => candidate.id === id);
  if (!destination) throw new Error('Panel destination unavailable.');
  return { ...destination };
}
export function isPanelOrigin(value: unknown): boolean { return value === 'regulation'; }

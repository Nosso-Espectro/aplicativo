import { isPanelOrigin, panelDestination, panelDestinations, type PanelDestinationId } from '../../../src/features/regulation/quick-panel';
it('maps exactly the four required shortcuts to real integrated local routes', () => {
  expect(panelDestinations).toEqual([
    { id: 'communication', label: 'Comunicação', path: '/' },
    { id: 'sounds', label: 'Sons', path: '/regulation-sounds' },
    { id: 'timer', label: 'Timer de transição', path: '/transition-timer' },
    { id: 'contact', label: 'Contato de confiança', path: '/trusted-contact' },
  ]);
});
it('returns a fresh destination without exposing mutable shared data', () => {
  const selected = panelDestination('sounds');
  expect(selected).toEqual(panelDestinations[1]); expect(selected).not.toBe(panelDestinations[1]);
});
it('rejects unsupported targets generically rather than accepting external URLs', () => {
  for (const input of ['', 'profile', 'https://invalid.example', null, 3]) {
    expect(() => panelDestination(input as PanelDestinationId)).toThrow('Panel destination unavailable.');
  }
});
it('recognizes only the fixed panel origin, not coerced, repeated or external parameters', () => {
  expect(isPanelOrigin('regulation')).toBe(true);
  for (const input of [undefined, null, false, ['regulation'], 'https://invalid.example', 'Regulation', '/', {}]) expect(isPanelOrigin(input)).toBe(false);
});

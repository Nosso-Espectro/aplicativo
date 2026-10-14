import { hydrationIdentifier, initialHydrationConfig, nextHydrationRevision, normalizedHydrationConfig,
  ownedHydrationIdentifier, validHydrationInterval } from '../../../src/features/hydration/hydration-model';
it('defaults to disabled without a native receipt and returns independent configuration objects', () => {
  const initial = initialHydrationConfig(); expect(initial).toEqual({ revision: 0, intervalMinutes: 60, status: 'disabled', identifier: null, journal: null });
  const copy = normalizedHydrationConfig(initial); copy.intervalMinutes = 120; expect(initial.intervalMinutes).toBe(60);
});
it.each([0, 29, 721, NaN, Infinity, 30.5])('rejects invalid intervals: %s', intervalMinutes => {
  expect(validHydrationInterval(intervalMinutes)).toBe(false);
  expect(() => normalizedHydrationConfig({ ...initialHydrationConfig(), intervalMinutes })).toThrow();
});
it('accepts interval boundaries and requires a receipt only in confirmed active state', () => {
  for (const intervalMinutes of [30, 720]) expect(normalizedHydrationConfig({ ...initialHydrationConfig(), intervalMinutes }).intervalMinutes).toBe(intervalMinutes);
  expect(() => normalizedHydrationConfig({ ...initialHydrationConfig(), status: 'active' })).toThrow();
  expect(() => normalizedHydrationConfig({ ...initialHydrationConfig(), identifier: hydrationIdentifier(1) })).toThrow();
  expect(normalizedHydrationConfig({ ...initialHydrationConfig(), revision: 2, status: 'active', identifier: hydrationIdentifier(1) }).status).toBe('active');
});
it.each(['tear-transition-alerts-1', 'tear-hydration-v1-0', 'tear-hydration-v1-01', 'tear-hydration-v1-1.5', 'tear-hydration-v1-9007199254740992'])('refuses foreign or malformed receipt identifiers: %s', identifier => {
  expect(ownedHydrationIdentifier(identifier)).toBe(false);
});
it('copies a pending journal, validates its identity and refuses mismatched activation generations', () => {
  const journal = { kind: 'activate' as const, identifier: hydrationIdentifier(1) };
  const current = { ...initialHydrationConfig(), revision: 1, journal }; const copied = normalizedHydrationConfig(current);
  expect(copied.journal).toEqual(journal); expect(copied.journal).not.toBe(journal);
  expect(() => normalizedHydrationConfig({ ...current, revision: 2 })).toThrow();
  expect(() => normalizedHydrationConfig({ ...current, status: 'active', identifier: hydrationIdentifier(1) })).toThrow();
});
it('rejects unsafe revision increments and future receipts instead of wrapping identity', () => {
  expect(nextHydrationRevision(0)).toBe(1);
  expect(() => nextHydrationRevision(Number.MAX_SAFE_INTEGER)).toThrow(); expect(() => hydrationIdentifier(0)).toThrow();
  expect(() => normalizedHydrationConfig({ ...initialHydrationConfig(), revision: 1, status: 'active', identifier: hydrationIdentifier(2) })).toThrow();
});

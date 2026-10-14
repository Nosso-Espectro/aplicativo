import { hydrationIdentifier, initialHydrationConfig, nextHydrationRevision, normalizedHydrationConfig,
  ownedHydrationIdentifier, validHydrationInterval } from '../../../src/features/hydration/hydration-model';
import { createDailyHydrationReceipt } from '../../../src/features/hydration/hydration-receipt';
it('defaults to disabled without a native receipt and returns independent configuration objects', () => {
  const initial = initialHydrationConfig(); expect(initial).toEqual({ revision: 0, intervalMinutes: 60, status: 'disabled', identifier: null, journal: null, quietWindow: null, receipt: null });
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
  expect(copied.journal).toMatchObject(journal); expect(copied.journal?.receipt?.entries[0].identifier).toBe(journal.identifier); expect(copied.journal).not.toBe(journal);
  expect(() => normalizedHydrationConfig({ ...current, revision: 2 })).toThrow();
  expect(() => normalizedHydrationConfig({ ...current, status: 'active', identifier: hydrationIdentifier(1) })).toThrow();
});
it('rejects unsafe revision increments and future receipts instead of wrapping identity', () => {
  expect(nextHydrationRevision(0)).toBe(1);
  expect(() => nextHydrationRevision(Number.MAX_SAFE_INTEGER)).toThrow(); expect(() => hydrationIdentifier(0)).toThrow();
  expect(() => normalizedHydrationConfig({ ...initialHydrationConfig(), revision: 1, status: 'active', identifier: hydrationIdentifier(2) })).toThrow();
});
const quietWindow = { startMinute: 1320, endMinute: 420 };
const dailyReceipt = () => createDailyHydrationReceipt(2, 60, quietWindow, 'UTC', 100000, [{ hour: 8, minute: 0 }, { hour: 9, minute: 0 }]);
it('copies quiet settings and every pending batch receipt without aliasing drafts or callers', () => {
  const receipt = dailyReceipt(); const current = { ...initialHydrationConfig(), revision: 2, quietWindow: { ...quietWindow },
    journal: { kind: 'activate' as const, identifier: receipt.entries[0].identifier, receipt } };
  const copied = normalizedHydrationConfig(current); current.quietWindow.startMinute = 0; receipt.entries[0].identifier = 'foreign';
  expect(copied.quietWindow).toEqual(quietWindow); expect(copied.journal?.receipt?.entries[0].identifier).toBe('tear-hydration-v2-2-0');
});
it('refuses older pending or future confirmed generations rather than trusting positional batch IDs alone', () => {
  const receipt = dailyReceipt(); const identifier = receipt.entries[0].identifier;
  expect(ownedHydrationIdentifier(identifier)).toBe(true);
  expect(() => normalizedHydrationConfig({ ...initialHydrationConfig(), revision: 1, quietWindow, status: 'active', identifier, receipt })).toThrow();
  expect(() => normalizedHydrationConfig({ ...initialHydrationConfig(), revision: 3, quietWindow,
    journal: { kind: 'activate', identifier, receipt } })).toThrow();
});
it('requires a cancellation journal to retain the entire confirmed batch, not just its first ID', () => {
  const receipt = dailyReceipt(); const identifier = receipt.entries[0].identifier;
  const active = { ...initialHydrationConfig(), revision: 3, quietWindow, status: 'active' as const, identifier, receipt };
  const subset = createDailyHydrationReceipt(2, 60, quietWindow, 'UTC', 100000, [{ hour: 8, minute: 0 }]);
  expect(() => normalizedHydrationConfig({ ...active, journal: { kind: 'cancel', nextStatus: 'paused', identifier, receipt: subset } })).toThrow();
  expect(normalizedHydrationConfig({ ...active, journal: { kind: 'cancel', nextStatus: 'paused', identifier, receipt } }).journal?.receipt?.entries).toHaveLength(2);
});
it('refuses incompatible daily plans for absent quiet settings and confirmed receipts on inactive state', () => {
  const receipt = dailyReceipt(); const identifier = receipt.entries[0].identifier;
  expect(() => normalizedHydrationConfig({ ...initialHydrationConfig(), revision: 3, status: 'active', identifier, receipt })).toThrow();
  expect(() => normalizedHydrationConfig({ ...initialHydrationConfig(), revision: 3, quietWindow, receipt })).toThrow();
});

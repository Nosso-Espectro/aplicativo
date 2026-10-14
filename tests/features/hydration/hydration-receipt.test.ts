import { createDailyHydrationReceipt, hydrationBatchIdentifier, hydrationReceiptGeneration, normalizeHydrationReceipt } from '../../../src/features/hydration/hydration-receipt';
const quiet = { startMinute: 1320, endMinute: 420 };
const deadline = new Date(2026, 9, 14, 8).getTime();
const daily = () => createDailyHydrationReceipt(2, 60, quiet, 'UTC', deadline, [{ hour: 8, minute: 0 }, { hour: 9, minute: 0 }]);
it('recognizes legacy and new generation identities without accepting other modules or malformed IDs', () => {
  expect(hydrationReceiptGeneration('tear-hydration-v1-10')).toBe(10);
  expect(hydrationReceiptGeneration(hydrationBatchIdentifier(10, 47))).toBe(10);
  for (const input of [null, 'tear-transition-1-5-2', 'tear-hydration-v1-0', 'tear-hydration-v2-01-0', 'tear-hydration-v2-1-01',
    'tear-hydration-v2-1-48', 'tear-hydration-v2-1--1', 'tear-hydration-v2-9007199254740992-0']) expect(hydrationReceiptGeneration(input)).toBeNull();
  expect(() => hydrationBatchIdentifier(0, 0)).toThrow(); expect(() => hydrationBatchIdentifier(1, 48)).toThrow();
});
it('preserves the exact single legacy interval receipt without pretending a migration scheduled anything', () => {
  const input = { generation: 1, timezone: null, notBeforeMs: null, entries: [{ identifier: 'tear-hydration-v1-1', kind: 'interval', intervalMinutes: 60 }] };
  expect(normalizeHydrationReceipt(input, 60, null)).toEqual(input);
  expect(() => normalizeHydrationReceipt(input, 120, null)).toThrow(); expect(() => normalizeHydrationReceipt(input, 60, quiet)).toThrow();
});
it('copies all daily receipt entries, requires the configured generation and keeps stable positional IDs', () => {
  const receipt = daily(); const copied = normalizeHydrationReceipt(receipt, 60, quiet);
  receipt.entries[0].identifier = 'other'; expect(copied.entries[0].identifier).toBe(hydrationBatchIdentifier(2, 0));
  expect(() => normalizeHydrationReceipt({ ...copied, generation: 3 }, 60, quiet)).toThrow();
  expect(() => normalizeHydrationReceipt({ ...copied, entries: [...copied.entries].reverse() }, 60, quiet)).toThrow();
});
it('refuses quiet, duplicate, compressed or invalid civil times and empty plans', () => {
  for (const slots of [[], [{ hour: 22, minute: 0 }], [{ hour: 24, minute: 0 }], [{ hour: 8, minute: 60 }],
    [{ hour: 8, minute: 0 }, { hour: 8, minute: 0 }], [{ hour: 8, minute: 0 }, { hour: 8, minute: 59 }]]) {
    expect(() => createDailyHydrationReceipt(2, 60, quiet, 'UTC', deadline, slots)).toThrow();
  }
  expect(() => createDailyHydrationReceipt(2, 60, { startMinute: 60, endMinute: 120 }, 'UTC', deadline,
    [{ hour: 23, minute: 59 }, { hour: 0, minute: 1 }])).toThrow();
});
it('does not accept null or unsafe daily deadlines, unidentified zones or more than 48 requests', () => {
  const input = daily();
  for (const notBeforeMs of [null, NaN, -1, Number.MAX_SAFE_INTEGER]) expect(() => normalizeHydrationReceipt({ ...input, notBeforeMs }, 60, quiet)).toThrow();
  expect(() => normalizeHydrationReceipt({ ...input, timezone: 'not/a-zone' }, 60, quiet)).toThrow();
  expect(() => normalizeHydrationReceipt({ ...input, entries: Array.from({ length: 49 }, () => input.entries[0]) }, 60, quiet)).toThrow();
});
it('refuses missing entries and malformed payloads without treating sparse arrays as a validated batch', () => {
  const input = daily();
  for (const entries of [Array(1), [null], [undefined], [42]]) expect(() => normalizeHydrationReceipt({ ...input, entries }, 60, quiet)).toThrow();
});

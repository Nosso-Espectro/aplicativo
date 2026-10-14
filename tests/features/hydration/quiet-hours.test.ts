import { formatQuietTime, isQuietAt, isQuietMinute, normalizeQuietWindow, parseQuietTime, planDailyHydration } from '../../../src/features/hydration/quiet-hours';
const overnight = { startMinute: 22 * 60, endMinute: 7 * 60 };
const now = () => new Date(2026, 9, 14, 10, 12, 30, 123).getTime();
it('keeps default silence absent and returns independent validated values', () => {
  expect(normalizeQuietWindow(null)).toBeNull(); const input = { ...overnight }; const saved = normalizeQuietWindow(input)!;
  input.startMinute = 0; expect(saved).toEqual(overnight);
  expect(isQuietMinute(0, null)).toBe(false);
});
it('parses explicit HH:MM without accepting ambiguous or malformed times', () => {
  expect(parseQuietTime('00:00')).toBe(0); expect(parseQuietTime('23:59')).toBe(1439);
  for (const invalid of ['', '9:00', '24:00', '12:60', ' 09:00', '09:00 ', '9', '09.00', '09:00:00']) expect(parseQuietTime(invalid)).toBeNull();
  for (let minute = 0; minute < 1440; minute++) expect(parseQuietTime(formatQuietTime(minute))).toBe(minute);
});
it('rejects equal boundaries, future or corrupt window values instead of interpreting a full quiet day', () => {
  for (const invalid of [undefined, [], {}, { startMinute: 0, endMinute: 0 }, { startMinute: -1, endMinute: 10 },
    { startMinute: 10, endMinute: 1440 }, { startMinute: 1.5, endMinute: 10 }, { startMinute: '22:00', endMinute: '07:00' }]) {
    expect(() => normalizeQuietWindow(invalid)).toThrow();
  }
  expect(() => formatQuietTime(1440)).toThrow(); expect(() => isQuietMinute(NaN, overnight)).toThrow();
});
it('honors inclusive start and exclusive end without wrapping a daytime window', () => {
  const quiet = { startMinute: 8 * 60, endMinute: 18 * 60 };
  expect(isQuietMinute(479, quiet)).toBe(false); expect(isQuietMinute(480, quiet)).toBe(true);
  expect(isQuietMinute(1079, quiet)).toBe(true); expect(isQuietMinute(1080, quiet)).toBe(false);
});
it('honors overnight silence and its midnight and end boundaries', () => {
  expect(isQuietMinute(1319, overnight)).toBe(false); expect(isQuietMinute(1320, overnight)).toBe(true);
  expect(isQuietMinute(1439, overnight)).toBe(true); expect(isQuietMinute(0, overnight)).toBe(true);
  expect(isQuietMinute(419, overnight)).toBe(true); expect(isQuietMinute(420, overnight)).toBe(false);
  expect(isQuietAt(new Date(2026, 9, 14, 23, 59).getTime(), overnight)).toBe(true);
  expect(isQuietAt(new Date(2026, 9, 15, 7, 0).getTime(), overnight)).toBe(false);
});
it('anchors phase after a full interval, rounds civil slots up and never mutates inputs', () => {
  const input = { ...overnight }; const plan = planDailyHydration(30, input, now());
  expect(plan.notBeforeMs).toBe(now() + 30 * 60000); expect(plan.slots[0]).toEqual({ hour: 10, minute: 43 });
  expect(input).toEqual(overnight); plan.slots[0].hour = 0;
  expect(planDailyHydration(30, input, now()).slots[0]).toEqual({ hour: 10, minute: 43 });
});
it.each([30, 31, 59, 60, 61, 120, 720])('plans interval %i with unique bounded slots and no shortened circular gap', interval => {
  for (const quiet of [overnight, { startMinute: 1, endMinute: 2 }, { startMinute: 8 * 60, endMinute: 18 * 60 }]) {
    const plan = planDailyHydration(interval, quiet, now());
    const minutes = plan.slots.map(slot => slot.hour * 60 + slot.minute).sort((a, b) => a - b);
    expect(minutes.length).toBeLessThanOrEqual(48); expect(new Set(minutes).size).toBe(minutes.length);
    for (let i = 0; i < minutes.length; i++) {
      expect(isQuietMinute(minutes[i], quiet)).toBe(false);
      const next = i + 1 < minutes.length ? minutes[i + 1] : minutes[0] + 1440;
      expect(next - minutes[i]).toBeGreaterThanOrEqual(interval);
    }
  }
});
it('returns no eligible slots explicitly rather than inventing an immediate or quiet notification', () => {
  const time = new Date(2026, 9, 14, 0, 0).getTime();
  expect(planDailyHydration(60, { startMinute: 0, endMinute: 1439 }, time).slots).toEqual([]);
  expect(planDailyHydration(30, { startMinute: 0, endMinute: 1439 }, new Date(2026, 9, 14, 23, 29).getTime()).slots).toEqual([{ hour: 23, minute: 59 }]);
});
it('refuses unsafe clocks, invalid dates and intervals before producing a plan or foreground decision', () => {
  for (const invalid of [NaN, Infinity, -1, 0.5, Number.MAX_SAFE_INTEGER, 8640000000000000]) {
    expect(() => planDailyHydration(60, overnight, invalid)).toThrow();
  }
  for (const invalid of [29, 721, 30.5, NaN]) expect(() => planDailyHydration(invalid, overnight, now())).toThrow();
  expect(() => isQuietAt(NaN, overnight)).toThrow();
});

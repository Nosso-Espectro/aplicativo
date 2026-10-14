export function validHydrationInterval(value: number) {
  return Number.isInteger(value) && value >= 30 && value <= 720;
}

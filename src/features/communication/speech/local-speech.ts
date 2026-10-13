import { requireOptionalNativeModule } from 'expo';

export type NativeSpeech = {
  maxInputLength?: number;
  isAvailable(): Promise<boolean>;
  speak(text: string): Promise<void>;
  stop(): Promise<void>;
};

// Keep the entire phrase, including surrogate pairs, across native input limits.
export function splitUtterances(text: string, limit: number): string[] {
  if (!Number.isInteger(limit) || limit < 2) throw new Error('Invalid speech input limit.');
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > limit) {
    let boundary = limit;
    const lastUnit = remaining.charCodeAt(boundary - 1);
    if (lastUnit >= 0xd800 && lastUnit <= 0xdbff) boundary--;
    const wordBoundary = remaining.lastIndexOf(' ', boundary - 1);
    if (wordBoundary > 0) boundary = wordBoundary + 1;
    chunks.push(remaining.slice(0, boundary));
    remaining = remaining.slice(boundary);
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

export function createLocalSpeech(native: NativeSpeech | null) {
  let generation = 0;
  return {
    async isAvailable() {
      return native ? native.isAvailable() : false;
    },
    async speak(text: string) {
      if (!native) throw new Error('Local speech unavailable.');
      const token = ++generation;
      const limit = native.maxInputLength ?? 4000;
      for (const chunk of splitUtterances(text, limit)) {
        if (token !== generation) return;
        await native.speak(chunk);
      }
    },
    async stop() {
      generation++;
      await native?.stop();
    },
  };
}

export const localSpeech = createLocalSpeech(requireOptionalNativeModule<NativeSpeech>('TearSpeech'));

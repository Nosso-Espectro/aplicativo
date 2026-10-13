import { createLocalSpeech, splitUtterances, type NativeSpeech } from '../../../../src/features/communication/speech/local-speech';

describe('local speech boundary (US-003 / RF-010 to RF-012)', () => {
  it('preserves long messages and Unicode across native input limits', () => {
    const text = 'Água 🙂 preciso de tempo '.repeat(1000);
    const chunks = splitUtterances(text, 20);
    expect(chunks.join('')).toBe(text);
    expect(chunks.every((chunk) => chunk.length <= 20)).toBe(true);
    for (const chunk of chunks) {
      expect(/[\uD800-\uDBFF]$/.test(chunk)).toBe(false);
      expect(/^[\uDC00-\uDFFF]/.test(chunk)).toBe(false);
    }
  });

  it('does not speak when the native module is missing', async () => {
    const speech = createLocalSpeech(null);
    expect(await speech.isAvailable()).toBe(false);
    await expect(speech.speak('Ajuda')).rejects.toThrow('unavailable');
    await expect(speech.stop()).resolves.toBeUndefined();
  });

  it('sends ordered chunks to the native module and stops before the next chunk', async () => {
    let finish!: () => void;
    const native: NativeSpeech = {
      maxInputLength: 5,
      isAvailable: jest.fn().mockResolvedValue(true),
      speak: jest.fn().mockImplementation(() => new Promise<void>((resolve) => { finish = resolve; })),
      stop: jest.fn().mockResolvedValue(undefined),
    };
    const speech = createLocalSpeech(native);
    const playback = speech.speak('Sim não ajuda');
    expect(native.speak).toHaveBeenCalledTimes(1);
    await speech.stop();
    finish();
    await playback;
    expect(native.speak).toHaveBeenCalledTimes(1);
    expect(native.stop).toHaveBeenCalledTimes(1);
  });

  it('reads a full message in ordered chunks without truncation', async () => {
    const native: NativeSpeech = {
      maxInputLength: 5,
      isAvailable: jest.fn().mockResolvedValue(true),
      speak: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn().mockResolvedValue(undefined),
    };
    await createLocalSpeech(native).speak('Sim não ajuda');
    expect((native.speak as jest.Mock).mock.calls.map(([text]) => text).join('')).toBe('Sim não ajuda');
  });

  it('does not resume further chunks after native interruption or failure', async () => {
    const native: NativeSpeech = {
      maxInputLength: 5,
      isAvailable: jest.fn().mockResolvedValue(true),
      speak: jest.fn().mockRejectedValue(new Error('interrupted')),
      stop: jest.fn().mockResolvedValue(undefined),
    };
    await expect(createLocalSpeech(native).speak('Sim não ajuda')).rejects.toThrow('interrupted');
    expect(native.speak).toHaveBeenCalledTimes(1);
  });
});

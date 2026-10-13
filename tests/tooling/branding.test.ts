/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const config = JSON.parse(readFileSync(resolve(__dirname, '../../app.json'), 'utf8')).expo;
it('uses the approved local square PNG for the app icon and native startup', () => {
  expect(config.icon).toBe('./assets/branding/tear-icon.png');
  const png = readFileSync(resolve(__dirname, '../../', config.icon));
  expect(png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(true);
  expect(png.readUInt32BE(16)).toBe(1254);
  expect(png.readUInt32BE(20)).toBe(1254);
  expect(config.android.adaptiveIcon).toBeUndefined();
  expect(config.web.favicon).toBe(config.icon);
  const splash = config.plugins.find((plugin: unknown) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen')[1];
  expect(splash.image).toBe(config.icon);
  expect(splash.resizeMode).toBe('contain');
  expect(splash.imageWidth).toBe(240);
  expect(splash.dark.image).toBe(config.icon);
  expect(splash.backgroundColor).toBe(splash.dark.backgroundColor);
});

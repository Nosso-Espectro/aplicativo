/// <reference types="node" />
import { type AndroidConfig } from 'expo/config-plugins';
import app from '../../app.json';
import withWhatsAppVisibility from '../../plugins/with-whatsapp-visibility.cjs';
type Manifest = AndroidConfig.Manifest.AndroidManifest;
jest.mock('expo/config-plugins', () => ({ withAndroidManifest: (config: unknown, mod: unknown) => ({ config, mod }) }));
function apply(manifest: Manifest) {
  const registered = withWhatsAppVisibility({ name: 'TEAr', slug: 'tear' }) as unknown as { mod(config: { modResults: Manifest }): { modResults: Manifest } };
  return registered.mod({ modResults: manifest }).modResults;
}
it('registers the local plugin and only the required iOS availability scheme', () => {
  expect(app.expo.plugins).toContain('./plugins/with-whatsapp-visibility.cjs');
  expect(app.expo.ios.infoPlist.LSApplicationQueriesSchemes).toEqual(['whatsapp']);
  expect(JSON.stringify(app)).not.toContain('QUERY_ALL_PACKAGES'); expect(JSON.stringify(app)).not.toContain('READ_CONTACTS');
});
it('adds an outbound Android scheme query and preserves existing permissions/queries', () => {
  const manifest = { manifest: { $: { 'xmlns:android': 'http://schemas.android.com/apk/res/android' },
    queries: [{ package: [{ $: { 'android:name': 'synthetic.existing' } }] }], 'uses-permission': [{ $: { 'android:name': 'android.permission.INTERNET' } }] } } as Manifest;
  const result = apply(manifest);
  expect(result.manifest.queries[0]).toEqual({ package: [{ $: { 'android:name': 'synthetic.existing' } }] });
  expect(result.manifest.queries[1]).toEqual({ intent: [{ action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }], data: [{ $: { 'android:scheme': 'whatsapp' } }] }] });
  expect(result.manifest['uses-permission']).toEqual([{ $: { 'android:name': 'android.permission.INTERNET' } }]);
  expect(apply(result).manifest.queries).toHaveLength(2);
});
it('initializes absent queries and does not duplicate an existing WhatsApp query', () => {
  const manifest = { manifest: { $: { 'xmlns:android': 'http://schemas.android.com/apk/res/android' } } } as Manifest;
  expect(apply(manifest).manifest.queries).toHaveLength(1); expect(apply(manifest).manifest.queries).toHaveLength(1);
});

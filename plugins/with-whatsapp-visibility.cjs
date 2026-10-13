const { withAndroidManifest } = require('expo/config-plugins');

module.exports = (config) => withAndroidManifest(config, (current) => {
  const manifest = current.modResults.manifest;
  const queries = manifest.queries ??= [];
  const exists = queries.some((query) => query.intent?.some((intent) =>
    intent.action?.some((action) => action.$['android:name'] === 'android.intent.action.VIEW')
      && intent.data?.some((data) => data.$['android:scheme'] === 'whatsapp')));
  if (!exists) {
    queries.push({ intent: [{ action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }], data: [{ $: { 'android:scheme': 'whatsapp' } }] }] });
  }
  return current;
});

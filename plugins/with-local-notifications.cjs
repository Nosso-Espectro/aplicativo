const { withAndroidManifest, withBaseMod } = require('expo/config-plugins');

module.exports = (config) => {
  config = withAndroidManifest(config, (current) => {
    const manifest = current.modResults.manifest;
    manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    const application = manifest.application[0];
    for (const [kind, name] of [
      ['service', 'expo.modules.notifications.service.ExpoFirebaseMessagingService'],
      ['provider', 'com.google.firebase.provider.FirebaseInitProvider'],
    ]) {
      const nodes = application[kind] ??= [];
      const existing = nodes.find(node => node.$['android:name'] === name);
      if (existing) existing.$['tools:node'] = 'remove';
      else nodes.push({ $: { 'android:name': name, 'tools:node': 'remove' } });
    }
    const metadata = application['meta-data'] ??= [];
    for (const name of ['firebase_messaging_auto_init_enabled', 'firebase_analytics_collection_enabled']) {
      const existing = metadata.find(node => node.$['android:name'] === name);
      if (existing) existing.$['android:value'] = 'false';
      else metadata.push({ $: { 'android:name': name, 'android:value': 'false' } });
    }
    return current;
  });
  return withBaseMod(config, {
    platform: 'ios', mod: 'entitlements',
    async action(current) {
      // Run the SDK's entitlement mods first; their default adds APNs support.
      const result = await current.modRequest.nextMod(current);
      delete result.modResults['aps-environment'];
      result.ios.entitlements = result.modResults;
      return result;
    },
  });
};

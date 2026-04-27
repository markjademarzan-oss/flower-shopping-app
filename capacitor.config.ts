import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.craftbymika.app',
  appName: 'Craft by Mika',
  webDir: 'www',
  server: {
    url: 'https://flower-shopping-app.vercel.app',
    cleartext: true
  }
};

export default config;
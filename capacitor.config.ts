import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.gmailclone',
  appName: 'Gmail Clone',
  webDir: 'dist',
  bundledWebRuntime: false,
  npmClient: 'npm',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  },
};

export default config;
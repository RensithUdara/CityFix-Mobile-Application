import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { FirebaseProvider } from './src/providers/FirebaseProvider';
import * as SplashScreen from 'expo-splash-screen';
void SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 350, fade: true });

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <FirebaseProvider>
        <AppNavigator />
      </FirebaseProvider>
    </SafeAreaProvider>
  );
}

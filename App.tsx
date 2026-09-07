import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { FirebaseProvider } from './src/providers/FirebaseProvider';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <FirebaseProvider><AppNavigator /></FirebaseProvider>
    </SafeAreaProvider>
  );
}

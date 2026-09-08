// Firebase's native runtime exports this API, but its top-level web declarations omit it.
import 'firebase/auth';
import type { Persistence } from 'firebase/auth';
import type AsyncStorage from '@react-native-async-storage/async-storage';
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: typeof AsyncStorage): Persistence;
}

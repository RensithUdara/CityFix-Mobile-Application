import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
const env = import.meta.env;
export const configured = !!env.VITE_FIREBASE_API_KEY && !!env.VITE_FIREBASE_PROJECT_ID;
const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY || 'missing-config',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'unconfigured',
  appId: env.VITE_FIREBASE_APP_ID,
});
export const auth = getAuth(app),
  db = getFirestore(app);
if (env.VITE_USE_EMULATORS === 'true' && env.VITE_FIREBASE_PROJECT_ID?.startsWith('demo-')) {
  connectAuthEmulator(auth, 'http://127.0.0.1:19109', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', Number(env.VITE_FIRESTORE_EMULATOR_PORT || '18082'));
}
export async function call<T>(name: string, data: unknown): Promise<T> {
  return (await httpsCallable<unknown, T>(getFunctions(app, 'us-central1'), name)(data)).data;
}

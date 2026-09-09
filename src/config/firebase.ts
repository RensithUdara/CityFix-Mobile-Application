import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { getFunctions } from 'firebase/functions';
import { initializeFirebaseAuth } from './firebaseAuth';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
};
export const missingFirebaseConfig = Object.entries(config)
  .filter(([, value]) => !value)
  .map(([key]) => key);
export const firebaseConfigured = missingFirebaseConfig.length === 0;
let services: ReturnType<typeof initialize> | undefined;
function initialize() {
  const app = getApps().length ? getApp() : initializeApp(config);
  return {
    auth: initializeFirebaseAuth(app),
    firestore: getFirestore(app),
    storage: getStorage(app),
    database: getDatabase(app),
    functions: getFunctions(app, 'us-central1'),
  };
}
export function firebase() {
  if (!firebaseConfigured)
    throw new Error(`Firebase configuration missing: ${missingFirebaseConfig.join(', ')}`);
  services ??= initialize();
  return services;
}

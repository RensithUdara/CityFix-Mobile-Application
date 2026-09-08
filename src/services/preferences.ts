import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { firebase } from '../config/firebase';
import { defaultPreferences, Preferences, usePreferencesStore } from '../store/preferencesStore';
import { useAuthStore } from '../store/authStore';
import { errorMessage } from '../utils/errors';
export function subscribePreferences(uid: string) {
  usePreferencesStore.setState(defaultPreferences);
  return onSnapshot(
    doc(firebase().firestore, 'users', uid, 'preferences', 'app'),
    (snapshot) =>
      usePreferencesStore.setState(
        snapshot.exists() ? { ...defaultPreferences, ...snapshot.data() } : defaultPreferences,
      ),
    (error) => useAuthStore.setState({ error: errorMessage(error) }),
  );
}
export async function savePreferences(preferences: Preferences) {
  const user = firebase().auth.currentUser;
  if (!user) throw new Error('Please sign in.');
  await setDoc(doc(firebase().firestore, 'users', user.uid, 'preferences', 'app'), preferences);
}

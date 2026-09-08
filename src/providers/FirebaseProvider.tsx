import { PropsWithChildren, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { firebase, firebaseConfigured } from '../config/firebase';
import { Profile, useAuthStore } from '../store/authStore';
import { useIssueStore } from '../store/issueStore';
import { subscribeIssues } from '../services/issues';
import { subscribePresence } from '../services/presence';
import { errorMessage } from '../utils/errors';
import { subscribePreferences } from '../services/preferences';
import { defaultPreferences, usePreferencesStore } from '../store/preferencesStore';
export function FirebaseProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    if (!firebaseConfigured) {
      useAuthStore.setState({ loading: false });
      return;
    }
    let stopData = () => {};
    const stopAuth = onAuthStateChanged(
      firebase().auth,
      (user) => {
        stopData();
        useIssueStore.getState().reset();
        usePreferencesStore.setState(defaultPreferences);
        useAuthStore.setState({ user, profile: null, loading: false, error: '' });
        if (!user) return;
        const stopIssues = subscribeIssues(user.uid);
        const stopPresence = subscribePresence(user.uid);
        const stopPreferences = subscribePreferences(user.uid);
        const stopProfile = onSnapshot(
          doc(firebase().firestore, 'users', user.uid),
          (snapshot) => {
            useAuthStore.setState({
              profile: snapshot.exists() ? (snapshot.data() as Profile) : null,
            });
          },
          (error) => useAuthStore.setState({ error: errorMessage(error) }),
        );
        stopData = () => {
          stopIssues();
          stopPresence();
          stopProfile();
          stopPreferences();
        };
      },
      (error) => useAuthStore.setState({ loading: false, error: errorMessage(error) }),
    );
    return () => {
      stopData();
      stopAuth();
    };
  }, []);
  return children;
}

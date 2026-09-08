import { onValue, onDisconnect, push, ref, remove, serverTimestamp, set } from 'firebase/database';
import { AppState } from 'react-native';
import { firebase } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import { errorMessage } from '../utils/errors';
let stopCurrentPresence: (() => Promise<void>) | undefined;
export async function disconnectPresence() {
  await stopCurrentPresence?.();
}
export function subscribePresence(uid: string) {
  const db = firebase().database;
  const session = push(ref(db, `presence/${uid}/sessions`));
  let active = true;
  let connected = false;
  let foreground = AppState.currentState === 'active';
  const disconnect = async () => {
    active = false;
    if (connected) await remove(session);
  };
  stopCurrentPresence = disconnect;
  const publish = async () => {
    if (!active || !connected || !foreground) return;
    try {
      await onDisconnect(session).remove();
      if (active && foreground) await set(session, { connectedAt: serverTimestamp() });
    } catch (error) {
      if (active) useAuthStore.setState({ error: errorMessage(error) });
    }
  };
  const stop = onValue(
    ref(db, '.info/connected'),
    (snapshot) => {
      connected = snapshot.val() === true;
      useAuthStore.setState({ connected });
      void publish();
    },
    (error) => useAuthStore.setState({ error: errorMessage(error) }),
  );
  const appState = AppState.addEventListener('change', (state) => {
    foreground = state === 'active';
    if (foreground) void publish();
    else void remove(session).catch(() => {});
  });
  return () => {
    active = false;
    stop();
    appState.remove();
    void remove(session).catch(() => {});
    useAuthStore.setState({ connected: false });
    if (stopCurrentPresence === disconnect) stopCurrentPresence = undefined;
  };
}

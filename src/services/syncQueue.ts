import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import { collection, doc } from 'firebase/firestore';
import { firebase } from '../config/firebase';
import { useQueueStore } from '../store/queueStore';
import { NewIssue } from '../types/issue';
import { QueuedReport } from '../types/queue';
import { preservePhotos, readQueue, removePhotos, writeQueue } from './queuePersistence';
import { createIssue } from './issues';
import { errorMessage } from '../utils/errors';
let currentUid: string | null = null;
let generation = 0;
let entries: QueuedReport[] = [];
let writing: Promise<void> = Promise.resolve();
let running: Promise<void> | null = null;
function publish() {
  useQueueStore.setState({ entries: [...entries] });
}
function persist(uid: string) {
  const snapshot = JSON.parse(JSON.stringify(entries)) as QueuedReport[];
  writing = writing.catch(() => {}).then(() => writeQueue(uid, snapshot));
  return writing;
}
export async function syncPendingReports(onProgress?: (message: string) => void) {
  if (running) return running;
  const uid = currentUid;
  const session = generation;
  if (!uid || firebase().auth.currentUser?.uid !== uid || !useQueueStore.getState().online) return;
  running = (async () => {
    useQueueStore.setState({ syncing: true });
    try {
      for (const entry of [...entries]) {
        if (
          currentUid !== uid ||
          generation !== session ||
          firebase().auth.currentUser?.uid !== uid ||
          !useQueueStore.getState().online
        )
          break;
        if (!entries.includes(entry) || entry.attempts >= 5 || entry.nextAttemptAt > Date.now())
          continue;
        entry.state = 'uploading';
        publish();
        await persist(uid);
        if (generation !== session || firebase().auth.currentUser?.uid !== uid) break;
        try {
          await createIssue(entry.input, onProgress, entry.id);
          if (currentUid !== uid || generation !== session) break;
          const previous = entries;
          entries = entries.filter((item) => item.id !== entry.id);
          try {
            await persist(uid);
          } catch (error) {
            if (generation === session) entries = previous;
            throw error;
          }
          if (generation !== session) break;
          publish();
          await removePhotos(uid, entry.id).catch(() => {});
        } catch (e) {
          if (currentUid !== uid || generation !== session) break;
          entry.state = 'failed';
          entry.attempts++;
          entry.error = errorMessage(e);
          entry.nextAttemptAt = Date.now() + Math.min(300000, 5000 * 2 ** entry.attempts);
          await persist(uid);
          publish();
        }
      }
    } catch (e) {
      if (generation === session) useQueueStore.setState({ error: errorMessage(e) });
    } finally {
      if (generation === session) useQueueStore.setState({ syncing: false });
    }
  })().finally(() => {
    running = null;
  });
  return running;
}
export async function submitOrQueue(input: NewIssue, onProgress?: (message: string) => void) {
  const uid = firebase().auth.currentUser?.uid;
  const session = generation;
  if (!uid || uid !== currentUid || !useQueueStore.getState().ready)
    throw new Error('Your upload queue is still loading. Please try again shortly.');
  if (entries.length >= 20)
    throw new Error('Your upload queue is full. Submit or remove a pending report first.');
  const id = doc(collection(firebase().firestore, 'issues')).id;
  onProgress?.('Saving a copy on your device…');
  const photos = await preservePhotos(uid, id, input.photos);
  if (generation !== session || currentUid !== uid || firebase().auth.currentUser?.uid !== uid) {
    await removePhotos(uid, id);
    throw new Error('Your account changed. Open the report form again.');
  }
  const entry: QueuedReport = {
    id,
    uid,
    input: { ...input, photos },
    state: 'pending',
    attempts: 0,
    nextAttemptAt: 0,
    createdAt: Date.now(),
    error: '',
  };
  entries.push(entry);
  try {
    await persist(uid);
  } catch (e) {
    if (generation === session) entries = entries.filter((item) => item.id !== id);
    await removePhotos(uid, id).catch(() => {});
    throw e;
  }
  if (generation !== session)
    throw new Error('Your report was saved for your previous account. Sign in again to upload it.');
  publish();
  let timer: ReturnType<typeof setTimeout> | undefined;
  await Promise.race([
    syncPendingReports(onProgress),
    new Promise<void>((resolve) => {
      timer = setTimeout(resolve, 20000);
    }),
  ]);
  if (timer) clearTimeout(timer);
  if (generation !== session)
    throw new Error(
      'Your account changed. Check this account’s upload queue after signing in again.',
    );
  return { id, submitted: !entries.some((item) => item.id === id) };
}
export async function retryQueuedReport(id: string) {
  const entry = entries.find((item) => item.id === id);
  if (!entry || entry.state === 'uploading' || !currentUid) return;
  entry.attempts = 0;
  entry.nextAttemptAt = 0;
  entry.state = 'pending';
  entry.error = '';
  await persist(currentUid);
  publish();
  void syncPendingReports();
}
export async function discardQueuedReport(id: string) {
  const entry = entries.find((item) => item.id === id);
  if (!entry || !currentUid || entry.state === 'uploading') return;
  const uid = currentUid;
  const previous = entries;
  entries = entries.filter((item) => item.id !== id);
  try {
    await persist(uid);
  } catch (e) {
    entries = previous;
    throw e;
  }
  publish();
  await removePhotos(uid, id);
}
export function startSyncQueue(uid: string) {
  const session = ++generation;
  currentUid = uid;
  entries = [];
  useQueueStore.setState({ entries: [], ready: false, error: '', syncing: false });
  void readQueue(uid)
    .then((saved) => {
      if (generation !== session) return;
      entries = saved.map((item) => ({
        ...item,
        state: item.state === 'uploading' ? 'pending' : item.state,
      }));
      publish();
      useQueueStore.setState({ ready: true });
      void syncPendingReports();
    })
    .catch((e) => {
      if (generation === session) useQueueStore.setState({ error: errorMessage(e) });
    });
  const stopNetwork = NetInfo.addEventListener((state) => {
    useQueueStore.setState({
      online: state.isConnected !== false && state.isInternetReachable !== false,
    });
    if (currentUid === uid) void syncPendingReports();
  });
  const appState = AppState.addEventListener('change', (state) => {
    if (state === 'active' && currentUid === uid) void syncPendingReports();
  });
  const timer = setInterval(() => {
    if (currentUid === uid && AppState.currentState !== 'background') void syncPendingReports();
  }, 15000);
  return () => {
    if (generation !== session) return;
    generation++;
    currentUid = null;
    entries = [];
    stopNetwork();
    appState.remove();
    clearInterval(timer);
    useQueueStore.setState({ entries: [], ready: false, syncing: false });
  };
}

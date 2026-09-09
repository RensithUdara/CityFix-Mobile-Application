import {
  collection,
  getDocFromServer,
  getDocs,
  limit,
  startAfter,
  where,
  documentId,
  setDoc,
  QueryDocumentSnapshot,
  QueryConstraint,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { firebase } from '../config/firebase';
import { Issue, NewIssue } from '../types/issue';
import { useIssueStore } from '../store/issueStore';
import { errorMessage } from '../utils/errors';
import { uploadReportPhoto } from './photoUpload';
import { MAX_REPORT_PHOTOS, ReportPhoto } from '../types/photo';
import { usePreferencesStore } from '../store/preferencesStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

function currentUser() {
  const user = firebase().auth.currentUser;
  if (!user) throw new Error('Please sign in to continue.');
  return user;
}
const PAGE_SIZE = 20;
let feedStop = () => {};
let activeUid: string | null = null;
let generation = 0;
let cursor: QueryDocumentSnapshot | null = null;
let expanded = false;
let filters = { category: 'All issues', status: 'All statuses' };
export function issueFromDocument(document: { id: string; data: () => any }, uid: string): Issue {
  const data = document.data();
  return {
    ...data,
    id: document.id,
    mine: data.ownerId === uid,
    confirmations: Object.keys(data.confirmedBy ?? {}).length,
    photos: data.photos ?? (data.image ? [{ url: data.image, path: data.imagePath ?? '' }] : []),
    createdAt: data.createdAt?.toDate?.().toISOString() ?? new Date().toISOString(),
  };
}
function mergeIssues(items: Issue[]) {
  const state = useIssueStore.getState();
  const merged = new Map(state.issues.map((i) => [i.id, i]));
  items.forEach((i) => merged.set(i.id, i));
  const issues = [...merged.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  useIssueStore.setState({ issues });
  if (activeUid)
    void AsyncStorage.setItem(
      'cityfix-feed-' + activeUid,
      JSON.stringify(issues.slice(0, 100)),
    ).catch(() => {});
}
function feedConstraints(): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];
  if (filters.category !== 'All issues')
    constraints.push(where('category', '==', filters.category));
  if (filters.status !== 'All statuses') constraints.push(where('status', '==', filters.status));
  return [...constraints, orderBy('createdAt', 'desc'), orderBy(documentId(), 'desc')];
}
function startFeed() {
  feedStop();
  cursor = null;
  expanded = false;
  const version = ++generation;
  useIssueStore.setState({ feedIds: [], hasMore: true, loading: true, loadingMore: false });
  feedStop = onSnapshot(
    query(collection(firebase().firestore, 'issues'), ...feedConstraints(), limit(PAGE_SIZE)),
    (snapshot) => {
      if (version !== generation || !activeUid) return;
      mergeIssues(snapshot.docs.map((d) => issueFromDocument(d, activeUid!)));
      const head = snapshot.docs.map((d) => d.id);
      const previous = useIssueStore.getState().feedIds;
      const tail = expanded ? previous.filter((id) => !head.includes(id)) : [];
      useIssueStore.setState({
        feedIds: [...head, ...tail],
        loading: false,
        error: '',
        ...(!expanded ? { hasMore: snapshot.size === PAGE_SIZE } : {}),
      });
      if (!expanded) cursor = snapshot.docs.at(-1) ?? null;
    },
    (error) => useIssueStore.setState({ loading: false, error: errorMessage(error) }),
  );
}
export function setFeedFilters(category: string, status: string) {
  if (filters.category === category && filters.status === status) return;
  filters = { category, status };
  if (activeUid) startFeed();
}
export async function loadMoreIssues() {
  const state = useIssueStore.getState();
  if (!activeUid || state.loadingMore || !state.hasMore || !cursor) return;
  const version = generation;
  useIssueStore.setState({ loadingMore: true, error: '' });
  try {
    const snapshot = await getDocs(
      query(
        collection(firebase().firestore, 'issues'),
        ...feedConstraints(),
        startAfter(cursor),
        limit(PAGE_SIZE),
      ),
    );
    if (version !== generation || !activeUid) return;
    expanded = true;
    cursor = snapshot.docs.at(-1) ?? cursor;
    mergeIssues(snapshot.docs.map((d) => issueFromDocument(d, activeUid!)));
    useIssueStore.setState({
      feedIds: [
        ...new Set([...useIssueStore.getState().feedIds, ...snapshot.docs.map((d) => d.id)]),
      ],
      hasMore: snapshot.size === PAGE_SIZE,
    });
  } catch (e) {
    if (version === generation) useIssueStore.setState({ error: errorMessage(e) });
  } finally {
    if (version === generation) useIssueStore.setState({ loadingMore: false });
  }
}
export function subscribeIssue(id: string) {
  const uid = currentUser().uid;
  return onSnapshot(
    doc(firebase().firestore, 'issues', id),
    (snapshot) => {
      if (activeUid !== uid) return;
      if (snapshot.exists()) {
        mergeIssues([issueFromDocument(snapshot, uid)]);
        const previous = useIssueStore.getState().confirmed.filter((value) => value !== id);
        useIssueStore.setState({
          confirmed: snapshot.data().confirmedBy?.[uid] ? [...previous, id] : previous,
        });
      } else useIssueStore.setState((s) => ({ issues: s.issues.filter((i) => i.id !== id) }));
    },
    (e) => useIssueStore.setState({ error: errorMessage(e) }),
  );
}
export function subscribeIssues(uid: string) {
  activeUid = uid;
  void AsyncStorage.getItem('cityfix-feed-' + uid)
    .then((raw) => {
      if (raw && activeUid === uid && !useIssueStore.getState().issues.length) {
        const issues = JSON.parse(raw) as Issue[];
        mergeIssues(issues);
        useIssueStore.setState({ feedIds: issues.slice(0, PAGE_SIZE).map((i) => i.id) });
      }
    })
    .catch(() => {});
  startFeed();
  const stopMine = onSnapshot(
    query(
      collection(firebase().firestore, 'issues'),
      where('ownerId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(100),
    ),
    (snapshot) => {
      if (activeUid === uid) mergeIssues(snapshot.docs.map((d) => issueFromDocument(d, uid)));
    },
    (e) => useIssueStore.setState({ error: errorMessage(e) }),
  );
  const watched = new Map<string, () => void>();
  const stopFollows = onSnapshot(
    collection(firebase().firestore, 'users', uid, 'follows'),
    (snapshot) => {
      if (activeUid !== uid) return;
      const ids = snapshot.docs.map((d) => d.id);
      useIssueStore.setState({ followed: ids });
      watched.forEach((stop, id) => {
        if (!ids.includes(id)) {
          stop();
          watched.delete(id);
        }
      });
      snapshot.docs.forEach((d) => {
        if (!watched.has(d.id)) watched.set(d.id, subscribeIssue(d.id));
        if (!d.data().issueId)
          void setDoc(d.ref, {
            ...d.data(),
            issueId: d.id,
            statusUpdates: true,
            commentUpdates: false,
          }).catch(() => {});
      });
    },
    (e) => useIssueStore.setState({ error: errorMessage(e) }),
  );
  return () => {
    activeUid = null;
    ++generation;
    feedStop();
    stopMine();
    stopFollows();
    watched.forEach((stop) => stop());
  };
}
export async function createIssue(
  input: NewIssue,
  onProgress?: (message: string) => void,
  stableId?: string,
): Promise<string> {
  const user = currentUser();
  const { firestore, storage } = firebase();
  const document = stableId
    ? doc(firestore, 'issues', stableId)
    : doc(collection(firestore, 'issues'));
  if (stableId) {
    const existing = await getDocFromServer(document);
    if (existing.exists()) {
      if (existing.data().ownerId !== user.uid) throw new Error('Report ownership mismatch.');
      return document.id;
    }
  }
  if (input.photos.length < 1 || input.photos.length > MAX_REPORT_PHOTOS)
    throw new Error('Add between 1 and 5 photos to your report.');
  const uploaded: ReportPhoto[] = [];
  const { photos: selectedPhotos, ...fields } = input;
  try {
    for (const [index, photo] of selectedPhotos.entries()) {
      onProgress?.(`Uploading photo ${index + 1} of ${selectedPhotos.length}…`);
      uploaded.push(
        await uploadReportPhoto(photo, `issues/${user.uid}/${document.id}/photo-${index}.jpg`),
      );
    }
    onProgress?.('Saving your report…');
    const batch = writeBatch(firestore);
    batch.set(document, {
      ...fields,
      photos: uploaded,
      image: uploaded[0].url,
      imagePath: uploaded[0].path,
      ownerId: user.uid,
      status: 'Reported',
      confirmedBy: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    if (usePreferencesStore.getState().autoFollow)
      batch.set(doc(firestore, 'users', user.uid, 'follows', document.id), {
        createdAt: serverTimestamp(),
        issueId: document.id,
        statusUpdates: true,
        commentUpdates: false,
      });
    await batch.commit();
  } catch (error) {
    if (!stableId)
      await Promise.allSettled(uploaded.map((photo) => deleteObject(ref(storage, photo.path))));
    throw error;
  }
  return document.id;
}
export async function toggleFollow(id: string) {
  const user = currentUser();
  const target = doc(firebase().firestore, 'users', user.uid, 'follows', id);
  await runTransaction(firebase().firestore, async (transaction) => {
    const snapshot = await transaction.get(target);
    if (snapshot.exists()) transaction.delete(target);
    else
      transaction.set(target, {
        createdAt: serverTimestamp(),
        issueId: id,
        statusUpdates: true,
        commentUpdates: false,
      });
  });
}
export async function toggleConfirm(id: string) {
  const user = currentUser();
  const target = doc(firebase().firestore, 'issues', id);
  await runTransaction(firebase().firestore, async (transaction) => {
    const snapshot = await transaction.get(target);
    if (!snapshot.exists()) throw new Error('This issue no longer exists.');
    const confirmedBy = { ...snapshot.data().confirmedBy };
    if (confirmedBy[user.uid]) delete confirmedBy[user.uid];
    else confirmedBy[user.uid] = true;
    transaction.update(target, { confirmedBy });
  });
}

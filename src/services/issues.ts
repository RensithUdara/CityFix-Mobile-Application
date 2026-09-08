import {
  collection,
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

function currentUser() {
  const user = firebase().auth.currentUser;
  if (!user) throw new Error('Please sign in to continue.');
  return user;
}
export function subscribeIssues(uid: string) {
  const fail = (error: unknown) =>
    useIssueStore.setState({ error: errorMessage(error), loading: false });
  const stopIssues = onSnapshot(
    query(collection(firebase().firestore, 'issues'), orderBy('createdAt', 'desc')),
    (snapshot) => {
      const issues = snapshot.docs.map((document) => {
        const data = document.data();
        return {
          ...data,
          id: document.id,
          mine: data.ownerId === uid,
          confirmations: Object.keys(data.confirmedBy ?? {}).length,
          photos:
            data.photos ?? (data.image ? [{ url: data.image, path: data.imagePath ?? '' }] : []),
          createdAt: data.createdAt?.toDate?.().toISOString() ?? new Date().toISOString(),
        } as Issue;
      });
      useIssueStore.setState({
        issues,
        confirmed: snapshot.docs
          .filter((d) => d.data().confirmedBy?.[uid] === true)
          .map((d) => d.id),
        loading: false,
        error: '',
      });
    },
    fail,
  );
  const stopFollows = onSnapshot(
    collection(firebase().firestore, 'users', uid, 'follows'),
    (snapshot) => useIssueStore.setState({ followed: snapshot.docs.map((d) => d.id) }),
    fail,
  );
  return () => {
    stopIssues();
    stopFollows();
  };
}
export async function createIssue(
  input: NewIssue,
  onProgress?: (message: string) => void,
): Promise<string> {
  const user = currentUser();
  const { firestore, storage } = firebase();
  const document = doc(collection(firestore, 'issues'));
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
      });
    await batch.commit();
  } catch (error) {
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
    else transaction.set(target, { createdAt: serverTimestamp() });
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

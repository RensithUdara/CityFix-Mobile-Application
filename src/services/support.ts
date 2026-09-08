import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { firebase } from '../config/firebase';
export type SupportRequest = { id: string; subject: string; message: string; status: string };
export async function submitSupportRequest(subject: string, message: string) {
  const user = firebase().auth.currentUser;
  if (!user) throw new Error('Please sign in.');
  await addDoc(collection(firebase().firestore, 'users', user.uid, 'supportRequests'), {
    subject: subject.trim(),
    message: message.trim(),
    status: 'Received',
    createdAt: serverTimestamp(),
  });
}
export function subscribeSupportRequests(
  uid: string,
  next: (requests: SupportRequest[]) => void,
  error: (error: Error) => void,
) {
  return onSnapshot(
    query(
      collection(firebase().firestore, 'users', uid, 'supportRequests'),
      orderBy('createdAt', 'desc'),
    ),
    (snapshot) =>
      next(
        snapshot.docs.map(
          (document) => ({ ...document.data(), id: document.id }) as SupportRequest,
        ),
      ),
    error,
  );
}

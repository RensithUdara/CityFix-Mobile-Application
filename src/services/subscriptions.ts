import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { firebase } from '../config/firebase';
export type SubscriptionOptions = {
  issueId: string;
  statusUpdates: boolean;
  commentUpdates: boolean;
};
export async function saveSubscription(options: SubscriptionOptions) {
  const uid = firebase().auth.currentUser?.uid;
  if (!uid) throw new Error('Please sign in.');
  await setDoc(doc(firebase().firestore, 'users', uid, 'follows', options.issueId), {
    ...options,
    createdAt: serverTimestamp(),
  });
}

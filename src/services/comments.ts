import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { firebase } from '../config/firebase';
export type IssueComment = {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
};
export function subscribeComments(
  issueId: string,
  receive: (comments: IssueComment[]) => void,
  fail: (error: unknown) => void,
) {
  return onSnapshot(
    query(
      collection(firebase().firestore, 'issues', issueId, 'comments'),
      orderBy('createdAt', 'asc'),
    ),
    (snapshot) =>
      receive(
        snapshot.docs.map(
          (d) =>
            ({
              ...d.data(),
              id: d.id,
              createdAt: d.data().createdAt?.toDate?.().toISOString() ?? new Date().toISOString(),
            }) as IssueComment,
        ),
      ),
    fail,
  );
}
export async function postComment(issueId: string, body: string, authorName: string) {
  const user = firebase().auth.currentUser;
  if (!user) throw new Error('Please sign in to comment.');
  await addDoc(collection(firebase().firestore, 'issues', issueId, 'comments'), {
    authorId: user.uid,
    authorName,
    body: body.trim(),
    createdAt: serverTimestamp(),
  });
}
export async function deleteComment(issueId: string, commentId: string) {
  await deleteDoc(doc(firebase().firestore, 'issues', issueId, 'comments', commentId));
}

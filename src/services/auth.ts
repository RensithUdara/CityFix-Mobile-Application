import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { firebase } from '../config/firebase';
import { Profile } from '../store/authStore';
import { disconnectPresence } from './presence';
export async function register(email: string, password: string, displayName: string) {
  const { user } = await createUserWithEmailAndPassword(firebase().auth, email.trim(), password);
  await updateProfile(user, { displayName: displayName.trim() });
  await setDoc(
    doc(firebase().firestore, 'users', user.uid),
    { displayName: displayName.trim(), neighborhood: '', createdAt: serverTimestamp() },
    { merge: true },
  );
}
export async function login(email: string, password: string) {
  await signInWithEmailAndPassword(firebase().auth, email.trim(), password);
}
export async function resetPassword(email: string) {
  await sendPasswordResetEmail(firebase().auth, email.trim());
}
export async function logout() {
  await disconnectPresence().catch(() => {});
  await signOut(firebase().auth);
}
export async function saveProfile(profile: Profile) {
  const user = firebase().auth.currentUser;
  if (!user) throw new Error('Please sign in.');
  await setDoc(doc(firebase().firestore, 'users', user.uid), profile, { merge: true });
  await updateProfile(user, { displayName: profile.displayName });
}
export async function changePassword(current: string, password: string) {
  const user = firebase().auth.currentUser;
  if (!user?.email) throw new Error('Sign in again to change your password.');
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, current));
  await updatePassword(user, password);
}

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { firebase } from '../config/firebase';
import { LocalPhoto } from '../types/photo';
import { uploadReportPhoto } from './photoUpload';
export async function saveProfilePhoto(photo: LocalPhoto | null) {
  const { auth, firestore, storage } = firebase();
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Please sign in.');
  const target = doc(firestore, 'users', uid),
    previous = (await getDoc(target)).data()?.photoPath;
  const uploaded = photo
    ? await uploadReportPhoto(
        photo,
        `profiles/${uid}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
      )
    : null;
  try {
    if (auth.currentUser?.uid !== uid)
      throw new Error('Your account changed. Please sign in again.');
    await setDoc(
      target,
      { photoURL: uploaded?.url || '', photoPath: uploaded?.path || '' },
      { merge: true },
    );
  } catch (e) {
    if (uploaded) await deleteObject(ref(storage, uploaded.path)).catch(() => {});
    throw e;
  }
  if (
    typeof previous === 'string' &&
    previous.startsWith(`profiles/${uid}/`) &&
    previous !== uploaded?.path
  )
    await deleteObject(ref(storage, previous)).catch(() => {});
}

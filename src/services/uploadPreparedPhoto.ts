import { StorageReference, uploadString } from 'firebase/storage';
export async function uploadPreparedPhoto(target: StorageReference, uri: string, base64?: string) {
  if (!base64) throw new Error('The photo could not be prepared. Please select it again.');
  await uploadString(target, base64, 'base64', { contentType: 'image/jpeg' });
}

import { StorageReference, uploadBytes } from 'firebase/storage';

// React Native cannot construct a Blob from ArrayBuffer/Uint8Array (uploadString does this).
// Read the normalized local JPEG as a native Blob, then keep it a Blob through Firebase.
export async function uploadPreparedPhoto(target: StorageReference, uri: string, _base64?: string) {
  const blob = await new Promise<Blob>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.responseType = 'blob';
    request.timeout = 30000;
    request.onload = () => {
      if ((request.status === 0 || request.status === 200) && request.response) resolve(request.response);
      else reject(new Error('The selected photo could not be read. Please select it again.'));
    };
    request.onerror = () => reject(new Error('Unable to read the selected photo.'));
    request.ontimeout = () => reject(new Error('Reading the photo timed out. Please try again.'));
    request.open('GET', uri, true);
    request.send();
  });
  try {
    if (blob.size >= 10 * 1024 * 1024) throw new Error('The prepared photo is too large. Choose a smaller image.');
    await uploadBytes(target, blob, { contentType: 'image/jpeg' });
  } finally {
    (blob as Blob & { close?: () => void }).close?.();
  }
}

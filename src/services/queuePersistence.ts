import { QueuedReport } from '../types/queue';
import { LocalPhoto } from '../types/photo';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cityfix-offline', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('queues');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function readQueue(uid: string): Promise<QueuedReport[]> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('queues');
    const request = tx.objectStore('queues').get(uid);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}
export async function writeQueue(uid: string, entries: QueuedReport[]) {
  const db = await database();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('queues', 'readwrite');
    tx.objectStore('queues').put(entries, uid);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(new Error('Local storage is full. Free some space and try again.'));
    };
  });
}
export async function preservePhotos(_uid: string, _id: string, photos: LocalPhoto[]) {
  const results: LocalPhoto[] = [];
  for (const photo of photos) {
    const context = ImageManipulator.manipulate(photo.uri);
    if (Math.max(photo.width, photo.height) > 1920)
      context.resize(photo.width >= photo.height ? { width: 1920 } : { height: 1920 });
    const rendered = await context.renderAsync();
    try {
      const image = await rendered.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.8,
        base64: true,
      });
      if (!image.base64) throw new Error('Unable to preserve photo.');
      results.push({
        ...photo,
        uri: `data:image/jpeg;base64,${image.base64}`,
        width: image.width,
        height: image.height,
      });
    } finally {
      rendered.release();
      context.release();
    }
  }
  return results;
}
export async function removePhotos(_uid: string, _id: string) {}

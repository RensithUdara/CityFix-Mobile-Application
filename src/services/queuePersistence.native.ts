import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { QueuedReport } from '../types/queue';
import { LocalPhoto } from '../types/photo';
const folder = (uid: string, id: string) =>
  new Directory(Paths.document, 'cityfix-drafts', uid, id);
export async function readQueue(uid: string): Promise<QueuedReport[]> {
  const data = await AsyncStorage.getItem('cityfix-queue-' + uid);
  return data ? JSON.parse(data) : [];
}
export async function writeQueue(uid: string, entries: QueuedReport[]) {
  await AsyncStorage.setItem('cityfix-queue-' + uid, JSON.stringify(entries));
}
export async function preservePhotos(uid: string, id: string, photos: LocalPhoto[]) {
  const directory = folder(uid, id);
  directory.create({ intermediates: true, idempotent: true });
  const results: LocalPhoto[] = [];
  try {
    for (const [index, photo] of photos.entries()) {
      const context = ImageManipulator.manipulate(photo.uri);
      if (Math.max(photo.width, photo.height) > 1920)
        context.resize(photo.width >= photo.height ? { width: 1920 } : { height: 1920 });
      const rendered = await context.renderAsync();
      try {
        const image = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
        const target = new File(directory, `${index}.jpg`);
        new File(image.uri).copy(target);
        results.push({ ...photo, uri: target.uri, width: image.width, height: image.height });
      } finally {
        rendered.release();
        context.release();
      }
    }
    return results;
  } catch (e) {
    if (directory.exists) directory.delete();
    throw e;
  }
}
export async function removePhotos(uid: string, id: string) {
  const directory = folder(uid, id);
  if (directory.exists) directory.delete();
}

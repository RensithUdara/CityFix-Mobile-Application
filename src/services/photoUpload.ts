import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { Platform } from 'react-native';
import { uploadPreparedPhoto } from './uploadPreparedPhoto';
import { firebase } from '../config/firebase';
import { LocalPhoto, ReportPhoto } from '../types/photo';
export async function uploadReportPhoto(photo: LocalPhoto, path: string): Promise<ReportPhoto> {
  // Decode the actual image, rather than trusting missing/inaccurate Blob MIME metadata.
  const context = ImageManipulator.manipulate(photo.uri);
  if (photo.width > 1920 || photo.height > 1920)
    context.resize(photo.width >= photo.height ? { width: 1920 } : { height: 1920 });
  const rendered = await context.renderAsync().catch(() => {
    context.release();
    throw new Error('This photo could not be opened. Remove it and choose a JPEG or PNG image.');
  });
  try {
    const result = await rendered.saveAsync({
      format: SaveFormat.JPEG,
      compress: 0.8,
      base64: Platform.OS === 'web',
    });
    if (result.base64 && Math.ceil((result.base64.length * 3) / 4) >= 10 * 1024 * 1024)
      throw new Error('The prepared photo is too large. Choose a smaller image.');
    const target = ref(firebase().storage, path);
    await uploadPreparedPhoto(target, result.uri, result.base64);
    try {
      return { url: await getDownloadURL(target), path };
    } catch (error) {
      await deleteObject(target).catch(() => {});
      throw error;
    }
  } finally {
    rendered.release();
    context.release();
  }
}

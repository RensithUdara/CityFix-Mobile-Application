import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { LocalPhoto, MAX_REPORT_PHOTOS } from '../types/photo';
export async function pickPhotos(
  camera = false,
  remaining = MAX_REPORT_PHOTOS,
): Promise<LocalPhoto[]> {
  if (remaining < 1) return [];
  if (camera) {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted)
      throw new Error(
        'Camera access is needed to take a photo. You can also choose one from your library.',
      );
  }
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: false,
    allowsMultipleSelection: !camera,
    selectionLimit: remaining,
    quality: 0.7,
  };
  const result = camera
    ? await ImagePicker.launchCameraAsync(options)
    : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled) return [];
  return result.assets
    .slice(0, remaining)
    .map((asset, index) => ({
      id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType,
      fileName: asset.fileName ?? undefined,
    }));
}
export async function currentLocation() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted)
    throw new Error('Location access was declined. You can enter the address manually.');
  const result = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { latitude: result.coords.latitude, longitude: result.coords.longitude };
}

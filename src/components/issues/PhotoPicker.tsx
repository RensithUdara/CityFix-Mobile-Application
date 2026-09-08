import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LocalPhoto, MAX_REPORT_PHOTOS } from '../../types/photo';
import { colors } from '../../theme';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
export function PhotoPicker({
  photos,
  onAdd,
  onRemove,
  onCover,
  disabled,
}: {
  photos: LocalPhoto[];
  onAdd: (camera: boolean) => void;
  onRemove: (id: string) => void;
  onCover: (id: string) => void;
  disabled: boolean;
}) {
  return (
    <View style={{ gap: 15 }}>
      <View style={styles.header}>
        <Text style={styles.label}>01 / A clearer picture</Text>
        <Text style={styles.count}>
          {photos.length} / {MAX_REPORT_PHOTOS} photos
        </Text>
      </View>
      {photos.length ? (
        <View style={styles.grid}>
          {photos.map((photo, index) => (
            <View key={photo.id} style={styles.tile}>
              <Image
                source={{ uri: photo.uri }}
                accessibilityLabel={`Selected photo ${index + 1}`}
                style={StyleSheet.absoluteFill}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove photo ${index + 1}`}
                disabled={disabled}
                onPress={() => onRemove(photo.id)}
                style={styles.remove}
              >
                <Icon name="x" size={16} color="white" />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Use photo ${index + 1} as cover`}
                disabled={disabled || index === 0}
                onPress={() => onCover(photo.id)}
                style={styles.cover}
              >
                <Icon name={index === 0 ? 'star' : 'image'} size={11} color="white" />
                <Text style={styles.coverText}>{index === 0 ? 'Cover photo' : 'Make cover'}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose issue photos"
          disabled={disabled}
          onPress={() => onAdd(false)}
          style={styles.empty}
        >
          <View style={styles.camera}>
            <Icon name="camera" size={30} color={colors.primary} />
          </View>
          <Text style={styles.title}>Show us what needs care</Text>
          <Text style={styles.hint}>Add 1–5 photos. Your first photo is the cover.</Text>
        </Pressable>
      )}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <Button
          secondary
          icon="camera"
          label="Take photo"
          disabled={disabled || photos.length >= MAX_REPORT_PHOTOS}
          onPress={() => onAdd(true)}
        />
        <Button
          secondary
          icon="image"
          label={photos.length ? 'Add photos' : 'Upload photos'}
          disabled={disabled || photos.length >= MAX_REPORT_PHOTOS}
          onPress={() => onAdd(false)}
        />
      </View>
      <Text style={styles.hint}>
        {photos.length === MAX_REPORT_PHOTOS
          ? 'All five spaces are filled. Remove a photo to choose another.'
          : 'Photos are prepared for upload automatically. Avoid faces and private details.'}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '700', color: colors.ink },
  count: {
    fontSize: 11,
    color: colors.primary,
    backgroundColor: colors.pale,
    padding: 8,
    borderRadius: 9,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '47%',
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.pale,
  },
  remove: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#183C32B0',
    padding: 10,
    borderRadius: 30,
  },
  cover: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#183C32C0',
    padding: 9,
    borderRadius: 9,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  coverText: { color: 'white', fontSize: 10, fontWeight: '600' },
  empty: {
    minHeight: 200,
    backgroundColor: '#EFF5EA',
    borderRadius: 22,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#B8CAB2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
    gap: 12,
  },
  camera: { padding: 17, backgroundColor: '#E1ECD8', borderRadius: 24 },
  title: { color: colors.ink, fontWeight: '700', fontSize: 17 },
  hint: { fontSize: 11, color: colors.muted, lineHeight: 19 },
});

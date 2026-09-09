import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReportPhoto } from '../../types/photo';
import { colors } from '../../theme';
import { Icon } from '../ui/Icon';
export function PhotoGallery({ photos }: { photos: ReportPhoto[] }) {
  const [selected, setSelected] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  if (!photos.length) return null;
  const index = Math.min(selected, photos.length - 1);
  return (
    <View style={{ gap: 12 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open photo ${index + 1} full screen`}
        onPress={() => setFullscreen(true)}
        style={styles.hero}
      >
        <Image
          source={{ uri: photos[index].url }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View style={styles.counter}>
          <Icon name="image" color="white" size={14} />
          <Text style={styles.white}>
            {index + 1} / {photos.length}
          </Text>
        </View>
        <View style={styles.expand}>
          <Icon name="maximize-2" color="white" size={19} />
        </View>
      </Pressable>
      {photos.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {photos.map((photo, i) => (
            <Pressable
              key={photo.path || photo.url}
              accessibilityRole="button"
              accessibilityLabel={`View photo ${i + 1}`}
              accessibilityState={{ selected: i === index }}
              onPress={() => setSelected(i)}
              style={[styles.thumbnail, i === index && { borderColor: colors.primary }]}
            >
              <Image
                source={{ uri: photo.url }}
                style={{ width: '100%', height: '100%', borderRadius: 9 }}
              />
            </Pressable>
          ))}
        </ScrollView>
      )}
      <Modal visible={fullscreen} onRequestClose={() => setFullscreen(false)} animationType="fade">
        <SafeAreaView style={styles.modal}>
          <View style={styles.toolbar}>
            <Text style={styles.white}>
              Photo {index + 1} of {photos.length}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close photo viewer"
              onPress={() => setFullscreen(false)}
              style={{ padding: 15 }}
            >
              <Icon name="x" color="white" size={24} />
            </Pressable>
          </View>
          <Image
            testID="fullscreen-photo"
            accessibilityLabel={`Report photo ${index + 1}`}
            source={{ uri: photos[index].url }}
            resizeMode="contain"
            style={{ flex: 1, width: '100%' }}
          />
          <View style={styles.toolbar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous photo"
              onPress={() => setSelected((index + photos.length - 1) % photos.length)}
              style={{ padding: 20 }}
            >
              <Icon name="arrow-left" color="white" />
            </Pressable>
            <Text style={styles.white}>
              {index + 1} / {photos.length}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next photo"
              onPress={() => setSelected((index + 1) % photos.length)}
              style={{ padding: 20 }}
            >
              <Icon name="arrow-right" color="white" />
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  hero: { height: 300, backgroundColor: colors.pale, borderRadius: 24, overflow: 'hidden' },
  counter: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#183C32BB',
    flexDirection: 'row',
    gap: 8,
  },
  expand: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#183C32BB',
  },
  white: { color: 'white', fontSize: 13, fontWeight: '600' },
  thumbnail: {
    width: 70,
    height: 64,
    borderRadius: 12,
    padding: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modal: { flex: 1, backgroundColor: '#10251F' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
});

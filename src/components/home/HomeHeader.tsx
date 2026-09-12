import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { initials } from '../../utils/format';
import { colors } from '../../theme';
import { Icon } from '../ui/Icon';
import { BrandLogo } from '../branding/BrandLogo';
export function HomeHeader({
  onNotifications,
  onProfile,
  onEditNeighborhood,
}: {
  onNotifications: () => void;
  onProfile: () => void;
  onEditNeighborhood: () => void;
}) {
  const { user, profile } = useAuthStore();
  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <BrandLogo size={65} />
      </View>
      <View style={styles.right}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            profile?.neighborhood ? 'Edit your neighborhood' : 'Set your neighborhood'
          }
          onPress={onEditNeighborhood}
          style={styles.location}
        >
          <Text style={styles.eyebrow}>YOUR NEIGHBORHOOD</Text>
          <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
            <Icon name="map-pin" size={12} color={colors.primary} />
            <Text style={styles.place}>{profile?.neighborhood || 'Set your neighborhood'}</Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={onNotifications}
          style={styles.bell}
        >
          <Icon name="bell" size={20} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={onProfile}
          style={styles.avatar}
        >
          <Text style={{ color: colors.primary, fontWeight: '700' }}>
            {initials(profile?.displayName || user?.displayName || user?.email || '')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  brand: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  logo: {
    backgroundColor: colors.primary,
    width: 37,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-6deg' }],
  },
  wordmark: { fontSize: 27, fontWeight: '800', letterSpacing: -1.5, color: colors.ink },
  right: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  location: { gap: 5, minHeight: 44, justifyContent: 'center' },
  eyebrow: { fontSize: 7, color: colors.muted, letterSpacing: 1.2, fontWeight: '600' },
  place: { fontSize: 10, fontWeight: '600', color: colors.ink },
  bell: { padding: 9, position: 'relative' },
  dot: {
    position: 'absolute',
    width: 5,
    height: 5,
    backgroundColor: colors.orange,
    borderRadius: 5,
    top: 9,
    right: 10,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#E6EDDA',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

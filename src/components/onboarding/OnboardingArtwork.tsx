import { StyleSheet, View } from 'react-native';
import { OnboardingPage } from '../../data/onboarding';
import { BrandLogo } from '../branding/BrandLogo';
import { Icon } from '../ui/Icon';
export function OnboardingArtwork({ page, compact }: { page: OnboardingPage; compact: boolean }) {
  return (
    <View
      style={[styles.art, { backgroundColor: page.background, minHeight: compact ? 240 : 330 }]}
    >
      <View
        style={[
          styles.orbit,
          {
            borderColor: page.accent + '22',
            width: compact ? 230 : 290,
            height: compact ? 230 : 290,
          },
        ]}
      />
      <View style={styles.logo}>
        <BrandLogo size={compact ? 180 : 225} />
      </View>
      <View style={[styles.badge, { backgroundColor: page.accent }]}>
        <Icon name={page.icon} size={25} color="white" />
      </View>
      <View style={[styles.spark, { backgroundColor: page.accent, top: 36, left: 36 }]} />
      <View
        style={[
          styles.spark,
          { backgroundColor: page.accent, bottom: 46, right: 36, width: 7, height: 7 },
        ]}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  art: {
    width: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  orbit: { position: 'absolute', borderRadius: 180, borderWidth: 1 },
  logo: {
    backgroundColor: 'white',
    borderRadius: 26,
    padding: 10,
    transform: [{ rotate: '-3deg' }],
  },
  badge: {
    position: 'absolute',
    top: 26,
    right: 28,
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '8deg' }],
  },
  spark: { position: 'absolute', width: 11, height: 11, borderRadius: 10 },
});

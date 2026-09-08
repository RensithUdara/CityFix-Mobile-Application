import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { BrandLogo } from '../components/branding/BrandLogo';
import { colors } from '../theme';
export function SplashScreen() {
  return (
    <View style={styles.container}>
      <BrandLogo size={260} />
      <View style={styles.footer}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.caption}>A little care. A better city.</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { position: 'absolute', bottom: 64, gap: 18, alignItems: 'center' },
  caption: { fontSize: 12, letterSpacing: 0.6, color: colors.muted },
});

import { StyleSheet, View } from 'react-native';
import { BrandLogo } from '../components/branding/BrandLogo';
export function SplashScreen() {
  return (
    <View style={styles.container}>
      <BrandLogo size={260} />
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
});

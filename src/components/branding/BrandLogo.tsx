import { Image } from 'react-native';
export const brandLogo = require('../../../assets/cityfix-logo.png');
export function BrandLogo({ size = 160 }: { size?: number }) {
  return (
    <Image
      source={brandLogo}
      accessibilityLabel="CityFix: Report, Track, Build a Better City"
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}

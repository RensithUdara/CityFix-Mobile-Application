import { Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { BrandLogo } from '../components/branding/BrandLogo';
import { guidelines, privacySections } from '../data/help';
import { colors } from '../theme';
import appConfig from '../../app.json';
export function InformationScreen({
  route,
}: NativeStackScreenProps<RootStackParams, 'Privacy' | 'Guidelines' | 'About'>) {
  const privacy = route.name === 'Privacy';
  const about = route.name === 'About';
  const title = privacy
    ? 'Your information, explained'
    : about
      ? 'A little care. A better city.'
      : 'Better neighbors, together';
  const sections = privacy
    ? privacySections
    : about
      ? [
          {
            title: 'Built for everyday care',
            text: 'CityFix helps people report local problems, share useful observations, and follow progress in their community. Small contributions make it easier to understand what needs attention.',
          },
          {
            title: 'Report. Track. Participate.',
            text: 'Share one to five photos, attach a location, confirm issues you have noticed, and discuss useful details. Keep your favorite reports in your following list.',
          },
          {
            title: 'An independent community app',
            text: 'CityFix is not a municipal authority or an emergency service. Report submission does not guarantee an official response or a repair. Updates reflect actions taken by project administrators.',
          },
        ]
      : guidelines;
  return (
    <Screen>
      <View style={{ maxWidth: 740, width: '100%', alignSelf: 'center', gap: 23 }}>
        {about && (
          <View
            style={{
              alignItems: 'center',
              backgroundColor: 'white',
              padding: 15,
              borderRadius: 24,
            }}
          >
            <BrandLogo size={160} />
            <Text style={{ color: colors.muted, fontSize: 11 }}>
              Version {appConfig.expo.version}
            </Text>
          </View>
        )}
        <SectionHeader
          title={title}
          subtitle={
            privacy
              ? 'Privacy policy · Current application practices'
              : about
                ? 'Made for the places we call home.'
                : 'A few shared principles for a helpful community.'
          }
        />
        {sections.map((section, index) => (
          <View
            key={section.title}
            style={{
              backgroundColor: 'white',
              padding: 24,
              borderRadius: 19,
              borderWidth: 1,
              borderColor: colors.line,
              gap: 12,
            }}
          >
            <Text
              style={{ fontSize: 10, letterSpacing: 1, fontWeight: '700', color: colors.primary }}
            >
              {String(index + 1).padStart(2, '0')}
            </Text>
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.ink }}>
              {section.title}
            </Text>
            <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 24 }}>
              {section.text}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

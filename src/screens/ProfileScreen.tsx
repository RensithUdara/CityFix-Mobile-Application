import { ProfilePhoto } from '../components/profile/ProfilePhoto';
import { LogoutButton } from '../components/settings/LogoutButton';
import { Text, View } from 'react-native';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useIssueStore } from '../store/issueStore';
import { colors } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { SettingsRow } from '../components/settings/SettingsRow';
export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const { user, profile, connected } = useAuthStore();
  const { issues, followed, confirmed } = useIssueStore();
  return (
    <Screen>
      <View style={{ width: '100%', maxWidth: 600, alignSelf: 'center', gap: 24 }}>
        <SectionHeader title="Your community profile" subtitle={user?.email ?? ''} />
        <View
          style={{
            backgroundColor: colors.pale,
            borderRadius: 24,
            padding: 30,
            alignItems: 'center',
            gap: 12,
          }}
        >
          <ProfilePhoto readOnly />
          <Text style={{ fontSize: 22, color: colors.ink, fontWeight: '700' }}>
            {profile?.displayName || user?.displayName || 'Complete your profile'}
          </Text>
          <Text style={{ color: colors.muted }}>{connected ? 'Connected' : 'Reconnecting…'}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          {[
            { label: 'Reports', count: issues.filter((i) => i.mine).length },
            { label: 'Following', count: followed.length },
            { label: 'Confirmed', count: confirmed.length },
          ].map((item) => (
            <View key={item.label} style={{ alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.ink }}>
                {item.count}
              </Text>
              <Text style={{ color: colors.muted }}>{item.label}</Text>
            </View>
          ))}
        </View>
        <Button
          label="Edit profile"
          icon="edit-2"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <SectionHeader title="Your CityFix" />
        <SettingsRow
          icon="settings"
          title="Settings"
          description="Reporting preferences, security, and more"
          onPress={() => navigation.navigate('Settings')}
        />
        <SettingsRow
          icon="help-circle"
          title="Help center"
          description="Answers, feedback, and community guidance"
          onPress={() => navigation.navigate('FAQ')}
        />
        <LogoutButton />
      </View>
    </Screen>
  );
}

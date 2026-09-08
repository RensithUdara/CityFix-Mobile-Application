import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useIssueStore } from '../store/issueStore';
import { logout, saveProfile } from '../services/auth';
import { errorMessage } from '../utils/errors';
import { initials } from '../utils/format';
import { colors } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { SettingsRow } from '../components/settings/SettingsRow';
export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const { user, profile, connected } = useAuthStore();
  const { issues, followed, confirmed } = useIssueStore();
  const [name, setName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    setName(profile?.displayName ?? user?.displayName ?? '');
    setNeighborhood(profile?.neighborhood ?? '');
  }, [profile, user]);
  const save = async () => {
    if (name.trim().length < 2 || name.trim().length > 80 || neighborhood.trim().length > 160) {
      setMessage('Use a name of 2–80 characters and a neighborhood under 160 characters.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await saveProfile({ displayName: name.trim(), neighborhood: neighborhood.trim() });
      setMessage('Profile updated.');
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  const signOut = async () => {
    setBusy(true);
    try {
      await logout();
    } catch (error) {
      setMessage(errorMessage(error));
      setBusy(false);
    }
  };
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
          <Text style={{ fontSize: 36, color: colors.primary, fontWeight: '800' }}>
            {initials(profile?.displayName || user?.displayName || user?.email || '')}
          </Text>
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
        <Field label="Full name" value={name} onChangeText={setName} maxLength={80} />
        <Field
          label="Neighborhood"
          value={neighborhood}
          onChangeText={setNeighborhood}
          maxLength={160}
          placeholder="Your town or neighborhood"
        />
        {!!message && (
          <Text accessibilityRole="alert" style={{ color: colors.primary }}>
            {message}
          </Text>
        )}
        <Button label={busy ? 'Please wait…' : 'Save profile'} disabled={busy} onPress={save} />
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
        <Button secondary label="Sign out" disabled={busy} onPress={signOut} />
      </View>
    </Screen>
  );
}

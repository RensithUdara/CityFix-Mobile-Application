import { ProfilePhoto } from '../components/profile/ProfilePhoto';
import { LogoutButton } from '../components/settings/LogoutButton';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useIssueStore } from '../store/issueStore';
import { saveProfile } from '../services/auth';
import { errorMessage } from '../utils/errors';
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
  const [phone, setPhone] = useState(''),
    [bio, setBio] = useState(''),
    [photoBusy, setPhotoBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    setName(profile?.displayName ?? user?.displayName ?? '');
    setNeighborhood(profile?.neighborhood ?? '');
    setPhone(profile?.phone ?? '');
    setBio(profile?.bio ?? '');
  }, [
    profile?.displayName,
    profile?.neighborhood,
    profile?.phone,
    profile?.bio,
    user?.uid,
    user?.displayName,
  ]);
  const save = async () => {
    if (name.trim().length < 2 || name.trim().length > 80 || neighborhood.trim().length > 160) {
      setMessage('Use a name of 2–80 characters and a neighborhood under 160 characters.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await saveProfile({
        displayName: name.trim(),
        neighborhood: neighborhood.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
      });
      setMessage('Profile updated.');
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
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
          <ProfilePhoto disabled={busy} onBusyChange={setPhotoBusy} />
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
        <Text style={{ color: colors.muted, fontSize: 13 }}>
          Make it yours. Photo, neighborhood, phone, and bio are optional. Your contact details stay
          private.
        </Text>
        <Field
          label="Phone number (optional)"
          value={phone}
          onChangeText={setPhone}
          maxLength={30}
          keyboardType="phone-pad"
          autoComplete="tel"
          placeholder="Add a contact number"
        />
        <Field
          label="About you (optional)"
          value={bio}
          onChangeText={setBio}
          maxLength={500}
          multiline
          placeholder="A little about you and your neighborhood"
        />
        {!!message && (
          <Text accessibilityRole="alert" style={{ color: colors.primary }}>
            {message}
          </Text>
        )}
        <Button
          label={busy ? 'Please wait…' : 'Save profile'}
          disabled={busy || photoBusy}
          onPress={save}
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
        <LogoutButton disabled={busy || photoBusy} />
      </View>
    </Screen>
  );
}

import { ProfilePhoto } from '../components/profile/ProfilePhoto';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { saveProfile } from '../services/auth';
import { errorMessage } from '../utils/errors';
import { colors } from '../theme';
export function EditProfileScreen() {
  const { user, profile } = useAuthStore();
  const [name, setName] = useState(profile?.displayName ?? user?.displayName ?? '');
  const [neighborhood, setNeighborhood] = useState('');
  const [phone, setPhone] = useState(''),
    [bio, setBio] = useState(''),
    [photoBusy, setPhotoBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const dirty = useRef(new Set<string>());
  const initializedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!user || !profile || initializedFor.current === user.uid) return;
    initializedFor.current = user.uid;
    if (!dirty.current.has('name')) setName(profile?.displayName ?? user?.displayName ?? '');
    if (!dirty.current.has('neighborhood')) setNeighborhood(profile?.neighborhood ?? '');
    if (!dirty.current.has('phone')) setPhone(profile?.phone ?? '');
    if (!dirty.current.has('bio')) setBio(profile?.bio ?? '');
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
        <SectionHeader title="Edit profile" subtitle={user?.email ?? ''} />
        <ProfilePhoto disabled={busy} onBusyChange={setPhotoBusy} />
        <Field
          label="Full name"
          value={name}
          onChangeText={(value) => {
            dirty.current.add('name');
            setName(value);
          }}
          maxLength={80}
        />
        <Field
          label="Neighborhood"
          value={neighborhood}
          onChangeText={(value) => {
            dirty.current.add('neighborhood');
            setNeighborhood(value);
          }}
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
          onChangeText={(value) => {
            dirty.current.add('phone');
            setPhone(value);
          }}
          maxLength={30}
          keyboardType="phone-pad"
          autoComplete="tel"
          placeholder="Add a contact number"
        />
        <Field
          label="About you (optional)"
          value={bio}
          onChangeText={(value) => {
            dirty.current.add('bio');
            setBio(value);
          }}
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
      </View>
    </Screen>
  );
}

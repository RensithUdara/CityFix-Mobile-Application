import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { pickPhotos } from '../../services/device';
import { saveProfilePhoto } from '../../services/profile';
import { useAuthStore } from '../../store/authStore';
import { initials } from '../../utils/format';
import { colors } from '../../theme';
import { Icon } from '../ui/Icon';
export function ProfilePhoto({
  disabled = false,
  readOnly = false,
  onBusyChange,
}: {
  disabled?: boolean;
  readOnly?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const { profile, user } = useAuthStore();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function change(remove = false) {
    if (busy) return;
    setBusy(true);
    onBusyChange?.(true);
    setError('');
    try {
      const photo = remove ? null : (await pickPhotos(false, 1))[0];
      if (photo === undefined) return;
      await saveProfilePhoto(photo);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }
  return (
    <View style={{ alignItems: 'center', gap: 12 }}>
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {profile?.photoURL ? (
          <Image
            accessibilityLabel="Your profile photo"
            source={{ uri: profile.photoURL }}
            style={{ width: 100, height: 100 }}
          />
        ) : (
          <Text style={{ fontSize: 32, fontWeight: '800', color: colors.primary }}>
            {initials(profile?.displayName || user?.displayName || '')}
          </Text>
        )}
      </View>
      {!readOnly && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          disabled={disabled || busy}
          onPress={() => void change()}
          style={{ flexDirection: 'row', gap: 8, padding: 12 }}
        >
          <Icon name="camera" size={17} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: '700' }}>
            {busy ? 'Saving photoâ€¦' : profile?.photoURL ? 'Change photo' : 'Add profile photo'}
          </Text>
        </Pressable>
      )}
      {!readOnly && !!profile?.photoURL && (
        <Pressable
          accessibilityRole="button"
          disabled={disabled || busy}
          onPress={() => void change(true)}
          style={{ padding: 10 }}
        >
          <Text style={{ color: colors.muted }}>Remove photo</Text>
        </Pressable>
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
    </View>
  );
}

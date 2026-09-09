import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { logout } from '../../services/auth';
import { errorMessage } from '../../utils/errors';
import { colors } from '../../theme';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
export function LogoutButton({ disabled = false }: { disabled?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const signOut = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await logout();
      setVisible(false);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={{ gap: 10 }}>
      <Button
        secondary
        label={busy ? 'Logging out…' : 'Log out'}
        icon="log-out"
        disabled={busy || disabled}
        onPress={() => {
          setError('');
          setVisible(true);
        }}
      />
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!busy) setVisible(false);
        }}
      >
        <View style={styles.backdrop}>
          <View accessibilityViewIsModal style={styles.card}>
            <View style={styles.icon}>
              <Icon name="log-out" size={28} color={colors.primary} />
            </View>
            <Text accessibilityRole="header" style={styles.title}>
              Log out of CityFix?
            </Text>
            <Text style={styles.body}>
              You can sign in again anytime. Pending reports stay on this device and resume
              uploading when you return to this account.
            </Text>
            {!!error && (
              <Text accessibilityRole="alert" style={{ color: colors.danger, lineHeight: 21 }}>
                {error}
              </Text>
            )}
            <Button
              label={busy ? 'Logging out…' : 'Yes, log out'}
              icon="log-out"
              disabled={busy}
              onPress={signOut}
            />
            <Button
              secondary
              label="Stay signed in"
              disabled={busy}
              onPress={() => setVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#10251F99', padding: 24, justifyContent: 'center' },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 26,
    padding: 26,
    gap: 20,
  },
  icon: { alignSelf: 'center', padding: 18, backgroundColor: colors.pale, borderRadius: 40 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', color: colors.ink },
  body: { fontSize: 14, lineHeight: 23, textAlign: 'center', color: colors.muted },
});

import { useState } from 'react';
import { changePassword } from '../services/auth';
import { Text, View } from 'react-native';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { colors } from '../theme';
import { errorMessage } from '../utils/errors';
export function SecurityScreen() {
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (password.length < 8 || password !== confirm) {
      setMessage('Use at least 8 characters and make sure the new passwords match.');
      return;
    }
    if (!current) {
      setMessage('Enter your current password.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await changePassword(current, password);
      setCurrent('');
      setPassword('');
      setConfirm('');
      setMessage('Password updated successfully.');
    } catch (e) {
      setMessage(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen>
      <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center', gap: 22 }}>
        <SectionHeader
          title="A little extra peace of mind"
          subtitle="Choose a unique password to protect your CityFix account."
        />
        <Field
          label="Current password"
          value={current}
          onChangeText={setCurrent}
          secureTextEntry
          autoComplete="current-password"
        />
        <Field
          label="New password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
        />
        <Field
          label="Confirm new password"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          autoComplete="new-password"
        />
        {!!message && (
          <Text accessibilityRole="alert" style={{ color: colors.primary }}>
            {message}
          </Text>
        )}
        <Button
          label={busy ? 'Updating…' : 'Update password'}
          icon="lock"
          disabled={busy}
          onPress={save}
        />
      </View>
    </Screen>
  );
}

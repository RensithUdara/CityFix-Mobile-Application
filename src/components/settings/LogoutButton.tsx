import { useState } from 'react';
import { Text, View } from 'react-native';
import { logout } from '../../services/auth';
import { errorMessage } from '../../utils/errors';
import { colors } from '../../theme';
import { Button } from '../ui/Button';
export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const signOut = async () => { setBusy(true); setError(''); try { await logout(); } catch (e) { setError(errorMessage(e)); setBusy(false); } };
  return <View style={{ gap: 10 }}>{!!error && <Text accessibilityRole="alert" style={{ color: colors.danger }}>{error}</Text>}<Button secondary label={busy ? 'Logging out…' : 'Log out'} icon="log-out" disabled={busy} onPress={signOut} /></View>;
}

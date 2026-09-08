import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { login, register, resetPassword } from '../services/auth';
import { errorMessage } from '../utils/errors';
import { colors } from '../theme';
import { BrandLogo } from '../components/branding/BrandLogo';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
export function AuthScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const submit = async () => {
    setMessage('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setMessage('Enter a valid email address.');
      return;
    }
    if (mode === 'register' && (name.trim().length < 2 || name.trim().length > 80)) {
      setMessage('Enter a name between 2 and 80 characters.');
      return;
    }
    if (mode !== 'reset' && password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'register') await register(email, password, name);
      else if (mode === 'login') await login(email, password);
      else {
        await resetPassword(email);
        setMessage('If an account exists, a password reset email will arrive shortly.');
      }
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen>
      <View style={{ width: '100%', maxWidth: 460, alignSelf: 'center', gap: 22, paddingTop: 50 }}>
        <View style={{ alignItems: 'center', backgroundColor: 'white', borderRadius: 22 }}>
          <BrandLogo size={145} />
        </View>
        <SectionHeader
          title={
            mode === 'register'
              ? 'Join your community'
              : mode === 'reset'
                ? 'Reset your password'
                : 'Welcome back, neighbor'
          }
          subtitle="Sign in to report issues and follow real progress."
        />
        {mode === 'register' && (
          <Field label="Full name" value={name} onChangeText={setName} autoComplete="name" />
        )}
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        {mode !== 'reset' && (
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          />
        )}
        {!!message && (
          <Text accessibilityRole="alert" style={{ color: colors.primary, lineHeight: 22 }}>
            {message}
          </Text>
        )}
        <Button
          label={
            busy
              ? 'Please wait…'
              : mode === 'register'
                ? 'Create account'
                : mode === 'reset'
                  ? 'Send reset email'
                  : 'Sign in'
          }
          disabled={busy}
          onPress={submit}
        />
        <Button
          secondary
          label={mode === 'login' ? 'Create an account' : 'Back to sign in'}
          disabled={busy}
          onPress={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setMessage('');
          }}
        />
        {mode === 'login' && (
          <Button
            secondary
            label="Forgot password?"
            onPress={() => {
              setMode('reset');
              setMessage('');
            }}
          />
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
          <Button secondary label="Privacy policy" onPress={() => navigation.navigate('Privacy')} />
          <Button secondary label="FAQ" onPress={() => navigation.navigate('FAQ')} />
        </View>
      </View>
    </Screen>
  );
}

import { ResetEmailDialog } from '../components/auth/ResetEmailDialog';
import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { PasswordField } from '../components/auth/PasswordField';
import { Screen } from '../components/ui/Screen';
import { Icon } from '../components/ui/Icon';
import { login, register, resetPassword } from '../services/auth';
import { errorMessage } from '../utils/errors';
import { colors } from '../theme';
import { BrandLogo } from '../components/branding/BrandLogo';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
type Mode = 'login' | 'register' | 'reset';
function TextLink({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      disabled={disabled}
      accessibilityState={{ disabled }}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        justifyContent: 'center',
        opacity: disabled || pressed ? 0.5 : 1,
      })}
    >
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}
export function AuthScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [confirmation, setConfirmation] = useState(''),
    [name, setName] = useState('');
  const [accepted, setAccepted] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [success, setSuccess] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const changeMode = (next: Mode) => {
    setMode(next);
    setMessage('');
    setSuccess(false);
    setPassword('');
    setConfirmation('');
    setAccepted(false);
  };
  const submit = async () => {
    if (busy) return;
    setMessage('');
    setSuccess(false);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setMessage('Enter a valid email address.');
    if (mode === 'register' && (name.trim().length < 2 || name.trim().length > 80))
      return setMessage('Enter a name between 2 and 80 characters.');
    if (mode !== 'reset' && password.length < 6)
      return setMessage('Password must be at least 6 characters.');
    if (mode === 'register' && password !== confirmation)
      return setMessage('Passwords do not match.');
    if (mode === 'register' && !accepted)
      return setMessage('Please read and accept the Privacy policy to create an account.');
    setBusy(true);
    try {
      if (mode === 'register') await register(email, password, name);
      else if (mode === 'login') await login(email, password);
      else {
        await resetPassword(email);
        Keyboard.dismiss();
        setResetEmail(email.trim());
      }
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen>
      <ResetEmailDialog
        email={resetEmail}
        onClose={() => setResetEmail('')}
        onSignIn={() => {
          setResetEmail('');
          changeMode('login');
        }}
      />
      <View style={styles.page}>
        <View style={styles.topbar}>
          <View style={styles.logo}>
            <BrandLogo size={88} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Frequently asked questions"
            onPress={() => navigation.navigate('FAQ')}
            style={styles.help}
          >
            <Icon name="help-circle" size={24} color={colors.primary} />
          </Pressable>
        </View>
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>YOUR NEIGHBORHOOD. OUR COMMUNITY.</Text>
          <Text accessibilityRole="header" style={styles.title}>
            {mode === 'register'
              ? 'Join your community'
              : mode === 'reset'
                ? 'Reset your password'
                : 'Welcome back, neighbor'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'register'
              ? 'Small actions make a better city. Create your account to get started.'
              : mode === 'reset'
                ? 'Enter your email and weâ€™ll send you a link to choose a new password.'
                : 'A better neighborhood starts with you. Sign in to report, follow, and make a difference.'}
          </Text>
        </View>
        <View style={styles.form}>
          {mode === 'register' && (
            <Field
              label="Full name"
              value={name}
              onChangeText={setName}
              autoComplete="name"
              textContentType="name"
              placeholder="Your full name"
              editable={!busy}
            />
          )}
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            placeholder="you@example.com"
            editable={!busy}
          />
          {mode !== 'reset' && (
            <PasswordField
              key={mode}
              label="Password"
              value={password}
              onChangeText={setPassword}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              textContentType={mode === 'register' ? 'newPassword' : 'password'}
              placeholder={mode === 'register' ? 'Create a password' : 'Enter your password'}
              editable={!busy}
            />
          )}
          {mode === 'register' && (
            <>
              <Text style={styles.hint}>Use at least 6 characters.</Text>
              <PasswordField
                label="Confirm password"
                value={confirmation}
                onChangeText={setConfirmation}
                autoComplete="new-password"
                textContentType="newPassword"
                placeholder="Enter your password again"
                editable={!busy}
              />
            </>
          )}
          {mode === 'login' && (
            <View style={styles.forgot}>
              <TextLink
                label="Forgot password?"
                disabled={busy}
                onPress={() => changeMode('reset')}
              />
            </View>
          )}
          {mode === 'register' && (
            <View style={styles.privacy}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityLabel="Accept Privacy policy"
                aria-checked={accepted}
                accessibilityState={{ checked: accepted, disabled: busy }}
                disabled={busy}
                onPress={() => setAccepted((v) => !v)}
                style={styles.checkTarget}
              >
                <View style={[styles.checkbox, accepted && styles.checked]}>
                  {accepted && <Icon name="check" size={15} color="white" />}
                </View>
              </Pressable>
              <Text style={styles.privacyText}>
                I have read and accept the{' '}
                <Text
                  accessibilityRole="link"
                  onPress={() => navigation.navigate('Privacy')}
                  style={[styles.link, { textDecorationLine: 'underline' }]}
                >
                  Privacy policy
                </Text>
                .
              </Text>
            </View>
          )}
          {!!message && (
            <Text
              accessibilityRole={success ? 'text' : 'alert'}
              accessibilityLiveRegion="polite"
              style={[styles.message, { color: success ? colors.primary : colors.danger }]}
            >
              {message}
            </Text>
          )}
          <Button
            label={
              busy
                ? 'Please waitâ€¦'
                : mode === 'register'
                  ? 'Create account'
                  : mode === 'reset'
                    ? 'Send reset email'
                    : 'Sign in'
            }
            disabled={busy}
            onPress={submit}
          />
        </View>
        <View style={styles.switchMode}>
          <Text style={styles.subtitle}>
            {mode === 'login'
              ? 'New to CityFix?'
              : mode === 'register'
                ? 'Already have an account?'
                : 'Remember your password?'}
          </Text>
          <TextLink
            label={mode === 'login' ? 'Create an account' : 'Back to sign in'}
            disabled={busy}
            onPress={() => changeMode(mode === 'login' ? 'register' : 'login')}
          />
        </View>
        {mode !== 'register' && (
          <View style={styles.footer}>
            <TextLink label="Privacy policy" onPress={() => navigation.navigate('Privacy')} />
          </View>
        )}
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  page: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    paddingTop: 10,
    paddingBottom: 28,
    gap: 25,
  },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { backgroundColor: 'white', borderRadius: 20, overflow: 'hidden' },
  help: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  intro: { gap: 12 },
  eyebrow: { fontSize: 9, letterSpacing: 1.8, color: colors.primary, fontWeight: '700' },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -1.2,
    color: colors.ink,
  },
  subtitle: { fontSize: 14, lineHeight: 22, color: colors.muted },
  form: { gap: 18 },
  link: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  forgot: { alignSelf: 'flex-end', marginTop: -14, marginBottom: -8 },
  hint: { fontSize: 12, color: colors.muted, marginTop: -10 },
  privacy: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: -10 },
  checkTarget: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  checkbox: {
    width: 21,
    height: 21,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: { backgroundColor: colors.primary, borderColor: colors.primary },
  privacyText: { flex: 1, fontSize: 13, lineHeight: 22, color: colors.muted },
  message: { fontSize: 13, lineHeight: 21 },
  switchMode: {
    flexDirection: 'row',
    gap: 7,
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: { alignItems: 'center', marginTop: -15 },
});

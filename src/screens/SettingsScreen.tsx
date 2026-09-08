import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, Switch, Text, View } from 'react-native';
import { RootStackParams } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { Preferences, usePreferencesStore } from '../store/preferencesStore';
import { savePreferences } from '../services/preferences';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { SettingsRow } from '../components/settings/SettingsRow';
import { LogoutButton } from '../components/settings/LogoutButton';
import { colors } from '../theme';
import { errorMessage } from '../utils/errors';
export function SettingsScreen({
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Settings'>) {
  const preferences = usePreferencesStore();
  const user = useAuthStore((s) => s.user);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const change = async (patch: Partial<Preferences>) => {
    setBusy(true);
    setError('');
    try {
      await savePreferences({ ...preferences, ...patch });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen>
      <View style={{ maxWidth: 720, width: '100%', alignSelf: 'center', gap: 26 }}>
        <SectionHeader
          title="Make CityFix yours"
          subtitle="Small preferences for a better everyday experience."
        />
        <View style={{ backgroundColor: colors.pale, padding: 22, borderRadius: 22, gap: 8 }}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Your account</Text>
          <Text style={{ color: colors.ink }}>{user?.email}</Text>
          <Text style={{ color: colors.muted, fontSize: 11 }}>
            Preferences sync across your signed-in devices.
          </Text>
        </View>
        <SectionHeader title="Reporting preferences" />
        <View style={{ gap: 10 }}>
          <SettingsRow
            icon="bookmark"
            title="Follow my new reports"
            description="Automatically keep new reports in your following list."
            trailing={
              <Switch
                accessibilityLabel="Follow my new reports"
                value={preferences.autoFollow}
                disabled={busy}
                onValueChange={(value) => change({ autoFollow: value })}
                trackColor={{ true: colors.primary }}
              />
            }
          />
          <SettingsRow
            icon="check-circle"
            title="Show resolved issues"
            description="Include completed improvements in your home feed."
            trailing={
              <Switch
                accessibilityLabel="Show resolved issues"
                value={preferences.showResolved}
                disabled={busy}
                onValueChange={(value) => change({ showResolved: value })}
                trackColor={{ true: colors.primary }}
              />
            }
          />
          <View
            style={{
              padding: 19,
              borderRadius: 17,
              borderWidth: 1,
              borderColor: colors.line,
              backgroundColor: 'white',
              gap: 14,
            }}
          >
            <Text style={{ fontWeight: '700', color: colors.ink }}>Default report severity</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {(['Low', 'Medium', 'High'] as const).map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityLabel={`Default severity ${value}`}
                  accessibilityState={{ selected: preferences.defaultSeverity === value }}
                  aria-selected={preferences.defaultSeverity === value}
                  disabled={busy}
                  onPress={() => change({ defaultSeverity: value })}
                  style={{
                    flex: 1,
                    padding: 13,
                    borderRadius: 10,
                    backgroundColor:
                      preferences.defaultSeverity === value ? colors.primary : colors.pale,
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      color: preferences.defaultSeverity === value ? 'white' : colors.primary,
                    }}
                  >
                    {value}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
        {!!error && (
          <Text accessibilityRole="alert" style={{ color: colors.danger }}>
            {error}
          </Text>
        )}
        <SectionHeader title="Account & support" />
        <LogoutButton />
        <View style={{ gap: 10 }}>
          <SettingsRow
            icon="lock"
            title="Account security"
            description="Change your password securely."
            onPress={() => navigation.navigate('Security')}
          />
          <SettingsRow
            icon="help-circle"
            title="Frequently asked questions"
            description="Quick answers to common questions."
            onPress={() => navigation.navigate('FAQ')}
          />
          <SettingsRow
            icon="message-circle"
            title="Help & feedback"
            description="Send a question or tell us what could be better."
            onPress={() => navigation.navigate('HelpSupport')}
          />
        </View>
        <SectionHeader title="Trust & information" />
        <View style={{ gap: 10 }}>
          <SettingsRow
            icon="shield"
            title="Privacy policy"
            onPress={() => navigation.navigate('Privacy')}
          />
          <SettingsRow
            icon="users"
            title="Community guidelines"
            onPress={() => navigation.navigate('Guidelines')}
          />
          <SettingsRow
            icon="info"
            title="About CityFix"
            onPress={() => navigation.navigate('About')}
          />
        </View>
      </View>
    </Screen>
  );
}

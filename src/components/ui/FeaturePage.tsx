import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from './Screen';
import { SectionHeader } from './SectionHeader';
import { colors } from '../../theme';
export function FeaturePage({
  title,
  subtitle,
  children,
  error,
}: PropsWithChildren<{ title: string; subtitle: string; error?: string }>) {
  return (
    <Screen>
      <View style={featureStyles.page}>
        <SectionHeader title={title} subtitle={subtitle} />
        {!!error && (
          <Text accessibilityRole="alert" style={{ color: colors.danger }}>
            {error}
          </Text>
        )}
        {children}
      </View>
    </Screen>
  );
}
export const featureStyles = StyleSheet.create({
  page: { width: '100%', maxWidth: 760, alignSelf: 'center', gap: 22 },
  card: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 14,
  },
  title: { color: colors.ink, fontSize: 17, fontWeight: '700' },
  body: { color: colors.muted, fontSize: 13, lineHeight: 22 },
  metric: { color: colors.primary, fontSize: 30, fontWeight: '800' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
});

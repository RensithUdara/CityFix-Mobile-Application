import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';
export function SectionHeader({
  title,
  subtitle,
  action,
  onPress,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {action && (
        <Pressable accessibilityRole="button" onPress={onPress} style={{ padding: 10 }}>
          <Text style={styles.action}>{action} →</Text>
        </Pressable>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink, letterSpacing: -0.7 },
  subtitle: { fontSize: 13, color: colors.muted, lineHeight: 20 },
  action: { fontSize: 13, color: colors.primary, fontWeight: '600' },
});

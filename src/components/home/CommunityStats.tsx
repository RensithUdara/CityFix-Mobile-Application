import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';
import { Issue } from '../../types/issue';
import { Icon, IconName } from '../ui/Icon';
export function CommunityStats({ issues }: { issues: Issue[] }) {
  const stats: { label: string; value: number; icon: IconName; color: string; bg: string }[] = [
    {
      label: 'Issues reported',
      value: issues.length,
      icon: 'flag',
      color: colors.primary,
      bg: colors.pale,
    },
    {
      label: 'In progress',
      value: issues.filter((i) => i.status === 'In progress').length,
      icon: 'tool',
      color: colors.orange,
      bg: colors.orangeLight,
    },
    {
      label: 'Made better',
      value: issues.filter((i) => i.status === 'Resolved').length,
      icon: 'check-circle',
      color: colors.primary,
      bg: colors.pale,
    },
  ];
  return (
    <View style={styles.row}>
      {stats.map((s) => (
        <View style={styles.stat} key={s.label}>
          <View style={[styles.icon, { backgroundColor: s.bg }]}>
            <Icon name={s.icon} color={s.color} size={19} />
          </View>
          <View style={{ gap: 4 }}>
            <Text style={styles.value}>{String(s.value).padStart(2, '0')}</Text>
            <Text style={styles.label}>{s.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  stat: {
    flex: 1,
    minWidth: 95,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
  },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 25, fontWeight: '700', color: colors.ink, letterSpacing: -0.7 },
  label: { fontSize: 10, color: colors.muted },
});

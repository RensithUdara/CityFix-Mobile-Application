import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ReactNode } from 'react';
import { Icon, IconName } from '../ui/Icon';
import { colors } from '../../theme';
export function SettingsRow({
  icon,
  title,
  description,
  onPress,
  trailing,
  danger = false,
}: {
  icon: IconName;
  title: string;
  description?: string;
  onPress?: () => void;
  trailing?: ReactNode;
  danger?: boolean;
}) {
  const content = (
    <>
      <View style={[styles.icon, danger && { backgroundColor: '#FBEDEA' }]}>
        <Icon name={icon} color={danger ? colors.danger : colors.primary} size={20} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={[styles.title, danger && { color: colors.danger }]}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      {trailing || (onPress && <Icon name="chevron-right" size={18} color={colors.muted} />)}
    </>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
    >
      {content}
    </Pressable>
  ) : (
    <View style={styles.row}>{content}</View>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    padding: 18,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.line,
  },
  icon: { padding: 12, borderRadius: 13, backgroundColor: colors.pale },
  title: { fontSize: 14, fontWeight: '700', color: colors.ink },
  description: { fontSize: 11, lineHeight: 18, color: colors.muted },
});

import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../theme';
import { Icon, IconName } from './Icon';
export function Button({
  label,
  onPress,
  icon,
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        { opacity: disabled ? 0.45 : pressed ? 0.75 : 1 },
      ]}
    >
      {icon && <Icon name={icon} color={secondary ? colors.primary : 'white'} size={18} />}
      <Text style={[styles.text, secondary && { color: colors.primary }]}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  secondary: { backgroundColor: colors.pale },
  text: { color: 'white', fontWeight: '700', fontSize: 14 },
});

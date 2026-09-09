import { Text, TextInput, TextInputProps, View, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import { ReactNode } from 'react';
export function Field({
  label,
  error,
  rightAccessory,
  ...props
}: TextInputProps & { label: string; error?: string; rightAccessory?: ReactNode }) {
  return (
    <View style={{ gap: 9 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.muted}
          {...props}
          style={[
            styles.input,
            props.multiline && { minHeight: 110, textAlignVertical: 'top' },
            props.style,
            error && { borderColor: colors.danger },
            rightAccessory != null && { paddingRight: 56 },
          ]}
        />
        {rightAccessory != null && (
          <View
            style={{ position: 'absolute', right: 4, top: 0, bottom: 0, justifyContent: 'center' }}
          >
            {rightAccessory}
          </View>
        )}
      </View>
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  label: { color: colors.ink, fontWeight: '600', fontSize: 13 },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 15,
    color: colors.ink,
    fontSize: 14,
  },
  error: { fontSize: 12, color: colors.danger },
});

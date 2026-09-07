import { Text, TextInput, TextInputProps, View, StyleSheet } from 'react-native';
import { colors } from '../../theme';
export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  return <View style={{ gap: 9 }}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor={colors.muted} {...props} style={[styles.input, props.multiline && { minHeight: 110, textAlignVertical: 'top' }, props.style, error && { borderColor: colors.danger }]} />{error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}</View>;
}
const styles = StyleSheet.create({ label: { color: colors.ink, fontWeight: '600', fontSize: 13 }, input: { backgroundColor: 'white', borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 15, color: colors.ink, fontSize: 14 }, error: { fontSize: 12, color: colors.danger } });

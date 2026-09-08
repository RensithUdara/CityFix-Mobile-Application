import { ActivityIndicator, Text, View } from 'react-native';
import { useIssueStore } from '../../store/issueStore';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme';
export function DataState() {
  const { loading, error } = useIssueStore();
  const authError = useAuthStore((s) => s.error);
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  if (!loading && !error && !authError) return null;
  return (
    <View style={{ padding: 12, gap: 8 }}>
      {loading && <ActivityIndicator color={colors.primary} />}
      {!!(error || authError) && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error || authError}
        </Text>
      )}
    </View>
  );
}

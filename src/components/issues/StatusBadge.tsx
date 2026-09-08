import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';
import { Status } from '../../types/issue';
export function StatusBadge({ status }: { status: Status }) {
  const color =
    status === 'Resolved' ? colors.primary : status === 'In progress' ? colors.orange : colors.blue;
  const backgroundColor =
    status === 'Resolved'
      ? colors.pale
      : status === 'In progress'
        ? colors.orangeLight
        : colors.blueLight;
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <View style={{ width: 5, height: 5, borderRadius: 5, backgroundColor: color }} />
      <Text style={{ color, fontSize: 11, fontWeight: '700' }}>{status}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
});

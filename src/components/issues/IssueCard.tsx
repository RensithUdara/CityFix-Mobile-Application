import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, shadow } from '../../theme';
import { Issue } from '../../types/issue';
import { relativeDate } from '../../utils/format';
import { Icon } from '../ui/Icon';
import { StatusBadge } from './StatusBadge';
export const IssueCard = memo(function IssueCard({ issue, onPress }: { issue: Issue; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`View ${issue.title}`} onPress={onPress} style={({ pressed }) => [styles.card, { opacity: pressed ? 0.8 : 1 }]}>
    <View style={styles.photo}>{issue.image ? <Image source={{ uri: issue.image }} style={StyleSheet.absoluteFillObject} resizeMode="cover" /> : <Icon name="map-pin" size={42} color={colors.primary} />}<View style={styles.status}><StatusBadge status={issue.status} /></View><View style={styles.category}><Text style={styles.categoryText}>{issue.category}</Text></View></View>
    <View style={styles.body}><Text numberOfLines={1} style={styles.title}>{issue.title}</Text><View style={styles.row}><Icon name="map-pin" size={12} color={colors.muted} /><Text numberOfLines={1} style={styles.muted}>{issue.address}</Text></View><View style={styles.footer}><View style={styles.row}><Icon name="thumbs-up" size={14} color={colors.primary} /><Text style={styles.confirm}>{issue.confirmations} neighbors</Text></View><Text style={styles.muted}>{relativeDate(issue.createdAt)}</Text></View></View>
  </Pressable>;
});
const styles = StyleSheet.create({ card: { backgroundColor: 'white', borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: colors.line, ...shadow }, photo: { height: 176, backgroundColor: colors.pale, alignItems: 'center', justifyContent: 'center' }, status: { position: 'absolute', top: 14, left: 14 }, category: { position: 'absolute', bottom: 12, left: 14, backgroundColor: '#FFFFFFEF', borderRadius: 6, paddingHorizontal: 9, paddingVertical: 5 }, categoryText: { color: colors.ink, fontSize: 10, fontWeight: '700' }, body: { padding: 17, gap: 11 }, title: { fontWeight: '700', fontSize: 16, color: colors.ink, letterSpacing: -0.3 }, row: { flexDirection: 'row', gap: 5, alignItems: 'center', flexShrink: 1 }, muted: { fontSize: 11, color: colors.muted, flexShrink: 1 }, footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: colors.line, paddingTop: 13, marginTop: 2 }, confirm: { fontSize: 11, color: colors.primary, fontWeight: '600' } });

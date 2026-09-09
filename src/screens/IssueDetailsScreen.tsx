import { useState } from 'react';
import { errorMessage } from '../utils/errors';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { shareReport } from '../services/shareReport';
import { PhotoGallery } from '../components/issues/PhotoGallery';
import { IssueDiscussion } from '../components/issues/IssueDiscussion';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { useIssueStore } from '../store/issueStore';
import { Screen } from '../components/ui/Screen';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/issues/StatusBadge';
import { Icon } from '../components/ui/Icon';
import { colors } from '../theme';
import { relativeDate } from '../utils/format';
import { reportReference } from '../utils/reference';
export function IssueDetailsScreen({
  route,
}: NativeStackScreenProps<RootStackParams, 'IssueDetails'>) {
  const { issues, followed, confirmed, toggleFollow, toggleConfirm } = useIssueStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const act = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const issue = issues.find((i) => i.id === route.params.id);
  if (!issue)
    return (
      <Screen>
        <EmptyState
          title="Issue not found"
          description="This report is unavailable or still loading."
        />
      </Screen>
    );
  const stages = ['Reported', 'In progress', 'Resolved'];
  return (
    <Screen>
      <View style={{ maxWidth: 800, width: '100%', alignSelf: 'center', gap: 22 }}>
        {issue.mine && (
          <View style={styles.notice}>
            <Icon name="check-circle" color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 13, flex: 1 }}>
              Your report is shared with the community. Thank you for caring.
            </Text>
          </View>
        )}
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <StatusBadge status={issue.status} />
          <Text style={styles.muted}>
            {issue.category} · {issue.severity} priority
          </Text>
        </View>
        <Text style={styles.title}>{issue.title}</Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Icon name="map-pin" size={16} color={colors.muted} />
          <Text style={[styles.muted, { flex: 1 }]}>{issue.address}</Text>
        </View>
        <PhotoGallery photos={issue.photos} />
        <View style={styles.card}>
          <Text style={styles.heading}>The little details</Text>
          <Text style={styles.description}>{issue.description}</Text>
          <Text style={styles.muted}>
            Reported {relativeDate(issue.createdAt).toLowerCase()} ·{' '}
            {issue.mine ? 'You' : 'A caring neighbor'}
          </Text>
          <View style={styles.metadata}>
            <View style={styles.metric}>
              <Icon name="calendar" color={colors.primary} />
              <Text style={styles.muted}>Date reported</Text>
              <Text style={styles.value}>{new Date(issue.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.metric}>
              <Icon name="flag" color={colors.primary} />
              <Text style={styles.muted}>Priority</Text>
              <Text style={styles.value}>{issue.severity}</Text>
            </View>
            <View style={styles.metric}>
              <Icon name="camera" color={colors.primary} />
              <Text style={styles.muted}>Evidence</Text>
              <Text style={styles.value}>{issue.photos.length} photos</Text>
            </View>
          </View>
          <Text selectable style={styles.muted}>
            Reference: {reportReference(issue.id)}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.heading}>Journey to a better neighborhood</Text>
          <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
            {stages.map((stage, index) => (
              <View key={stage} style={{ flex: 1, gap: 10, alignItems: 'center' }}>
                <View
                  style={[
                    styles.stage,
                    {
                      backgroundColor:
                        index <= stages.indexOf(issue.status) ? colors.primary : colors.pale,
                    },
                  ]}
                >
                  <Icon
                    name={index <= stages.indexOf(issue.status) ? 'check' : 'clock'}
                    size={16}
                    color={index <= stages.indexOf(issue.status) ? 'white' : colors.muted}
                  />
                </View>
                <Text style={styles.muted}>{stage}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.notice}>
          <Icon name="users" color={colors.primary} />
          <Text style={{ color: colors.primary, flex: 1, lineHeight: 21 }}>
            <Text style={{ fontWeight: '700' }}>{issue.confirmations} neighbors</Text> have
            confirmed this issue.
          </Text>
        </View>
        <View style={{ gap: 12 }}>
          <Button
            label={confirmed.includes(issue.id) ? 'Confirmed by you' : 'I noticed this too'}
            icon="thumbs-up"
            disabled={busy}
            onPress={() => act(() => toggleConfirm(issue.id))}
          />
          <Button
            secondary
            label={
              followed.includes(issue.id)
                ? 'Following issue · Tap to unfollow'
                : 'Follow this issue'
            }
            icon="bookmark"
            disabled={busy}
            onPress={() => act(() => toggleFollow(issue.id))}
          />
        </View>
        <Text style={[styles.muted, { textAlign: 'center' }]}>
          {error || 'Reports and confirmations update live.'}
        </Text>
        <View style={styles.card}>
          <Text style={styles.heading}>Find it. Share it. Help it get fixed.</Text>
          <Text style={styles.description}>{issue.address}</Text>
          <Button
            secondary
            label="Get directions"
            icon="navigation"
            onPress={() =>
              act(async () => {
                const destination =
                  issue.latitude != null && issue.longitude != null
                    ? `${issue.latitude},${issue.longitude}`
                    : issue.address;
                await Linking.openURL(
                  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,
                );
              })
            }
          />
          <Button
            secondary
            label="Share this report"
            icon="share-2"
            onPress={() =>
              act(async () => {
                setFeedback(await shareReport(issue));
              })
            }
          />
        </View>
        {!!feedback && (
          <Text accessibilityRole="alert" style={styles.muted}>
            {feedback}
          </Text>
        )}
        <IssueDiscussion key={issue.id} issueId={issue.id} />
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  metadata: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderColor: colors.line,
    paddingTop: 20,
  },
  metric: { flex: 1, minWidth: 90, gap: 8 },
  value: { color: colors.ink, fontWeight: '700', fontSize: 13 },
  title: { fontSize: 32, lineHeight: 40, fontWeight: '700', color: colors.ink, letterSpacing: -1 },
  muted: { color: colors.muted, fontSize: 12, lineHeight: 19 },
  image: { width: '100%', height: 290, borderRadius: 22, backgroundColor: colors.pale },
  card: {
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 16,
  },
  heading: { fontSize: 17, fontWeight: '700', color: colors.ink },
  description: { fontSize: 14, lineHeight: 25, color: '#65776D' },
  notice: {
    padding: 17,
    borderRadius: 14,
    backgroundColor: colors.pale,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  stage: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
});

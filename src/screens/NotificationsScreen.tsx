import { Text, View } from 'react-native';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { useIssueStore } from '../store/issueStore';
import { colors } from '../theme';
import { StatusBadge } from '../components/issues/StatusBadge';
export function NotificationsScreen() {
  const { issues, followed } = useIssueStore();
  const watched = issues.filter((i) => followed.includes(i.id));
  return (
    <Screen>
      <SectionHeader
        title="A little good news"
        subtitle="Current status of the issues you follow."
      />
      {watched.length ? (
        watched.map((i) => (
          <View
            key={i.id}
            style={{
              padding: 22,
              gap: 13,
              borderRadius: 16,
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: colors.line,
            }}
          >
            <Text style={{ color: colors.ink, fontWeight: '700' }}>{i.title}</Text>
            <StatusBadge status={i.status} />
          </View>
        ))
      ) : (
        <EmptyState
          title="You’re all caught up"
          description="Follow a report to see its current status here."
        />
      )}
      <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 20 }}>
        Followed issue statuses update live while the app is open.
      </Text>
    </Screen>
  );
}

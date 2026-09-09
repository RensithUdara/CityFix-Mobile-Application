import { Text, View } from 'react-native';
import { FeaturePage, featureStyles as styles } from '../components/ui/FeaturePage';
import { useLiveDocument } from '../hooks/useLiveDocument';
import { useAuthStore } from '../store/authStore';
import { Icon } from '../components/ui/Icon';
import { colors } from '../theme';
const badges = [
  { id: 'first-step', name: 'First step', target: 1, metric: 'reports' },
  { id: 'local-observer', name: 'Local observer', target: 5, metric: 'reports' },
  { id: 'neighborhood-champion', name: 'Neighborhood champion', target: 20, metric: 'reports' },
  { id: 'positive-change', name: 'Positive change', target: 1, metric: 'resolved' },
  { id: 'lasting-impact', name: 'Lasting impact', target: 10, metric: 'resolved' },
] as const;
export type Achievements = { reports: number; resolved: number; points: number; badges: string[] };
export function BadgesScreen() {
  const uid = useAuthStore((s) => s.user?.uid);
  const { data, error } = useLiveDocument<Achievements>(
    uid ? `users/${uid}/achievements/summary` : null,
  );
  return (
    <FeaturePage
      title="Small acts. Lasting impact."
      subtitle="Your contributions make your neighborhood better."
      error={error}
    >
      <View style={[styles.card, { backgroundColor: colors.pale, alignItems: 'center' }]}>
        <Icon name="award" size={44} color={colors.primary} />
        <Text style={styles.metric}>{data?.points || 0} points</Text>
        <Text style={styles.body}>5 points per report · 10 extra when it is resolved</Text>
      </View>
      {badges.map((badge) => {
        const count = data?.[badge.metric] || 0;
        const earned = data?.badges.includes(badge.id);
        return (
          <View key={badge.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.title}>{badge.name}</Text>
              <Icon
                name={earned ? 'award' : 'lock'}
                color={earned ? colors.primary : colors.muted}
              />
            </View>
            <Text style={styles.body}>
              {earned ? 'Earned' : `${Math.min(count, badge.target)} / ${badge.target}`} ·{' '}
              {badge.target} {badge.metric === 'reports' ? 'reports submitted' : 'reports resolved'}
            </Text>
            <View style={{ height: 8, backgroundColor: colors.pale, borderRadius: 8 }}>
              <View
                style={{
                  height: 8,
                  width: `${Math.min(count / badge.target, 1) * 100}%`,
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                }}
              />
            </View>
          </View>
        );
      })}
      <Text style={styles.body}>
        Counts and badges are awarded by the server. Removed reports no longer count toward your
        contribution totals.
      </Text>
    </FeaturePage>
  );
}

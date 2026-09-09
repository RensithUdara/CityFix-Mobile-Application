import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { FeaturePage, featureStyles as styles } from '../components/ui/FeaturePage';
import { useLiveDocument } from '../hooks/useLiveDocument';
import { colors } from '../theme';
export type CommunityMetrics = {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  byDay: Record<string, number>;
  resolutionHours: number;
};
function Breakdown({ title, values }: { title: string; values: Record<string, number> }) {
  const max = Math.max(1, ...Object.values(values));
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {Object.entries(values).map(([name, count]) => (
        <View key={name} style={{ gap: 8 }}>
          <View style={styles.row}>
            <Text style={styles.body}>{name}</Text>
            <Text style={styles.title}>{count}</Text>
          </View>
          <View style={{ height: 9, backgroundColor: colors.pale, borderRadius: 8 }}>
            <View
              style={{
                height: 9,
                width: `${(count / max) * 100}%`,
                backgroundColor: colors.primary,
                borderRadius: 8,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
export function AnalyticsScreen() {
  const { data, error } = useLiveDocument<CommunityMetrics>('analytics/community');
  const [days, setDays] = useState(30);
  const resolved = data?.byStatus?.Resolved || 0;
  const cutoff = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);
  const trend = Object.fromEntries(
    Object.entries(data?.byDay || {})
      .filter(([date]) => date >= cutoff)
      .sort(([a], [b]) => a.localeCompare(b)),
  );
  return (
    <FeaturePage
      title="See the change taking shape"
      subtitle="Community reporting trends calculated on the server."
      error={error}
    >
      <View style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.metric}>{data?.total || 0}</Text>
            <Text style={styles.body}>Total reports</Text>
          </View>
          <View>
            <Text style={styles.metric}>
              {data?.total ? Math.round((resolved / data.total) * 100) : 0}%
            </Text>
            <Text style={styles.body}>Resolved</Text>
          </View>
        </View>
        <Text style={styles.body}>
          Average time to resolution:{' '}
          {resolved
            ? `${((data?.resolutionHours || 0) / resolved / 24).toFixed(1)} days`
            : 'No resolved reports yet'}
        </Text>
      </View>
      <Breakdown title="Progress by status" values={data?.byStatus || {}} />
      <Breakdown title="What needs attention" values={data?.byCategory || {}} />
      <Breakdown title="Severity distribution" values={data?.bySeverity || {}} />
      <View style={styles.row}>
        {[7, 30, 90].map((value) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            aria-selected={days === value}
            onPress={() => setDays(value)}
            style={{
              padding: 14,
              borderRadius: 12,
              backgroundColor: days === value ? colors.primary : colors.pale,
            }}
          >
            <Text style={{ color: days === value ? 'white' : colors.primary }}>
              Last {value} days
            </Text>
          </Pressable>
        ))}
      </View>
      <Breakdown title="Reports by day" values={trend} />
      {!data && (
        <Text style={styles.body}>
          Metrics will appear after the backend processes the first report.
        </Text>
      )}
    </FeaturePage>
  );
}

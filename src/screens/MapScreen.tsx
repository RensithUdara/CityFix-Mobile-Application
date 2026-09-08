import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { CategoryFilter } from '../components/issues/CategoryFilter';
import { StatusBadge } from '../components/issues/StatusBadge';
import { IssueMap } from '../components/map/IssueMap';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useIssueStore } from '../store/issueStore';
import { colors } from '../theme';
export function MapScreen() {
  const [category, setCategory] = useState('All issues');
  const [selectedId, setSelectedId] = useState<string>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const issues = useIssueStore((s) => s.issues).filter(
    (i) => category === 'All issues' || i.category === category,
  );
  const selected = issues.find((i) => i.id === selectedId) ?? issues[0];
  return (
    <Screen>
      <SectionHeader
        title="A neighborhood in focus"
        subtitle="Explore local reports and the places we can improve together."
      />
      <CategoryFilter value={category} onChange={setCategory} />
      <View style={styles.map}>
        <IssueMap issues={issues} selected={selected} onSelect={(i) => setSelectedId(i.id)} />
      </View>
      <Text style={styles.caption}>
        Select an issue below to locate it on the map. Map tiles require internet.
      </Text>
      {selected && (
        <View style={styles.selected}>
          <View style={{ gap: 10, flex: 1 }}>
            <StatusBadge status={selected.status} />
            <Text style={styles.title}>{selected.title}</Text>
            <Text style={styles.caption}>{selected.address}</Text>
          </View>
          <Button
            label="View issue"
            icon="arrow-up-right"
            onPress={() => navigation.navigate('IssueDetails', { id: selected.id })}
          />
        </View>
      )}
      <SectionHeader title="On the map" subtitle={`${issues.length} community reports`} />
      {issues.map((i) => (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: selected?.id === i.id }}
          key={i.id}
          onPress={() => setSelectedId(i.id)}
          style={[
            styles.row,
            selected?.id === i.id && { borderColor: colors.primary, backgroundColor: colors.pale },
          ]}
        >
          <View style={{ flex: 1, gap: 7 }}>
            <Text style={styles.title}>{i.title}</Text>
            <Text style={styles.caption}>{i.address}</Text>
          </View>
          <StatusBadge status={i.status} />
        </Pressable>
      ))}
      {issues.length === 0 && (
        <EmptyState
          title="Nothing here just yet"
          description="Choose another category to explore more reports."
        />
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  map: {
    height: 390,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.pale,
    borderWidth: 1,
    borderColor: colors.line,
  },
  caption: { fontSize: 12, lineHeight: 20, color: colors.muted },
  selected: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 22,
    borderRadius: 18,
    alignItems: 'center',
  },
  title: { color: colors.ink, fontWeight: '600', fontSize: 15 },
  row: {
    padding: 19,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});

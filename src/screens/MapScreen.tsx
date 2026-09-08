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
import { Field } from '../components/ui/Field';
import { MapCenter } from '../types/map';
import { currentLocation } from '../services/device';
import { errorMessage } from '../utils/errors';
import { reportReference } from '../utils/reference';
export function MapScreen() {
  const [category, setCategory] = useState('All issues');
  const [selectedId, setSelectedId] = useState<string>();
  const [center, setCenter] = useState<MapCenter>();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const locate = async () => { setLocating(true); setError(''); try { setCenter(await currentLocation()); } catch (e) { setError(errorMessage(e)); } finally { setLocating(false); } };
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const issues = useIssueStore((s) => s.issues).filter(
    (i) => (category === 'All issues' || i.category === category) && (status === 'All statuses' || i.status === status) && `${i.title} ${i.address} ${reportReference(i.id)}`.toLowerCase().includes(search.toLowerCase()),
  );
  const pinned = issues.filter(i => i.latitude != null && i.longitude != null);
  const selected = issues.find((i) => i.id === selectedId) ?? pinned[0];
  return (
    <Screen>
      <SectionHeader
        title="A neighborhood in focus"
        subtitle="Explore local reports and the places we can improve together."
      />
      <CategoryFilter value={category} onChange={setCategory} />
      <Field label="Search the map" value={search} onChangeText={setSearch} placeholder="Issue, street, or reference number" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <Button secondary label={locating ? 'Finding you…' : 'My location'} icon="navigation" disabled={locating} onPress={locate} />
        <Button secondary label={status} icon="sliders" onPress={() => setStatus(s => ['All statuses', 'Reported', 'In progress', 'Resolved'][(['All statuses', 'Reported', 'In progress', 'Resolved'].indexOf(s) + 1) % 4])} />
      </View>
      {!!error && <Text accessibilityRole="alert" style={{ color: colors.danger }}>{error}</Text>}
      <View style={styles.map}>
        <IssueMap issues={pinned} selected={selected} center={center} onSelect={(i) => { setSelectedId(i.id); setCenter(undefined); }} />
      </View>
      <Text style={styles.caption}>
        {pinned.length} reports with a map pin · {issues.length - pinned.length} address-only reports. Tap a pin or choose a report below.
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
      <SectionHeader title="Explore reports" subtitle={`${issues.length} matching community reports`} />
      {issues.map((i) => (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: selected?.id === i.id }}
          key={i.id}
          onPress={() => { setSelectedId(i.id); setCenter(undefined); }}
          style={[
            styles.row,
            selected?.id === i.id && { borderColor: colors.primary, backgroundColor: colors.pale },
          ]}
        >
          <View style={{ flex: 1, gap: 7 }}>
            <Text style={styles.title}>{i.title}</Text>
            <Text style={styles.caption}>{i.address}</Text>
            <Text style={styles.caption}>{i.latitude == null ? 'Address only · No GPS pin' : 'GPS location attached'}</Text>
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

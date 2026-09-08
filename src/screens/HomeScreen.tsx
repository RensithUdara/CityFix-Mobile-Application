import { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParams, TabParams } from '../navigation/types';
import { Screen } from '../components/ui/Screen';
import { HomeHeader } from '../components/home/HomeHeader';
import { CommunityHero } from '../components/home/CommunityHero';
import { CommunityStats } from '../components/home/CommunityStats';
import { SectionHeader } from '../components/ui/SectionHeader';
import { CategoryFilter } from '../components/issues/CategoryFilter';
import { IssueCard } from '../components/issues/IssueCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icon';
import { useIssueStore } from '../store/issueStore';
import { usePreferencesStore } from '../store/preferencesStore';
import { reportReference } from '../utils/reference';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { colors } from '../theme';
export function HomeScreen() {
  const navigation = useNavigation<
    NativeStackNavigationProp<RootStackParams> & BottomTabNavigationProp<TabParams>
  >();
  const issues = useIssueStore((s) => s.issues);
  const showResolved = usePreferencesStore((s) => s.showResolved);
  const [category, setCategory] = useState('All issues');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All statuses');
  const query = useDebouncedValue(search).toLowerCase();
  const { width } = useWindowDimensions();
  const columns = width > 950 ? 3 : width > 600 ? 2 : 1;
  const filtered = issues.filter(
    (i) =>
      (showResolved || status === 'Resolved' || i.status !== 'Resolved') &&
      (category === 'All issues' || i.category === category) &&
      (status === 'All statuses' || i.status === status) &&
      `${i.title} ${i.address} ${reportReference(i.id)}`.toLowerCase().includes(query),
  );
  return (
    <Screen scroll={false}>
      <FlatList
        key={columns}
        data={filtered}
        numColumns={columns}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(i) => i.id}
        columnWrapperStyle={columns > 1 ? { gap: 18 } : undefined}
        contentContainerStyle={{ gap: 18, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={{ flex: 1, maxWidth: columns === 1 ? '100%' : `${100 / columns}%` }}>
            <IssueCard
              issue={item}
              onPress={() => navigation.navigate('IssueDetails', { id: item.id })}
            />
          </View>
        )}
        ListHeaderComponent={
          <View style={{ gap: 25 }}>
            <HomeHeader
              onNotifications={() => navigation.navigate('Notifications')}
              onProfile={() => navigation.navigate('Profile')}
            />
            <CommunityHero onReport={() => navigation.navigate('Report')} />
            <CommunityStats issues={issues} />
            <SectionHeader
              title="Around your neighborhood"
              subtitle="Local issues. Collective action. Real change."
            />
            <View style={styles.tools}>
              <View style={styles.search}>
                <Icon name="search" size={17} color={colors.muted} />
                <TextInput
                  accessibilityLabel="Search issues"
                  placeholder="Search issues or a street..."
                  placeholderTextColor={colors.muted}
                  value={search}
                  onChangeText={setSearch}
                  style={styles.input}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setStatus(
                    (s) =>
                      ['All statuses', 'Reported', 'In progress', 'Resolved'][
                        (['All statuses', 'Reported', 'In progress', 'Resolved'].indexOf(s) + 1) % 4
                      ],
                  )
                }
                style={styles.control}
              >
                <Icon name="sliders" size={16} />
                <Text style={styles.controlText}>{status}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('Explore')}
                style={styles.control}
              >
                <Icon name="map" size={16} />
                <Text style={styles.controlText}>Map view</Text>
              </Pressable>
            </View>
            <CategoryFilter value={category} onChange={setCategory} />
            <View style={styles.result}>
              <Text style={styles.caption}>{filtered.length} issues in your community</Text>
              <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                <View style={styles.live} />
                <Text style={styles.caption}>Community reports</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="A fresh perspective"
            description="No issues match these filters. Try a different category or search."
          />
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Icon name="heart" size={14} color={colors.primary} />
            <Text style={styles.caption}>A little more care. A better place to call home.</Text>
          </View>
        }
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  tools: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  search: {
    flex: 1,
    minWidth: 180,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 12, color: colors.ink },
  control: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.line,
  },
  controlText: { fontSize: 11, color: colors.ink, fontWeight: '600' },
  result: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  caption: { fontSize: 11, color: colors.muted },
  live: { height: 5, width: 5, borderRadius: 5, backgroundColor: '#86A16B' },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 25,
  },
});

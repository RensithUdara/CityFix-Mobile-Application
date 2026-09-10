import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { FeaturePage } from '../components/ui/FeaturePage';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { CategoryFilter } from '../components/issues/CategoryFilter';
import { IssueCard } from '../components/issues/IssueCard';
import { callBackend } from '../services/backend';
import { Issue } from '../types/issue';
import { colors } from '../theme';
export function SearchScreen({ navigation }: NativeStackScreenProps<RootStackParams, 'Search'>) {
  const [filters, setFilters] = useState({
    query: '',
    category: 'All issues',
    status: '',
    severity: '',
    since: '',
    until: '',
  });
  const [items, setItems] = useState<Issue[]>([]),
    [cursor, setCursor] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [searched, setSearched] = useState(false),
    [sort, setSort] = useState(false);
  const lastFilters = useRef(filters);
  async function search(next = false) {
    setBusy(true);
    setError('');
    const f = next ? lastFilters.current : filters;
    if (!next) lastFilters.current = f;
    try {
      const result = await callBackend<{ items: Issue[]; nextCursor: string | null }>(
        'searchIssues',
        {
          ...f,
          category: f.category === 'All issues' ? '' : f.category,
          cursor: next ? cursor : '',
        },
      );
      setItems((old) => (next ? [...old, ...result.items] : result.items));
      setCursor(result.nextCursor);
      setSearched(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const results = sort ? [...items].sort((a, b) => b.confirmations - a.confirmations) : items;
  return (
    <FeaturePage
      title="Find what matters nearby"
      subtitle="Search all reports by words, reference, category, status, priority, and dates."
      error={error}
    >
      <Field
        label="Search all reports"
        value={filters.query}
        onChangeText={(query) => setFilters({ ...filters, query })}
        placeholder="Title, street, description, or CF-reference"
      />
      <CategoryFilter
        value={filters.category}
        onChange={(category) => setFilters({ ...filters, category })}
      />
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        {(['status', 'severity'] as const).map((key) => {
          const choices =
            key === 'status'
              ? ['', 'Reported', 'In progress', 'Resolved']
              : ['', 'Low', 'Medium', 'High'];
          return (
            <Button
              key={key}
              secondary
              label={filters[key] || `All ${key}`}
              onPress={() =>
                setFilters({
                  ...filters,
                  [key]: choices[(choices.indexOf(filters[key]) + 1) % choices.length],
                })
              }
            />
          );
        })}
      </View>
      <Field
        label="From date (YYYY-MM-DD)"
        value={filters.since}
        onChangeText={(since) => setFilters({ ...filters, since })}
        placeholder="2026-01-01"
      />
      <Field
        label="To date (YYYY-MM-DD)"
        value={filters.until}
        onChangeText={(until) => setFilters({ ...filters, until })}
        placeholder="2026-12-31"
      />
      <Button
        label={busy ? 'Searching…' : 'Search reports'}
        disabled={busy}
        onPress={() => void search()}
      />
      <Button
        secondary
        label={sort ? 'Sort: most confirmed' : 'Sort: newest'}
        onPress={() => setSort(!sort)}
      />
      <Text style={{ color: colors.muted }}>
        {items.length} matches found{cursor ? ' · More reports available to search' : ''}. Sorting
        applies to fetched matches.
      </Text>
      {results.map((issue) => (
        <IssueCard
          key={issue.id}
          issue={issue}
          onPress={() => navigation.navigate('IssueDetails', { id: issue.id })}
        />
      ))}
      {searched && !items.length && <Text>No matching reports in the pages searched.</Text>}
      {cursor && (
        <Button
          secondary
          disabled={busy}
          label="Search more reports"
          onPress={() => void search(true)}
        />
      )}
    </FeaturePage>
  );
}

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { IssueCard } from '../components/issues/IssueCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { useIssueStore } from '../store/issueStore';
import { colors } from '../theme';
export function ActivityScreen() {
  const [tab, setTab] = useState('My reports');
  const { issues, followed } = useIssueStore();
  const filtered = issues.filter((i) => (tab === 'My reports' ? i.mine : followed.includes(i.id)));
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  return (
    <Screen>
      <SectionHeader
        title="Your little acts of good"
        subtitle="Keep track of the changes you’re helping make."
      />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {['My reports', 'Following'].map((t) => (
          <Pressable
            key={t}
            accessibilityRole="button"
            accessibilityState={{ selected: tab === t }}
            onPress={() => setTab(t)}
            style={{
              padding: 15,
              borderRadius: 12,
              backgroundColor: tab === t ? colors.primary : colors.pale,
            }}
          >
            <Text style={{ color: tab === t ? 'white' : colors.primary, fontWeight: '600' }}>
              {t}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={{ maxWidth: 650, width: '100%', alignSelf: 'center', gap: 18 }}>
        {filtered.map((i) => (
          <IssueCard
            key={i.id}
            issue={i}
            onPress={() => navigation.navigate('IssueDetails', { id: i.id })}
          />
        ))}
        {!filtered.length && (
          <EmptyState
            title={
              tab === 'My reports'
                ? 'Your first good deed starts here'
                : 'Keep an eye on what matters'
            }
            description={
              tab === 'My reports'
                ? 'Spotted something that needs attention? Your report can help.'
                : 'Follow an issue from its details page and find it here.'
            }
          />
        )}
        <Button label="Report an issue" icon="plus" onPress={() => navigation.navigate('Report')} />
      </View>
    </Screen>
  );
}

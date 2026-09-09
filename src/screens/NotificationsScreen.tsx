import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { collection, doc, limit, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { firebase } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import { FeaturePage, featureStyles as styles } from '../components/ui/FeaturePage';
import { Button } from '../components/ui/Button';
import { colors } from '../theme';
import { errorMessage } from '../utils/errors';
type InboxItem = { id: string; issueId: string; title: string; body: string; read: boolean };
export function NotificationsScreen() {
  const uid = useAuthStore((s) => s.user?.uid);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const [items, setItems] = useState<InboxItem[]>([]),
    [error, setError] = useState('');
  useEffect(
    () =>
      uid
        ? onSnapshot(
            query(
              collection(firebase().firestore, 'users', uid, 'notifications'),
              orderBy('createdAt', 'desc'),
              limit(100),
            ),
            (snap) => setItems(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as InboxItem)),
            (e) => setError(errorMessage(e)),
          )
        : undefined,
    [uid],
  );
  const open = async (item: InboxItem) => {
    try {
      await updateDoc(doc(firebase().firestore, 'users', uid!, 'notifications', item.id), {
        read: true,
      });
      navigation.navigate('IssueDetails', { id: item.issueId });
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  return (
    <FeaturePage
      title="Your community updates"
      subtitle={items.filter((i) => !i.read).length + ' unread updates ? Latest 100 notifications'}
      error={error}
    >
      <View style={{ gap: 10 }}>
        <Button
          secondary
          label="Push notification settings"
          icon="bell"
          onPress={() => navigation.navigate('PushSettings')}
        />
        <Button
          secondary
          label="Manage issue subscriptions"
          icon="bookmark"
          onPress={() => navigation.navigate('Subscriptions')}
        />
      </View>
      {items.map((item) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={item.title}
          onPress={() => void open(item)}
          style={[styles.card, !item.read && { borderColor: colors.primary }]}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.body}>{item.read ? 'Read' : 'New'}</Text>
        </Pressable>
      ))}
      {!items.length && (
        <View style={styles.card}>
          <Text style={styles.title}>You?re all caught up</Text>
          <Text style={styles.body}>
            Follow reports and choose your subscription preferences to receive updates here.
          </Text>
        </View>
      )}
    </FeaturePage>
  );
}

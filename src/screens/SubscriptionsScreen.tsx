import { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { firebase } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import { useIssueStore } from '../store/issueStore';
import { saveSubscription, SubscriptionOptions } from '../services/subscriptions';
import { FeaturePage, featureStyles as styles } from '../components/ui/FeaturePage';
import { Button } from '../components/ui/Button';
import { errorMessage } from '../utils/errors';
export function SubscriptionsScreen() {
  const uid = useAuthStore((s) => s.user?.uid);
  const issues = useIssueStore((s) => s.issues);
  const [items, setItems] = useState<SubscriptionOptions[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(
    () =>
      uid
        ? onSnapshot(
            collection(firebase().firestore, 'users', uid, 'follows'),
            (snap) =>
              setItems(
                snap.docs.map((d) => ({
                  issueId: d.id,
                  statusUpdates: d.data().statusUpdates !== false,
                  commentUpdates: d.data().commentUpdates === true,
                })),
              ),
            (e) => setError(errorMessage(e)),
          )
        : undefined,
    [uid],
  );
  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <FeaturePage
      title="Stay close to what matters"
      subtitle="Choose updates for each issue you follow. Push uses these same preferences."
      error={error}
    >
      {!items.length && (
        <Text style={styles.body}>Follow an issue to manage its updates here.</Text>
      )}
      {items.map((item) => (
        <View key={item.issueId} style={styles.card}>
          <Text style={styles.title}>
            {issues.find((i) => i.id === item.issueId)?.title || `CF-${item.issueId}`}
          </Text>
          <View style={styles.row}>
            <Text style={styles.body}>Status changes</Text>
            <Switch
              accessibilityLabel={`Status updates ${item.issueId}`}
              value={item.statusUpdates}
              disabled={busy}
              onValueChange={(value) =>
                void act(() => saveSubscription({ ...item, statusUpdates: value }))
              }
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.body}>New comments</Text>
            <Switch
              accessibilityLabel={`Comment updates ${item.issueId}`}
              value={item.commentUpdates}
              disabled={busy}
              onValueChange={(value) =>
                void act(() => saveSubscription({ ...item, commentUpdates: value }))
              }
            />
          </View>
          <Button
            secondary
            label="Unsubscribe"
            disabled={busy}
            onPress={() =>
              void act(() =>
                deleteDoc(doc(firebase().firestore, 'users', uid!, 'follows', item.issueId)),
              )
            }
          />
        </View>
      ))}
    </FeaturePage>
  );
}

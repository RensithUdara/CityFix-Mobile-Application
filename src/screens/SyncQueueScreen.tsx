import { useState } from 'react';
import { Text, View } from 'react-native';
import { FeaturePage, featureStyles as styles } from '../components/ui/FeaturePage';
import { Button } from '../components/ui/Button';
import { useQueueStore } from '../store/queueStore';
import { discardQueuedReport, retryQueuedReport, syncPendingReports } from '../services/syncQueue';
import { reportReference } from '../utils/reference';
import { errorMessage } from '../utils/errors';
export function SyncQueueScreen() {
  const { entries, online, syncing, error } = useQueueStore();
  const [message, setMessage] = useState('');
  const act = async (action: () => Promise<unknown>) => {
    try {
      setMessage('');
      await action();
    } catch (e) {
      setMessage(errorMessage(e));
    }
  };
  return (
    <FeaturePage
      title="Your reports, safely waiting"
      subtitle={
        online
          ? 'Connected · Uploads resume automatically while the app is open.'
          : 'Offline · Your reports and photos are saved on this device.'
      }
      error={message || error}
    >
      <Button
        label={syncing ? 'Syncing…' : 'Sync now'}
        icon="refresh-cw"
        disabled={!online || syncing}
        onPress={() => void act(() => syncPendingReports())}
      />
      {!entries.length && (
        <View style={styles.card}>
          <Text style={styles.title}>All uploads are complete</Text>
          <Text style={styles.body}>
            New reports are saved here before uploading. Submitted reports appear in My activity.
          </Text>
        </View>
      )}
      {entries.map((entry) => (
        <View key={entry.id} style={styles.card}>
          <Text style={styles.title}>{entry.input.title}</Text>
          <Text selectable style={styles.body}>
            {reportReference(entry.id)}
          </Text>
          <Text style={styles.body}>
            {entry.state === 'uploading'
              ? 'Uploading photos and report…'
              : entry.attempts >= 5
                ? 'Needs your attention'
                : entry.state === 'failed'
                  ? 'Waiting to retry'
                  : 'Pending upload'}{' '}
            · {entry.input.photos.length} photos
          </Text>
          {!!entry.error && <Text style={styles.body}>{entry.error}</Text>}
          <Button
            secondary
            label="Retry upload"
            disabled={!online || entry.state === 'uploading'}
            onPress={() => void act(() => retryQueuedReport(entry.id))}
          />
          <Button
            secondary
            label="Remove draft"
            disabled={entry.state === 'uploading'}
            onPress={() => void act(() => discardQueuedReport(entry.id))}
          />
        </View>
      ))}
    </FeaturePage>
  );
}

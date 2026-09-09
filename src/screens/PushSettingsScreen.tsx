import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { FeaturePage, featureStyles as styles } from '../components/ui/FeaturePage';
import { Button } from '../components/ui/Button';
import { enablePush, disablePush, pushEnabled } from '../services/push';
import { errorMessage } from '../utils/errors';
export function PushSettingsScreen() {
  const [enabled, setEnabled] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  useEffect(() => {
    void pushEnabled()
      .then(setEnabled)
      .catch((e) => setError(errorMessage(e)));
  }, []);
  const toggle = async () => {
    setBusy(true);
    setError('');
    try {
      if (enabled) await disablePush();
      else await enablePush();
      setEnabled(!enabled);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <FeaturePage
      title="Good updates, wherever you are"
      subtitle="Receive status changes and comments for your subscribed issues."
      error={error}
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          {enabled ? 'Push is enabled on this device' : 'Push is off on this device'}
        </Text>
        <Text style={styles.body}>
          You choose which updates to receive in Issue subscriptions. Your notification inbox
          remains available with push turned off.
        </Text>
        <Button
          label={
            busy
              ? 'Updating…'
              : enabled
                ? 'Disable push notifications'
                : 'Enable push notifications'
          }
          icon="bell"
          disabled={busy}
          onPress={() => void toggle()}
        />
      </View>
    </FeaturePage>
  );
}

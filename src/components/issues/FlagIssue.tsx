import { useState } from 'react';
import { Text, View } from 'react-native';
import { Field } from '../ui/Field';
import { Button } from '../ui/Button';
import { featureStyles as styles } from '../ui/FeaturePage';
import { callBackend } from '../../services/backend';
import { errorMessage } from '../../utils/errors';
export function FlagIssue({ issueId }: { issueId: string }) {
  const [open, setOpen] = useState(false),
    [reason, setReason] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    setMessage('');
    try {
      await callBackend('flagIssue', { issueId, reason });
      setMessage('Your flag was sent for moderator review.');
      setReason('');
      setOpen(false);
    } catch (e) {
      setMessage(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={{ gap: 14 }}>
      <Button
        secondary
        label={open ? 'Cancel flag' : 'Flag inappropriate report'}
        icon="flag"
        onPress={() => setOpen(!open)}
      />
      {open && (
        <>
          <Field
            label="Why should this report be reviewed?"
            value={reason}
            onChangeText={setReason}
            multiline
            maxLength={1000}
          />
          <Button
            label="Send to moderators"
            disabled={busy || reason.trim().length < 10}
            onPress={() => void submit()}
          />
        </>
      )}
      {!!message && (
        <Text accessibilityRole="alert" style={styles.body}>
          {message}
        </Text>
      )}
    </View>
  );
}

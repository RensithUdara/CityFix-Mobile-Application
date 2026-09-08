import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import {
  subscribeSupportRequests,
  submitSupportRequest,
  SupportRequest,
} from '../services/support';
import { errorMessage } from '../utils/errors';
import { colors } from '../theme';
export function HelpSupportScreen() {
  const user = useAuthStore((s) => s.user);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  useEffect(
    () =>
      user
        ? subscribeSupportRequests(user.uid, setRequests, (e) => setFeedback(errorMessage(e)))
        : undefined,
    [user?.uid],
  );
  const submit = async () => {
    if (subject.trim().length < 3 || message.trim().length < 10) {
      setFeedback('Add a subject of at least 3 characters and a message of at least 10.');
      return;
    }
    setBusy(true);
    setFeedback('');
    try {
      await submitSupportRequest(subject, message);
      setSubject('');
      setMessage('');
      setFeedback('Your request was submitted. You can find it below.');
    } catch (e) {
      setFeedback(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen>
      <View style={{ maxWidth: 680, width: '100%', alignSelf: 'center', gap: 24 }}>
        <SectionHeader
          title="We’re listening"
          subtitle="Ask a question, report an app problem, or share an idea."
        />
        <View style={{ backgroundColor: colors.pale, borderRadius: 19, padding: 20 }}>
          <Text style={{ color: colors.primary, fontSize: 13, lineHeight: 23 }}>
            For a neighborhood issue, use Report an issue. This form is for app support and privacy
            requests. Never include your password.
          </Text>
        </View>
        <Field
          label="Subject"
          value={subject}
          onChangeText={setSubject}
          maxLength={100}
          placeholder="What can we help with?"
        />
        <Field
          label="Your message"
          value={message}
          onChangeText={setMessage}
          maxLength={3000}
          multiline
          placeholder="Tell us what happened and what you expected…"
        />
        {!!feedback && (
          <Text accessibilityRole="alert" style={{ color: colors.primary, lineHeight: 22 }}>
            {feedback}
          </Text>
        )}
        <Button
          label={busy ? 'Sending…' : 'Submit support request'}
          icon="send"
          onPress={submit}
          disabled={busy}
        />
        <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 19 }}>
          Requests are stored for administrator review. A response time is not guaranteed.
        </Text>
        <SectionHeader title="Your requests" subtitle={`${requests.length} submitted`} />
        {requests.map((request) => (
          <View
            key={request.id}
            style={{
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: colors.line,
              borderRadius: 18,
              padding: 20,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <Text style={{ flex: 1, fontWeight: '700', color: colors.ink }}>
                {request.subject}
              </Text>
              <Text style={{ fontSize: 11, color: colors.primary }}>{request.status}</Text>
            </View>
            <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 23 }}>
              {request.message}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

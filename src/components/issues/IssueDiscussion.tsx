import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { Pressable, Text, View } from 'react-native';
import { firebase } from '../../config/firebase';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme';
import { errorMessage } from '../../utils/errors';
import { initials, relativeDate } from '../../utils/format';
import { Field } from '../ui/Field';
import { Button } from '../ui/Button';
import { SectionHeader } from '../ui/SectionHeader';
type Comment = { id: string; authorId: string; authorName: string; body: string; createdAt: string };
export function IssueDiscussion({ issueId }: { issueId: string }) {
  const { user, profile } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => onSnapshot(query(collection(firebase().firestore, 'issues', issueId, 'comments'), orderBy('createdAt', 'asc')), snapshot => setComments(snapshot.docs.map(d => ({ ...d.data(), id: d.id, createdAt: d.data().createdAt?.toDate?.().toISOString() ?? new Date().toISOString() } as Comment))), e => setError(errorMessage(e))), [issueId]);
  const post = async () => { if (!user || body.trim().length < 2) { setError('Write a comment of at least 2 characters.'); return; } setBusy(true); setError(''); try { await addDoc(collection(firebase().firestore, 'issues', issueId, 'comments'), { authorId: user.uid, authorName: profile?.displayName || user.displayName || 'Community member', body: body.trim(), createdAt: serverTimestamp() }); setBody(''); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } };
  return <View style={{ gap: 18 }}><SectionHeader title="Neighborhood conversation" subtitle={`${comments.length} comments · Helpful details make a difference`} />{comments.map(comment => <View key={comment.id} style={{ padding: 18, borderRadius: 16, backgroundColor: 'white', borderWidth: 1, borderColor: colors.line, gap: 12 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={{ backgroundColor: colors.pale, padding: 10, borderRadius: 16 }}><Text style={{ color: colors.primary, fontWeight: '700' }}>{initials(comment.authorName)}</Text></View><View style={{ flex: 1 }}><Text style={{ color: colors.ink, fontWeight: '700', fontSize: 13 }}>{comment.authorName}</Text><Text style={{ color: colors.muted, fontSize: 11 }}>{relativeDate(comment.createdAt)}</Text></View>{comment.authorId === user?.uid && <Pressable accessibilityRole="button" accessibilityLabel="Delete my comment" onPress={() => deleteDoc(doc(firebase().firestore, 'issues', issueId, 'comments', comment.id)).catch(e => setError(errorMessage(e)))} style={{ padding: 8 }}><Text style={{ color: colors.danger, fontSize: 11 }}>Delete</Text></Pressable>}</View><Text style={{ color: colors.ink, lineHeight: 22, fontSize: 13 }}>{comment.body}</Text></View>)}<Field label="Add a comment" value={body} onChangeText={setBody} multiline maxLength={1000} placeholder="Share a useful detail or a recent observation…" /><Text style={{ fontSize: 11, color: colors.muted }}>Your profile name is shown with your comment. Keep personal details private.</Text>{!!error && <Text accessibilityRole="alert" style={{ color: colors.danger }}>{error}</Text>}<Button label={busy ? 'Posting…' : 'Post comment'} icon="message-circle" onPress={post} disabled={busy} /></View>;
}

import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme';
export function Screen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>{scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>{children}</ScrollView> : <View style={[styles.content, { flex: 1 }]}>{children}</View>}</SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, content: { width: '100%', maxWidth: 1180, alignSelf: 'center', padding: 24, paddingBottom: 40, gap: 24 } });

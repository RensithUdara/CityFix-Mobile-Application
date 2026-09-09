import { Modal, StyleSheet, Text, View } from 'react-native';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { colors } from '../../theme';
import { reportReference } from '../../utils/reference';
export function ReportSuccess({ id, onView }: { id: string | null; onView: () => void }) {
  return (
    <Modal visible={!!id} transparent animationType="fade" onRequestClose={onView}>
      <View style={styles.backdrop}>
        <View accessibilityViewIsModal style={styles.card}>
          <View style={styles.icon}>
            <Icon name="check" size={38} color={colors.primary} />
          </View>
          <Text accessibilityRole="header" style={styles.title}>
            Report submitted!
          </Text>
          <Text style={styles.body}>
            Thank you for helping your neighborhood. Your photos and report have been saved
            successfully.
          </Text>
          <View style={styles.reference}>
            <Text style={styles.label}>YOUR REFERENCE NUMBER</Text>
            <Text selectable style={styles.number}>
              {id ? reportReference(id) : ''}
            </Text>
          </View>
          <Text style={styles.body}>
            Keep this reference to find your report or include it in a support request.
          </Text>
          <Button label="View my report" icon="arrow-right" onPress={onView} />
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#10251F99', justifyContent: 'center', padding: 24 },
  card: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 440,
    padding: 26,
    backgroundColor: 'white',
    borderRadius: 28,
    gap: 20,
  },
  icon: { alignSelf: 'center', padding: 20, backgroundColor: colors.pale, borderRadius: 50 },
  title: { textAlign: 'center', fontSize: 26, fontWeight: '800', color: colors.ink },
  body: { textAlign: 'center', color: colors.muted, fontSize: 13, lineHeight: 22 },
  reference: { backgroundColor: colors.pale, borderRadius: 15, padding: 18, gap: 10 },
  label: { textAlign: 'center', color: colors.primary, fontSize: 10, letterSpacing: 1 },
  number: { textAlign: 'center', color: colors.ink, fontWeight: '700', fontSize: 16 },
});

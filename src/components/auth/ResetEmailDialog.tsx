import { Modal, ScrollView, Text, View } from 'react-native';
import { colors } from '../../theme';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

export function ResetEmailDialog({
  email,
  onClose,
  onSignIn,
}: {
  email: string;
  onClose: () => void;
  onSignIn: () => void;
}) {
  return (
    <Modal visible={!!email} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{ flex: 1, backgroundColor: '#10251F99', justifyContent: 'center', padding: 24 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View
            accessibilityViewIsModal
            style={{
              width: '100%',
              maxWidth: 420,
              alignSelf: 'center',
              backgroundColor: colors.surface,
              borderRadius: 26,
              padding: 26,
              gap: 20,
            }}
          >
            <View
              style={{
                alignSelf: 'center',
                padding: 18,
                borderRadius: 40,
                backgroundColor: colors.pale,
              }}
            >
              <Icon name="mail" size={30} color={colors.primary} />
            </View>
            <Text
              accessibilityRole="header"
              style={{ fontSize: 25, fontWeight: '800', color: colors.ink, textAlign: 'center' }}
            >
              Check your inbox
            </Text>
            <Text style={{ color: colors.muted, textAlign: 'center', lineHeight: 23 }}>
              If an account exists for {email}, a password reset link will arrive shortly. Check
              your spam folder too.
            </Text>
            <Button label="Back to sign in" onPress={onSignIn} />
            <Button secondary label="Done" onPress={onClose} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

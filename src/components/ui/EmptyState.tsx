import { Text, View } from 'react-native';
import { colors } from '../../theme';
import { Icon } from './Icon';
export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <View
      style={{
        padding: 40,
        alignItems: 'center',
        gap: 12,
        backgroundColor: colors.pale,
        borderRadius: 20,
      }}
    >
      <Icon name="inbox" size={32} color={colors.primary} />
      <Text style={{ color: colors.ink, fontSize: 18, fontWeight: '700' }}>{title}</Text>
      <Text style={{ color: colors.muted, textAlign: 'center', lineHeight: 22 }}>
        {description}
      </Text>
    </View>
  );
}

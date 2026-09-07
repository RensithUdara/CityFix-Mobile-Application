import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { categories, Category } from '../../types/issue';
import { colors } from '../../theme';
import { Icon, IconName } from '../ui/Icon';
export const categoryIcons: Record<string, IconName> = { 'All issues': 'grid', Roads: 'map', Lighting: 'sun', Waste: 'trash-2', Water: 'droplet', 'Public spaces': 'feather' };
export function CategoryFilter({ value, onChange, all = true }: { value: string; onChange: (value: Category | 'All issues') => void; all?: boolean }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>{categories.filter((c) => all || c !== 'All issues').map((category) => <Pressable accessibilityRole="button" accessibilityState={{ selected: value === category }} key={category} onPress={() => onChange(category)} style={[styles.chip, value === category && styles.active]}><Icon name={categoryIcons[category]} size={16} color={value === category ? 'white' : colors.muted} /><Text style={[styles.text, value === category && { color: 'white' }]}>{category}</Text></Pressable>)}</ScrollView>;
}
const styles = StyleSheet.create({ chip: { paddingVertical: 12, paddingHorizontal: 17, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', gap: 8 }, active: { backgroundColor: colors.primary, borderColor: colors.primary }, text: { color: colors.muted, fontSize: 12, fontWeight: '600' } });

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { faqs } from '../data/help';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Field } from '../components/ui/Field';
import { Icon } from '../components/ui/Icon';
import { EmptyState } from '../components/ui/EmptyState';
import { colors } from '../theme';
export function FAQScreen() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const filtered = faqs.filter((item) =>
    `${item.question} ${item.answer} ${item.category}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <Screen>
      <View style={{ width: '100%', maxWidth: 740, alignSelf: 'center', gap: 22 }}>
        <SectionHeader
          title="A helping hand"
          subtitle="Everything you need to get a little more from CityFix."
        />
        <Field
          label="Search questions"
          placeholder="Try photos, privacy, or password…"
          value={search}
          onChangeText={setSearch}
        />
        {filtered.map((item) => (
          <View
            key={item.question}
            style={{
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: colors.line,
              borderRadius: 18,
              overflow: 'hidden',
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: open === item.question }}
              aria-expanded={open === item.question}
              onPress={() => setOpen(open === item.question ? null : item.question)}
              style={{ padding: 20, flexDirection: 'row', gap: 12, alignItems: 'center' }}
            >
              <View style={{ flex: 1, gap: 7 }}>
                <Text
                  style={{
                    fontSize: 9,
                    color: colors.primary,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  {item.category}
                </Text>
                <Text style={{ fontWeight: '700', color: colors.ink, fontSize: 14 }}>
                  {item.question}
                </Text>
              </View>
              <Icon
                name={open === item.question ? 'minus' : 'plus'}
                size={18}
                color={colors.primary}
              />
            </Pressable>
            {open === item.question && (
              <Text
                style={{
                  padding: 20,
                  paddingTop: 0,
                  color: colors.muted,
                  fontSize: 13,
                  lineHeight: 24,
                }}
              >
                {item.answer}
              </Text>
            )}
          </View>
        ))}
        {!filtered.length && (
          <EmptyState
            title="No matching questions"
            description="Try another keyword, or send a question through Help & feedback."
          />
        )}
      </View>
    </Screen>
  );
}

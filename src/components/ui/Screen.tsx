import { DataState } from './DataState';
import { PropsWithChildren, createContext, useCallback, useEffect, useRef } from 'react';
import { Keyboard, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme';
export const FieldFocusContext = createContext<() => void>(() => {});
export function Screen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  const scrollRef = useRef<ScrollView>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const revealFocusedField = useCallback(() => {
    if (Platform.OS === 'web') return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const input = TextInput.State.currentlyFocusedInput();
      if (input && Keyboard.isVisible())
        scrollRef.current?.scrollResponderScrollNativeHandleToKeyboard(input, 24, true);
    }, 100);
  }, []);
  useEffect(() => {
    const listener = Keyboard.addListener('keyboardDidShow', revealFocusedField);
    return () => {
      listener.remove();
      clearTimeout(timer.current);
    };
  }, [revealFocusedField]);
  return (
    <FieldFocusContext.Provider value={revealFocusedField}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
        {scroll ? (
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            automaticallyAdjustKeyboardInsets
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            <DataState />
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, { flex: 1 }]}>
            <DataState />
            {children}
          </View>
        )}
      </SafeAreaView>
    </FieldFocusContext.Provider>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    padding: 24,
    paddingBottom: 40,
    gap: 24,
  },
});

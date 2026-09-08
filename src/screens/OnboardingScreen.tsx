import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { onboardingPages } from '../data/onboarding';
import { OnboardingArtwork } from '../components/onboarding/OnboardingArtwork';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { colors } from '../theme';
export function OnboardingScreen({
  onComplete,
  error,
}: {
  onComplete: () => Promise<void>;
  error: string;
}) {
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const { width } = useWindowDimensions();
  const page = onboardingPages[index];
  const wide = width >= 800;
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active) setReduceMotion(value);
    });
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      active = false;
      listener.remove();
    };
  }, []);
  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (index > 0) {
        setIndex(index - 1);
        return true;
      }
      return false;
    });
    return () => listener.remove();
  }, [index]);
  useEffect(() => {
    opacity.setValue(reduceMotion ? 1 : 0);
    const animation = Animated.timing(opacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [index, opacity, reduceMotion]);
  const finish = async () => {
    setBusy(true);
    try {
      await onComplete();
    } finally {
      setBusy(false);
    }
  };
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.wordmark}>Welcome to CityFix</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            disabled={busy}
            onPress={finish}
            style={styles.skip}
          >
            <Text style={styles.skipText}>Skip</Text>
            <Icon name="arrow-right" size={15} color={colors.muted} />
          </Pressable>
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            testID="onboarding-content"
            style={[
              styles.body,
              { opacity, flexDirection: wide ? 'row' : 'column', gap: wide ? 52 : 27 },
            ]}
          >
            <View style={{ flex: wide ? 1 : undefined, width: wide ? undefined : '100%' }}>
              <OnboardingArtwork page={page} compact={!wide} />
            </View>
            <View style={{ flex: wide ? 1 : undefined, gap: 19, width: wide ? undefined : '100%' }}>
              <Text style={[styles.eyebrow, { color: page.accent }]}>{page.eyebrow}</Text>
              <Text
                accessibilityRole="header"
                accessibilityLiveRegion="polite"
                style={[styles.title, { fontSize: wide ? 42 : 33 }]}
              >
                {page.title}
                {'\n'}
                <Text style={{ color: page.accent }}>{page.highlight}</Text>
              </Text>
              <Text style={styles.description}>{page.description}</Text>
              <View style={styles.steps}>
                {page.steps.map((step, i) => (
                  <View key={step} style={styles.step}>
                    <View style={[styles.stepNumber, { backgroundColor: page.background }]}>
                      <Text style={{ color: page.accent, fontSize: 11, fontWeight: '700' }}>
                        {index === 1 && i === 2 ? '✓' : i + 1}
                      </Text>
                    </View>
                    <Text style={styles.stepLabel}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        </ScrollView>
        <View style={styles.bottom}>
          <View accessibilityLabel={`Onboarding page ${index + 1} of 3`} style={styles.dots}>
            {onboardingPages.map((_, i) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Go to onboarding page ${i + 1}`}
                accessibilityState={{ selected: index === i }}
                key={i}
                onPress={() => setIndex(i)}
                style={styles.dotTarget}
              >
                <View
                  style={{
                    width: index === i ? 26 : 7,
                    height: 7,
                    borderRadius: 7,
                    backgroundColor: index === i ? page.accent : colors.line,
                  }}
                />
              </Pressable>
            ))}
          </View>
          {!!error && (
            <Text accessibilityRole="alert" style={{ color: colors.danger, textAlign: 'center' }}>
              {error}
            </Text>
          )}
          <View style={styles.controls}>
            {index > 0 && (
              <Button secondary label="Back" onPress={() => setIndex(index - 1)} disabled={busy} />
            )}
            <View style={{ flex: 1 }}>
              <Button
                label={busy ? 'Please wait…' : index === 2 ? 'Get started' : 'Continue'}
                icon="arrow-right"
                disabled={busy}
                onPress={() => (index === 2 ? void finish() : setIndex(index + 1))}
              />
            </View>
          </View>
          <Text style={styles.caption}>REPORT · TRACK · BUILD A BETTER CITY</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 1060,
    alignSelf: 'center',
    paddingHorizontal: 26,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 24,
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { fontSize: 13, fontWeight: '700', color: colors.ink },
  skip: { padding: 12, flexDirection: 'row', gap: 7, alignItems: 'center' },
  skipText: { fontSize: 12, color: colors.muted },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  title: { fontWeight: '800', letterSpacing: -1.4, lineHeight: 44, color: colors.ink },
  description: { fontSize: 14, color: colors.muted, lineHeight: 24 },
  steps: { gap: 10 },
  step: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  stepNumber: {
    height: 25,
    width: 25,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: { color: colors.ink, fontSize: 12 },
  bottom: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: 14 },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  dotTarget: { minHeight: 32, minWidth: 30, alignItems: 'center', justifyContent: 'center' },
  controls: { flexDirection: 'row', gap: 12 },
  caption: { fontSize: 8, color: colors.muted, letterSpacing: 1.4, textAlign: 'center' },
});

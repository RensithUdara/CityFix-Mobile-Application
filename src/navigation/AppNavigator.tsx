import { SearchScreen } from '../screens/SearchScreen';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParams, TabParams } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { MapScreen } from '../screens/MapScreen';
import { ActivityScreen } from '../screens/ActivityScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { IssueDetailsScreen } from '../screens/IssueDetailsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { Icon, IconName } from '../components/ui/Icon';
import { colors } from '../theme';
import { firebaseConfigured, missingFirebaseConfig } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import { AuthScreen } from '../screens/AuthScreen';
import { Screen } from '../components/ui/Screen';
import { EmptyState } from '../components/ui/EmptyState';
import { useEffect } from 'react';
import * as NativeSplash from 'expo-splash-screen';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useOnboarding } from '../hooks/useOnboarding';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SecurityScreen } from '../screens/SecurityScreen';
import { FAQScreen } from '../screens/FAQScreen';
import { InformationScreen } from '../screens/InformationScreen';
import { HelpSupportScreen } from '../screens/HelpSupportScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SyncQueueScreen } from '../screens/SyncQueueScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { BadgesScreen } from '../screens/BadgesScreen';
import { SubscriptionsScreen } from '../screens/SubscriptionsScreen';
import { PushSettingsScreen } from '../screens/PushSettingsScreen';
import { createNavigationContainerRef } from '@react-navigation/native';
import { useNotificationStore } from '../store/notificationStore';
const navigationRef = createNavigationContainerRef<RootStackParams>();
const Stack = createNativeStackNavigator<RootStackParams>();
const Tab = createBottomTabNavigator<TabParams>();
const icons: Record<keyof TabParams, IconName> = {
  Home: 'home',
  Explore: 'map',
  Activity: 'file-text',
  Profile: 'user',
};
function Tabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          borderTopColor: colors.line,
          backgroundColor: '#FFFFFF',
          height: 76 + insets.bottom,
          paddingTop: 10,
          paddingBottom: Math.max(14, insets.bottom),
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 4 },
        tabBarIcon: ({ color }) => <Icon name={icons[route.name]} size={21} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={MapScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} options={{ title: 'My activity' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
export function AppNavigator() {
  const { user, loading } = useAuthStore();
  const pendingIssueId = useNotificationStore((s) => s.pendingIssueId);
  const openNotification = () => {
    if (user && pendingIssueId && navigationRef.isReady()) {
      navigationRef.navigate('IssueDetails', { id: pendingIssueId });
      useNotificationStore.setState({ pendingIssueId: null });
    }
  };
  useEffect(() => {
    openNotification();
  }, [user, pendingIssueId]);
  const onboarding = useOnboarding();
  const ready = onboarding.ready && !loading;
  useEffect(() => {
    if (ready) void NativeSplash.hideAsync().catch(() => {});
  }, [ready]);
  if (!ready) return <SplashScreen />;
  if (!onboarding.complete)
    return <OnboardingScreen onComplete={onboarding.finish} error={onboarding.error} />;
  if (!firebaseConfigured)
    return (
      <Screen>
        <EmptyState
          title="Connect your Firebase project"
          description={`Add the Firebase configuration to .env.local and restart Expo. Missing: ${missingFirebaseConfig.join(', ')}`}
        />
      </Screen>
    );
  return (
    <NavigationContainer<RootStackParams>
      ref={navigationRef}
      onReady={openNotification}
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.ink,
          border: colors.line,
        },
      }}
      linking={{
        prefixes: ['cityfix://'],
        config: {
          screens: {
            Main: {
              screens: { Home: '', Explore: 'map', Activity: 'activity', Profile: 'profile' },
            },
            Search: 'search',
            Report: 'report',
            IssueDetails: 'issue/:id',
            Notifications: 'notifications',
            Auth: 'sign-in',
            Settings: 'settings',
            Security: 'security',
            FAQ: 'faq',
            Privacy: 'privacy',
            Guidelines: 'guidelines',
            About: 'about',
            HelpSupport: 'help',
            SyncQueue: 'sync-queue',
            Analytics: 'analytics',
            Badges: 'badges',
            Subscriptions: 'subscriptions',
            PushSettings: 'push-settings',
          },
        },
      }}
    >
      <Stack.Navigator
        initialRouteName={user ? 'Main' : 'Auth'}
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontSize: 16 },
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{ title: 'Find reports' }}
            />
            <Stack.Screen
              name="SyncQueue"
              component={SyncQueueScreen}
              options={{ title: 'Sync Queue' }}
            />
            <Stack.Screen
              name="Analytics"
              component={AnalyticsScreen}
              options={{ title: 'Analytics' }}
            />
            <Stack.Screen name="Badges" component={BadgesScreen} options={{ title: 'Badges' }} />
            <Stack.Screen
              name="Subscriptions"
              component={SubscriptionsScreen}
              options={{ title: 'Subscriptions' }}
            />
            <Stack.Screen
              name="PushSettings"
              component={PushSettingsScreen}
              options={{ title: 'Push Settings' }}
            />

            <Stack.Screen
              name="Report"
              component={ReportScreen}
              options={{ title: 'Report an issue', presentation: 'modal' }}
            />
            <Stack.Screen
              name="IssueDetails"
              component={IssueDetailsScreen}
              options={{ title: 'Community report' }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ title: 'Community updates' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
            <Stack.Screen
              name="Security"
              component={SecurityScreen}
              options={{ title: 'Account security' }}
            />
            <Stack.Screen
              name="HelpSupport"
              component={HelpSupportScreen}
              options={{ title: 'Help & feedback' }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        )}
        <Stack.Screen name="FAQ" component={FAQScreen} options={{ title: 'Help center' }} />
        <Stack.Screen
          name="Privacy"
          component={InformationScreen}
          options={{ title: 'Privacy policy' }}
        />
        <Stack.Screen
          name="Guidelines"
          component={InformationScreen}
          options={{ title: 'Community guidelines' }}
        />
        <Stack.Screen
          name="About"
          component={InformationScreen}
          options={{ title: 'About CityFix' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

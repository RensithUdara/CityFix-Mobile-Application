import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { firebase } from '../config/firebase';
import { useNotificationStore } from '../store/notificationStore';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
async function deviceId() {
  let id = await AsyncStorage.getItem('cityfix-push-device');
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem('cityfix-push-device', id);
  }
  return id;
}
export async function enablePush() {
  const uid = firebase().auth.currentUser?.uid;
  if (!uid) throw new Error('Please sign in.');
  if (!Device.isDevice || Constants.appOwnership === 'expo')
    throw new Error(
      'Use a CityFix development or release build on a physical phone to enable push notifications.',
    );
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || Constants.easConfig?.projectId;
  if (!projectId)
    throw new Error(
      'Push setup is not complete for this build. An Expo project and notification credentials are required.',
    );
  if (Platform.OS === 'android')
    await Notifications.setNotificationChannelAsync('issue-updates', {
      name: 'Issue updates',
      importance: Notifications.AndroidImportance.HIGH,
    });
  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted)
    throw new Error(
      'Notification permission was declined. Enable it in your phone settings to receive push updates.',
    );
  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  await setDoc(doc(firebase().firestore, 'users', uid, 'pushTokens', await deviceId()), {
    token,
    platform: Platform.OS,
    updatedAt: serverTimestamp(),
  });
}
export async function disablePush() {
  const uid = firebase().auth.currentUser?.uid;
  if (uid) await deleteDoc(doc(firebase().firestore, 'users', uid, 'pushTokens', await deviceId()));
}
export async function pushEnabled() {
  const uid = firebase().auth.currentUser?.uid;
  if (!uid) return false;
  return (
    await getDoc(doc(firebase().firestore, 'users', uid, 'pushTokens', await deviceId()))
  ).exists();
}
export function listenForNotificationTaps() {
  const receive = (response: Notifications.NotificationResponse | null) => {
    const id = response?.notification.request.content.data?.issueId;
    if (typeof id === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(id)) {
      useNotificationStore.setState({ pendingIssueId: id });
      void Notifications.clearLastNotificationResponseAsync();
    }
  };
  void Notifications.getLastNotificationResponseAsync().then(receive);
  const subscription = Notifications.addNotificationResponseReceivedListener(receive);
  return () => subscription.remove();
}

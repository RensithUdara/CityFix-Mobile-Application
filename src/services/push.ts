export async function enablePush(): Promise<void> {
  throw new Error(
    'Remote push notifications are available in the iOS and Android app. Your updates are available in the notification inbox here.',
  );
}
export async function disablePush(): Promise<void> {}
export async function pushEnabled(): Promise<boolean> {
  return false;
}
export function listenForNotificationTaps() {
  return () => {};
}

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0ea5e9',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return null;
    }

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })
    ).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token || null;
}

export function useNotificationObserver(
  notificationListener: (notification: Notifications.Notification) => void,
  responseListener: (response: Notifications.NotificationResponse) => void
) {
  const notificationListenerRef = Notifications.addNotificationReceivedListener(
    notificationListener
  );

  const responseListenerRef = Notifications.addNotificationResponseReceivedListener(
    responseListener
  );

  return () => {
    Notifications.removeNotificationSubscription(notificationListenerRef);
    Notifications.removeNotificationSubscription(responseListenerRef);
  };
}

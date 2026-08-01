import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { LearningProvider } from '@/context/LearningContext';
import { ModalProvider } from '@/context/ModalContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { usePushNotifications } from '@/hooks/usePushNotifications';
import { sendPushTokenApi, refreshTokenApi } from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { expoPushToken, notification } = usePushNotifications();

  useEffect(() => {
    if (expoPushToken?.data) {
      AsyncStorage.getItem('userToken').then((token) => {
        if (token) {
          sendPushTokenApi(expoPushToken.data).catch(() => {});
        }
      });
    }
  }, [expoPushToken]);

  useEffect(() => {
    if (notification) {
      const type = notification.request.content.data?.type;
      if (type === 'CONTRIBUTOR_APPROVED') {
        // Automatically refresh token to get new role
        AsyncStorage.getItem('refreshToken').then((rToken) => {
          if (rToken) {
            refreshTokenApi(rToken).then(async (res) => {
              await AsyncStorage.setItem('userToken', res.data.jwtToken);
              if (res.data.refreshToken) {
                await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
              }
              await AsyncStorage.setItem('userRole', res.data.role);
              // We could force reload here or show a toast
            }).catch(() => {});
          }
        });
      }
    }
  }, [notification]);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ModalProvider>
        <LearningProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F7FAFC' } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(learner)" />
            <Stack.Screen name="(screens)" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </LearningProvider>
      </ModalProvider>
    </ThemeProvider>
  );
}

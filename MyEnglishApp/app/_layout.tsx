import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import 'react-native-reanimated';

// Bỏ qua cảnh báo lỗi từ Expo Go khi chạy Push Notifications (vẫn hoạt động bình thường trên app build thật)
LogBox.ignoreLogs(['Android Push notifications (remote notifications) functionality']);

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
import { useRouter } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();
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
              if (res.data.role === 'CONTRIBUTOR') {
                router.replace('/contributor');
              }
            }).catch(() => {});
          }
        });
      }
    }
  }, [notification]);

  // Fallback Polling (just for DEV)
  useEffect(() => {
    if (__DEV__) {
      const interval = setInterval(async () => {
        try {
          const rToken = await AsyncStorage.getItem('refreshToken');
          const currentRole = await AsyncStorage.getItem('userRole');
          if (rToken && currentRole === 'USER') {
            // refresh token
            const res = await refreshTokenApi(rToken);
            if (res.data.role !== currentRole) {
              await AsyncStorage.setItem('userToken', res.data.jwtToken);
              if (res.data.refreshToken) {
                await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
              }
              await AsyncStorage.setItem('userRole', res.data.role);
              console.log('Dev Polling: Đã tự động cập nhật role thành ' + res.data.role);
              if (res.data.role === 'CONTRIBUTOR') {
                router.replace('/contributor');
              }
            }
          }
        } catch (e) {
          // Bỏ qua lỗi
        }
      }, 10000); // 10 giây check 1 lần
      
      return () => clearInterval(interval);
    }
  }, []);

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

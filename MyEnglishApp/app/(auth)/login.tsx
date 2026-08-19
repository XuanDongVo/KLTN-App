import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { loginApi } from '@/services/authService';
import { challengeService } from '@/services/challengeService';
import { styles } from '@/styles/(auth)/login.styles';

const greetingImage = require('@/assets/images/lessons/greetings.png');

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ registered?: string; loggedOut?: string; email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email.trim() || !password) return setError('Vui lòng nhập email và mật khẩu.');
    setLoading(true);
    setError('');
    try {
      const response = await loginApi(email.trim(), password);
      await AsyncStorage.multiSet([
        ['userId', response.data.id],
        ['userToken', response.data.jwtToken],
        ['refreshToken', response.data.refreshToken],
        ['userRole', response.data.role],
        ['userEmail', email.trim()],
        ['isVerified', String(response.data.verified)],
      ]);
      // Send push token to backend immediately to trigger push sync demo
      try {
        const Constants = (await import('expo-constants')).default;
        const Notifications = await import('expo-notifications');
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
        if (pushToken && pushToken.data) {
          const notificationService = await import('@/services/notificationService');
          await notificationService.sendPushTokenApi(pushToken.data);
        }
      } catch (e) {
        // Ignore push token error on login
      }

      if (response.data.role === 'ADMIN') {
        router.replace('/admin');
      } else if (response.data.role === 'CONTRIBUTOR') {
        router.replace('/contributor');
      } else {
        try {
          const currentChallenge = await challengeService.getCurrentChallenge();
          if (!currentChallenge) {
            router.replace('/(screens)/challenges?isNewUser=1');
          } else {
            router.replace('/(tabs)');
          }
        } catch (e) {
            router.replace('/(screens)/challenges?isNewUser=1');
        }
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Đăng nhập không thành công.');
    } finally {
      setLoading(false);
    }
  };

  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Quay lại" onPress={() => router.replace('/')} style={styles.iconButton}><MaterialCommunityIcons name="arrow-left" size={25} color={Theme.colors.ink} /></Pressable>
          <View style={styles.brand}><MaterialCommunityIcons name="book-open-page-variant" size={21} color={Theme.colors.greenDark} /><Text style={styles.brandText}>FUN ENGLISH</Text></View>
          <View style={styles.iconPlaceholder} />
        </View>

        <View style={styles.artwork}><Image accessibilityLabel="Các bạn nhỏ học tiếng Anh" source={greetingImage} style={styles.artworkImage} resizeMode="contain" /></View>
        <Text style={styles.title}>Chào mừng trở lại!</Text>
        <Text style={styles.subtitle}>Đăng nhập để tiếp tục hành trình học của bé.</Text>

        {params.registered === '1' ? <View style={styles.successBanner}>
          <MaterialCommunityIcons name="check-circle" size={24} color={Theme.colors.greenDark} />
          <Text style={styles.successText}>Tạo tài khoản thành công. Hãy đăng nhập để bắt đầu học.</Text>
        </View> : null}
        {params.loggedOut === '1' ? <View style={styles.infoBanner}>
          <MaterialCommunityIcons name="logout" size={23} color={Theme.colors.blueDark} />
          <Text style={styles.infoText}>Bạn đã đăng xuất khỏi thiết bị này.</Text>
        </View> : null}

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputShell}>
          <MaterialCommunityIcons name="email-outline" size={22} color={Theme.colors.muted} />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            placeholder="parent@email.com"
            placeholderTextColor="#9AA8B1"
            returnKeyType="next"
          />
        </View>
        <Text style={styles.label}>Mật khẩu</Text>
        <View style={styles.inputShell}>
          <MaterialCommunityIcons name="lock-outline" size={22} color={Theme.colors.muted} />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            placeholderTextColor="#9AA8B1"
            returnKeyType="done"
            onSubmitEditing={login}
          />
          <Pressable accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onPress={() => setShowPassword((visible) => !visible)} style={styles.passwordToggle}>
            <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={Theme.colors.muted} />
          </Pressable>
        </View>
        <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={{ alignSelf: 'flex-end', marginTop: 8, marginBottom: 16 }}>
          <Text style={{ color: Theme.colors.greenDark, fontWeight: '600' }}>Quên mật khẩu?</Text>
        </Pressable>

        {error ? <View style={styles.errorBanner}><MaterialCommunityIcons name="alert-circle" size={21} color={Theme.colors.coralDark} /><Text style={styles.error}>{error}</Text></View> : null}
        <View style={styles.submit}>{loading ? <ActivityIndicator size="large" color={Theme.colors.green} /> : <ActionButton label="Đăng nhập" icon="login" onPress={login} />}</View>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/(auth)/register')} style={styles.switchButton}><Text style={styles.switchText}>Chưa có tài khoản? <Text style={styles.switchStrong}>Tạo tài khoản</Text></Text></Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

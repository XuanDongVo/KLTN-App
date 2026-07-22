import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { loginApi } from '@/services/authService';

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
      ]);
      router.replace(response.data.role === 'ADMIN' ? '/admin' : '/(tabs)');
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

        {error ? <View style={styles.errorBanner}><MaterialCommunityIcons name="alert-circle" size={21} color={Theme.colors.coralDark} /><Text style={styles.error}>{error}</Text></View> : null}
        <View style={styles.submit}>{loading ? <ActivityIndicator size="large" color={Theme.colors.green} /> : <ActionButton label="Đăng nhập" icon="login" onPress={login} />}</View>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/(auth)/register')} style={styles.switchButton}><Text style={styles.switchText}>Chưa có tài khoản? <Text style={styles.switchStrong}>Tạo tài khoản</Text></Text></Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  content: { flexGrow: 1, width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: 22, paddingBottom: 30 },
  topBar: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  iconPlaceholder: { width: 44 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandText: { color: Theme.colors.ink, fontSize: 13, fontWeight: '900' },
  artwork: { height: 170, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#EAF7FE', overflow: 'hidden' },
  artworkImage: { width: '100%', height: '100%' },
  title: { color: Theme.colors.ink, fontSize: 28, fontWeight: '900', textAlign: 'center', marginTop: 18 },
  subtitle: { color: Theme.colors.muted, lineHeight: 21, textAlign: 'center', marginTop: 5, marginBottom: 20 },
  successBanner: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 9, padding: 11, borderWidth: 1, borderColor: '#B8EAC0', borderRadius: 8, backgroundColor: '#EEF9F0', marginBottom: 18 },
  successText: { flex: 1, color: Theme.colors.greenDark, fontWeight: '800', lineHeight: 19 },
  infoBanner: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 9, padding: 11, borderWidth: 1, borderColor: '#B9E3F8', borderRadius: 8, backgroundColor: '#EAF7FE', marginBottom: 18 },
  infoText: { flex: 1, color: Theme.colors.blueDark, fontWeight: '800', lineHeight: 19 },
  label: { color: Theme.colors.ink, fontWeight: '800', marginBottom: 7 },
  inputShell: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 2, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 13, marginBottom: 15 },
  input: { flex: 1, minHeight: 52, color: Theme.colors.ink, fontSize: 16 },
  passwordToggle: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  errorBanner: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, backgroundColor: '#FFF0EF', marginBottom: 12 },
  error: { flex: 1, color: Theme.colors.coralDark, fontWeight: '700', lineHeight: 19 },
  submit: { minHeight: 56, justifyContent: 'center' },
  switchButton: { minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: 5 },
  switchText: { color: Theme.colors.muted, fontWeight: '700' },
  switchStrong: { color: Theme.colors.blueDark, fontWeight: '900' },
});

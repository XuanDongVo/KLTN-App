import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { registerApi } from '@/services/authService';

const greetingImage = require('@/assets/images/lessons/greetings.png');

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const register = async () => {
    if (!username.trim() || !email.trim() || !password || !confirmPassword) return setError('Vui lòng nhập đầy đủ thông tin.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Email chưa đúng định dạng.');
    if (password.length < 6) return setError('Mật khẩu cần ít nhất 6 ký tự.');
    if (password !== confirmPassword) return setError('Hai mật khẩu chưa trùng khớp.');

    setLoading(true);
    setError('');
    try {
      const response = await registerApi(username.trim(), email.trim(), password);
      if (!response.result) throw new Error(response.message || 'Không thể tạo tài khoản.');
      router.replace({
        pathname: '/(auth)/login',
        params: { registered: '1', email: email.trim() },
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể tạo tài khoản.');
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

        <View style={styles.artwork}><Image accessibilityLabel="Các bạn nhỏ bắt đầu học tiếng Anh" source={greetingImage} style={styles.artworkImage} resizeMode="contain" /></View>
        <Text style={styles.eyebrow}>BẮT ĐẦU HÀNH TRÌNH</Text>
        <Text style={styles.title}>Tạo tài khoản cho bé</Text>
        <Text style={styles.subtitle}>Lưu tiến độ học và tiếp tục trên mọi thiết bị.</Text>

        <Field icon="account-outline" label="Tên hiển thị của bé">
          <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="words" autoComplete="name" placeholder="Ví dụ: Minh Anh" placeholderTextColor="#9AA8B1" />
        </Field>
        <Field icon="email-outline" label="Email phụ huynh">
          <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} autoComplete="email" keyboardType="email-address" placeholder="parent@email.com" placeholderTextColor="#9AA8B1" />
        </Field>
        <Field icon="lock-outline" label="Mật khẩu">
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoComplete="new-password" placeholder="Ít nhất 6 ký tự" placeholderTextColor="#9AA8B1" />
          <Pressable accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onPress={() => setShowPassword((visible) => !visible)} style={styles.passwordToggle}><MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={Theme.colors.muted} /></Pressable>
        </Field>
        <Field icon="shield-check-outline" label="Nhập lại mật khẩu">
          <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} autoComplete="new-password" placeholder="Nhập lại mật khẩu" placeholderTextColor="#9AA8B1" returnKeyType="done" onSubmitEditing={register} />
        </Field>

        {error ? <View style={styles.errorBanner}><MaterialCommunityIcons name="alert-circle" size={21} color={Theme.colors.coralDark} /><Text style={styles.error}>{error}</Text></View> : null}
        <View style={styles.submit}>{loading ? <ActivityIndicator size="large" color={Theme.colors.green} /> : <ActionButton label="Tạo tài khoản" icon="account-plus" onPress={register} />}</View>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/(auth)/login')} style={styles.switchButton}><Text style={styles.switchText}>Đã có tài khoản? <Text style={styles.switchStrong}>Đăng nhập</Text></Text></Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

function Field({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return <View>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputShell}>
      <MaterialCommunityIcons name={icon as never} size={22} color={Theme.colors.muted} />
      {children}
    </View>
  </View>;
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
  artwork: { height: 142, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#EAF7FE', overflow: 'hidden' },
  artworkImage: { width: '100%', height: '100%' },
  eyebrow: { color: Theme.colors.greenDark, fontSize: 11, fontWeight: '900', textAlign: 'center', marginTop: 14 },
  title: { color: Theme.colors.ink, fontSize: 27, fontWeight: '900', textAlign: 'center', marginTop: 3 },
  subtitle: { color: Theme.colors.muted, lineHeight: 21, textAlign: 'center', marginTop: 5, marginBottom: 20 },
  label: { color: Theme.colors.ink, fontWeight: '800', marginBottom: 7 },
  inputShell: { minHeight: 55, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 2, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 13, marginBottom: 14 },
  input: { flex: 1, minHeight: 51, color: Theme.colors.ink, fontSize: 16 },
  passwordToggle: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  errorBanner: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, backgroundColor: '#FFF0EF', marginBottom: 12 },
  error: { flex: 1, color: Theme.colors.coralDark, fontWeight: '700', lineHeight: 19 },
  submit: { minHeight: 56, justifyContent: 'center' },
  switchButton: { minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: 5 },
  switchText: { color: Theme.colors.muted, fontWeight: '700' },
  switchStrong: { color: Theme.colors.blueDark, fontWeight: '900' },
});

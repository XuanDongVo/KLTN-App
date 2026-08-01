import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { registerApi, sendVerifyAccountApi, verifyAccountApi } from '@/services/authService';
import { styles } from '@/styles/(auth)/register.styles';

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
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const register = async () => {
    if (!username.trim() || !email.trim() || !password || !confirmPassword) return setError('Vui lòng nhập đầy đủ thông tin.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Email chưa đúng định dạng.');
    if (password.length < 6) return setError('Mật khẩu cần ít nhất 6 ký tự.');
    if (password !== confirmPassword) return setError('Hai mật khẩu chưa trùng khớp.');

    setLoading(true);
    setError('');
    try {
      await registerApi(username.trim(), email.trim(), password);
      // After successful registration, send verification email
      await sendVerifyAccountApi(email.trim());
      setIsVerifying(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể tạo tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (!verificationCode.trim()) return setError('Vui lòng nhập mã xác thực.');
    
    setLoading(true);
    setError('');
    try {
      await verifyAccountApi(email.trim(), verificationCode.trim());
      router.replace({
        pathname: '/(auth)/login',
        params: { registered: '1', email: email.trim() },
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Mã xác thực không đúng.');
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setLoading(true);
    setError('');
    try {
      await sendVerifyAccountApi(email.trim());
      setError('Đã gửi lại mã xác thực.'); // Using error banner to show info temporarily
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể gửi lại mã xác thực.');
    } finally {
      setLoading(false);
    }
  };

  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Quay lại" onPress={() => router.replace(isVerifying ? '/(auth)/register' : '/')} style={styles.iconButton}><MaterialCommunityIcons name="arrow-left" size={25} color={Theme.colors.ink} /></Pressable>
          <View style={styles.brand}><MaterialCommunityIcons name="book-open-page-variant" size={21} color={Theme.colors.greenDark} /><Text style={styles.brandText}>FUN ENGLISH</Text></View>
          <View style={styles.iconPlaceholder} />
        </View>

        <View style={styles.artwork}><Image accessibilityLabel="Các bạn nhỏ bắt đầu học tiếng Anh" source={greetingImage} style={styles.artworkImage} resizeMode="contain" /></View>
        <Text style={styles.eyebrow}>{isVerifying ? 'XÁC THỰC EMAIL' : 'BẮT ĐẦU HÀNH TRÌNH'}</Text>
        <Text style={styles.title}>{isVerifying ? 'Nhập mã xác thực' : 'Tạo tài khoản cho bé'}</Text>
        <Text style={styles.subtitle}>{isVerifying ? `Mã xác thực 6 số đã được gửi đến ${email}.` : 'Lưu tiến độ học và tiếp tục trên mọi thiết bị.'}</Text>

        {!isVerifying ? (
          <>
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
          </>
        ) : (
          <Field icon="key-outline" label="Mã xác thực">
            <TextInput style={styles.input} value={verificationCode} onChangeText={setVerificationCode} keyboardType="number-pad" placeholder="Nhập mã 6 số" placeholderTextColor="#9AA8B1" returnKeyType="done" onSubmitEditing={verify} maxLength={6} />
          </Field>
        )}

        {error ? <View style={styles.errorBanner}><MaterialCommunityIcons name="alert-circle" size={21} color={Theme.colors.coralDark} /><Text style={styles.error}>{error}</Text></View> : null}
        
        <View style={styles.submit}>
          {loading ? <ActivityIndicator size="large" color={Theme.colors.green} /> : <ActionButton label={isVerifying ? "Xác thực" : "Tạo tài khoản"} icon={isVerifying ? "check" : "account-plus"} onPress={isVerifying ? verify : register} />}
        </View>
        
        {isVerifying ? (
          <View style={{ gap: 4, marginTop: 10 }}>
            <ActionButton label="Bỏ qua xác thực" outline onPress={() => router.replace({ pathname: '/(auth)/login', params: { registered: '1', email: email.trim() } })} />
            <Pressable accessibilityRole="button" onPress={resendCode} style={styles.switchButton}><Text style={styles.switchText}>Chưa nhận được mã? <Text style={styles.switchStrong}>Gửi lại</Text></Text></Pressable>
          </View>
        ) : (
          <Pressable accessibilityRole="button" onPress={() => router.replace('/(auth)/login')} style={styles.switchButton}><Text style={styles.switchText}>Đã có tài khoản? <Text style={styles.switchStrong}>Đăng nhập</Text></Text></Pressable>
        )}
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

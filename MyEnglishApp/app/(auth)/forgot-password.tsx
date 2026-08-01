import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { sendResetPasswordApi, resetPasswordApi } from '@/services/authService';
import { styles } from '@/styles/(auth)/login.styles';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ defaultEmail?: string; mode?: 'change' | 'verify' }>();
  const [email, setEmail] = useState(params.defaultEmail ?? '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1: Send OTP, 2: Reset Password

  const handleSendOtp = async () => {
    if (!email.trim()) return setError('Vui lòng nhập email.');
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await sendResetPasswordApi(email.trim());
      setSuccess('Mã xác minh đã được gửi đến email của bạn.');
      setStep(2);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể gửi mã xác minh.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword) return setError('Vui lòng nhập mã xác minh và mật khẩu mới.');
    setLoading(true);
    setError('');
    try {
      await resetPasswordApi(email.trim(), otp.trim(), newPassword);
      await AsyncStorage.setItem('isVerified', 'true');
      setSuccess('Mật khẩu đã được đổi thành công.');
      setTimeout(() => {
        router.replace({ pathname: '/(auth)/login', params: { email: email.trim() } });
      }, 2000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Đổi mật khẩu không thành công.');
    } finally {
      setLoading(false);
    }
  };

  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Quay lại" onPress={() => router.back()} style={styles.iconButton}><MaterialCommunityIcons name="arrow-left" size={25} color={Theme.colors.ink} /></Pressable>
          <View style={styles.brand}>
            <MaterialCommunityIcons name={params.mode === 'verify' ? "shield-check" : "shield-key-outline"} size={21} color={Theme.colors.greenDark} />
            <Text style={styles.brandText}>{params.mode === 'verify' ? 'XÁC MINH' : params.mode === 'change' ? 'ĐỔI MẬT KHẨU' : 'KHÔI PHỤC'}</Text>
          </View>
          <View style={styles.iconPlaceholder} />
        </View>

        <Text style={styles.title}>{params.mode === 'verify' ? 'Xác minh tài khoản' : params.mode === 'change' ? 'Đổi mật khẩu' : 'Quên mật khẩu?'}</Text>
        <Text style={styles.subtitle}>
          {step === 1 
            ? (params.mode === 'verify' ? 'Nhận mã xác minh để bảo vệ tài khoản của bạn.' : params.mode === 'change' ? 'Xác nhận gửi mã về email của bạn để đổi mật khẩu.' : 'Nhập email của bạn để nhận mã khôi phục mật khẩu.') 
            : 'Nhập mã xác minh gồm 6 số từ email và mật khẩu mới.'}
        </Text>

        {success ? <View style={styles.successBanner}>
          <MaterialCommunityIcons name="check-circle" size={24} color={Theme.colors.greenDark} />
          <Text style={styles.successText}>{success}</Text>
        </View> : null}

        <Text style={styles.label}>Email</Text>
        <View style={[styles.inputShell, step === 2 && { backgroundColor: Theme.colors.surface, borderColor: Theme.colors.border }]}>
          <MaterialCommunityIcons name="email-outline" size={22} color={Theme.colors.muted} />
          <TextInput
            style={[styles.input, step === 2 && { color: Theme.colors.muted }]}
            value={email}
            onChangeText={setEmail}
            editable={step === 1}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="parent@email.com"
            placeholderTextColor="#9AA8B1"
          />
        </View>

        {step === 2 && (
          <>
            <Text style={styles.label}>Mã xác minh (OTP)</Text>
            <View style={styles.inputShell}>
              <MaterialCommunityIcons name="message-processing-outline" size={22} color={Theme.colors.muted} />
              <TextInput
                style={styles.input}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                placeholder="Nhập mã 6 số"
                placeholderTextColor="#9AA8B1"
                maxLength={6}
              />
            </View>

            <Text style={styles.label}>Mật khẩu mới</Text>
            <View style={styles.inputShell}>
              <MaterialCommunityIcons name="lock-outline" size={22} color={Theme.colors.muted} />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                placeholder="Nhập mật khẩu mới"
                placeholderTextColor="#9AA8B1"
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
              />
              <Pressable accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onPress={() => setShowPassword((visible) => !visible)} style={styles.passwordToggle}>
                <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={Theme.colors.muted} />
              </Pressable>
            </View>
          </>
        )}

        {error ? <View style={styles.errorBanner}><MaterialCommunityIcons name="alert-circle" size={21} color={Theme.colors.coralDark} /><Text style={styles.error}>{error}</Text></View> : null}
        
        <View style={styles.submit}>
          {loading ? (
            <ActivityIndicator size="large" color={Theme.colors.green} />
          ) : (
            <ActionButton 
              label={step === 1 ? 'Gửi mã khôi phục' : 'Xác nhận đổi mật khẩu'} 
              icon={step === 1 ? 'send' : 'lock-reset'} 
              onPress={step === 1 ? handleSendOtp : handleResetPassword} 
            />
          )}
        </View>
        
        {step === 2 && !loading && (
          <Pressable onPress={handleSendOtp} style={styles.switchButton}>
            <Text style={styles.switchText}>Chưa nhận được mã? <Text style={styles.switchStrong}>Gửi lại</Text></Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

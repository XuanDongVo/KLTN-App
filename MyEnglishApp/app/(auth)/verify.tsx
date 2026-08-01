import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { sendVerifyAccountApi, verifyAccountApi } from '@/services/authService';
import { useModal } from '@/context/ModalContext';
import { useLocalSearchParams } from 'expo-router';
import { styles } from '@/styles/(auth)/register.styles';

const greetingImage = require('@/assets/images/lessons/greetings.png');

export default function VerifyScreen() {
  const router = useRouter();
  const { showAlert } = useModal();
  const params = useLocalSearchParams<{ returnTo?: string }>();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    const fetchEmail = async () => {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      if (storedEmail) {
        setEmail(storedEmail);
        sendCode(storedEmail);
      } else {
        setError('Không tìm thấy email.');
      }
    };
    fetchEmail();
  }, []);

  const sendCode = async (userEmail: string) => {
    try {
      await sendVerifyAccountApi(userEmail);
    } catch (reason: any) {
        console.log("Gửi OTP thất bại", reason);
    }
  }

  const verify = async () => {
    if (!verificationCode.trim()) return setError('Vui lòng nhập mã xác thực.');
    
    setLoading(true);
    setError('');
    try {
      await verifyAccountApi(email, verificationCode.trim());
      await AsyncStorage.setItem('isVerified', 'true');
      
      const successMessage = params.returnTo === 'challenges' || params.returnTo === 'profile' 
        ? "Thông báo sẽ được gửi đi sau khi hoàn thành thử thách" 
        : "Xác thực email thành công!";

      showAlert("Thành công", successMessage, () => {
        if (params.returnTo) {
            router.replace(`/(tabs)/${params.returnTo}` as any);
        } else {
            router.replace('/(tabs)');
        }
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
      await sendVerifyAccountApi(email);
      setError('Đã gửi lại mã xác thực.');
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
          <Pressable accessibilityLabel="Bỏ qua" onPress={() => router.replace(params.returnTo ? `/(tabs)/${params.returnTo}` as any : '/(tabs)')} style={styles.iconButton}><MaterialCommunityIcons name="close" size={25} color={Theme.colors.ink} /></Pressable>
          <View style={styles.brand}><MaterialCommunityIcons name="shield-check" size={21} color={Theme.colors.greenDark} /><Text style={styles.brandText}>XÁC THỰC</Text></View>
          <View style={styles.iconPlaceholder} />
        </View>

        <View style={styles.artwork}><Image accessibilityLabel="Xác thực Email" source={greetingImage} style={styles.artworkImage} resizeMode="contain" /></View>
        <Text style={styles.eyebrow}>XÁC THỰC EMAIL</Text>
        <Text style={styles.title}>Nhập mã xác thực</Text>
        <Text style={styles.subtitle}>{`Mã xác thực 6 số đã được gửi đến ${email}.`}</Text>

        <View>
          <Text style={styles.label}>Mã xác thực</Text>
          <View style={styles.inputShell}>
            <MaterialCommunityIcons name="key-outline" size={22} color={Theme.colors.muted} />
            <TextInput style={styles.input} value={verificationCode} onChangeText={setVerificationCode} keyboardType="number-pad" placeholder="Nhập mã 6 số" placeholderTextColor="#9AA8B1" returnKeyType="done" onSubmitEditing={verify} maxLength={6} />
          </View>
        </View>

        {error ? <View style={styles.errorBanner}><MaterialCommunityIcons name="alert-circle" size={21} color={Theme.colors.coralDark} /><Text style={styles.error}>{error}</Text></View> : null}
        
        <View style={styles.submit}>
          {loading ? <ActivityIndicator size="large" color={Theme.colors.green} /> : <ActionButton label="Xác thực" icon="check" onPress={verify} />}
        </View>
        
        <View style={{ gap: 4, marginTop: 10 }}>
          <ActionButton label="Bỏ qua, để sau" outline onPress={() => router.replace(params.returnTo ? `/(tabs)/${params.returnTo}` as any : '/(tabs)')} />
          <Pressable accessibilityRole="button" onPress={resendCode} style={styles.switchButton}><Text style={styles.switchText}>Chưa nhận được mã? <Text style={styles.switchStrong}>Gửi lại</Text></Text></Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

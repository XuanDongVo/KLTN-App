import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { loginApi } from '@/services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email.trim() || !password) return setError('Vui lòng nhập email và mật khẩu.');
    setLoading(true); setError('');
    try {
      const response = await loginApi(email.trim(), password);
      await AsyncStorage.multiSet([['userToken', response.data.jwtToken], ['userRole', response.data.role]]);
      router.replace(response.data.role === 'ADMIN' ? '/admin' : '/(tabs)');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Đăng nhập không thành công.');
    } finally { setLoading(false); }
  };

  return <SafeAreaView style={styles.safe}><Pressable onPress={() => router.back()} style={styles.back}><MaterialCommunityIcons name="arrow-left" size={25} color={Theme.colors.ink} /></Pressable><View style={styles.form}>
    <View style={styles.icon}><MaterialCommunityIcons name="book-open-page-variant" size={38} color="#FFFFFF" /></View><Text style={styles.title}>Chào mừng trở lại!</Text><Text style={styles.subtitle}>Đăng nhập để đồng bộ tiến độ học của bé.</Text>
    <Text style={styles.label}>Email</Text><TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="parent@email.com" placeholderTextColor="#9AA8B1" />
    <Text style={styles.label}>Mật khẩu</Text><TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Nhập mật khẩu" placeholderTextColor="#9AA8B1" />
    {error ? <Text style={styles.error}>{error}</Text> : null}
    {loading ? <ActivityIndicator size="large" color={Theme.colors.green} /> : <ActionButton label="Đăng nhập" icon="login" onPress={login} />}
    <Pressable onPress={() => router.push('/(auth)/register')} style={styles.register}><Text style={styles.registerText}>Chưa có tài khoản? Tạo tài khoản</Text></Pressable>
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background }, back: { width: 48, height: 48, margin: 10, alignItems: 'center', justifyContent: 'center' }, form: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', padding: 24, justifyContent: 'center' }, icon: { width: 72, height: 72, borderRadius: 8, backgroundColor: Theme.colors.green, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }, title: { color: Theme.colors.ink, fontSize: 28, fontWeight: '900', textAlign: 'center', marginTop: 18 }, subtitle: { color: Theme.colors.muted, lineHeight: 21, textAlign: 'center', marginTop: 5, marginBottom: 26 }, label: { color: Theme.colors.ink, fontWeight: '800', marginBottom: 7 }, input: { height: 55, borderWidth: 2, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 14, color: Theme.colors.ink, fontSize: 16, marginBottom: 16 }, error: { color: Theme.colors.coralDark, fontWeight: '700', textAlign: 'center', marginBottom: 12 }, register: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 8 }, registerText: { color: Theme.colors.blueDark, fontWeight: '900' },
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';

export default function WelcomeScreen() {
  const router = useRouter();
  useEffect(() => {
    AsyncStorage.getItem('userToken').then((token) => token && router.replace('/(tabs)'));
  }, [router]);

  return <ImageBackground source={require('@/assets/images/lessons/greetings.png')} style={styles.background} imageStyle={styles.image}>
    <View style={styles.overlay} />
    <SafeAreaView style={styles.safe}>
      <View style={styles.brand}><View style={styles.logo}><MaterialCommunityIcons name="book-open-page-variant" size={28} color="#FFFFFF" /></View><Text style={styles.brandText}>FUN ENGLISH</Text></View>
      <View style={styles.copy}><Text style={styles.title}>Fun English</Text><Text style={styles.subtitle}>Mỗi ngày một bài học ngắn, vui và vừa sức cho bé.</Text></View>
      <View style={styles.actions}><ActionButton label="Học thử ngay" icon="play" onPress={() => router.replace('/(tabs)')} /><Pressable onPress={() => router.push('/(auth)/login')} style={styles.login}><Text style={styles.loginText}>Đã có tài khoản? Đăng nhập</Text></Pressable></View>
    </SafeAreaView>
  </ImageBackground>;
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: Theme.colors.blue }, image: { resizeMode: 'cover' }, overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,42,54,0.48)' }, safe: { flex: 1, padding: 22, justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 }, logo: { width: 44, height: 44, borderRadius: 8, backgroundColor: Theme.colors.green, alignItems: 'center', justifyContent: 'center' }, brandText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  copy: { maxWidth: 570 }, title: { color: '#FFFFFF', fontSize: 44, fontWeight: '900' }, subtitle: { color: '#FFFFFF', fontSize: 18, lineHeight: 26, fontWeight: '700', marginTop: 8, maxWidth: 430 },
  actions: { gap: 11 }, login: { minHeight: 48, alignItems: 'center', justifyContent: 'center' }, loginText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
});

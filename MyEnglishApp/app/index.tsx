import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';

const greetingImage = require('@/assets/images/lessons/greetings.png');

export default function WelcomeScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();

  useEffect(() => {
    AsyncStorage.multiGet(['userToken', 'userRole']).then((entries) => {
      const token = entries[0][1];
      const role = entries[1][1];
      if (token) router.replace(role === 'ADMIN' ? '/admin' : '/(tabs)');
    });
  }, [router]);

  const artworkHeight = Math.min(380, Math.max(240, height * 0.42));

  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.brand}>
        <View style={styles.logo}><MaterialCommunityIcons name="book-open-page-variant" size={25} color="#FFFFFF" /></View>
        <Text style={styles.brandText}>FUN ENGLISH</Text>
      </View>

      <View style={[styles.artwork, { height: artworkHeight }]}>
        <Image accessibilityLabel="Cô giáo và hai bạn nhỏ trong lớp học" source={greetingImage} style={styles.artworkImage} resizeMode="contain" />
      </View>

      <View style={styles.copy}>
        <Text style={styles.eyebrow}>PRE A1 STARTERS</Text>
        <Text style={styles.title}>Học tiếng Anh thật vui</Text>
        <Text style={styles.subtitle}>Mỗi ngày một bài học ngắn, trực quan và vừa sức cho bé.</Text>
      </View>

      <View style={styles.actions}>
        <ActionButton label="Bắt đầu miễn phí" icon="account-plus" onPress={() => router.push('/(auth)/register')} />
        <Pressable accessibilityRole="button" onPress={() => router.push('/(auth)/login')} style={styles.loginButton}>
          <MaterialCommunityIcons name="login" size={21} color={Theme.colors.blueDark} />
          <Text style={styles.loginText}>Đã có tài khoản? Đăng nhập</Text>
        </Pressable>
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flexGrow: 1, width: '100%', maxWidth: 680, alignSelf: 'center', padding: 20, paddingBottom: 28 },
  brand: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 9 },
  logo: { width: 42, height: 42, borderRadius: 8, backgroundColor: Theme.colors.green, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 4, borderBottomColor: Theme.colors.greenDark },
  brandText: { color: Theme.colors.ink, fontSize: 15, fontWeight: '900' },
  artwork: { width: '100%', minHeight: 240, alignItems: 'center', justifyContent: 'center', marginTop: 10, borderRadius: 8, backgroundColor: '#EAF7FE', overflow: 'hidden' },
  artworkImage: { width: '100%', height: '100%' },
  copy: { alignItems: 'center', paddingTop: 18 },
  eyebrow: { color: Theme.colors.greenDark, fontSize: 11, fontWeight: '900' },
  title: { color: Theme.colors.ink, fontSize: 34, lineHeight: 42, fontWeight: '900', textAlign: 'center', marginTop: 4 },
  subtitle: { color: Theme.colors.muted, fontSize: 16, lineHeight: 23, fontWeight: '700', textAlign: 'center', maxWidth: 440, marginTop: 7 },
  actions: { gap: 8, marginTop: 22 },
  loginButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  loginText: { color: Theme.colors.blueDark, fontWeight: '900', fontSize: 15 },
});

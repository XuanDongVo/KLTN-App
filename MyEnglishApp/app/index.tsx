import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { styles } from '@/styles/index.styles';

const greetingImage = require('@/assets/images/lessons/greetings.png');

export default function WelcomeScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();

  useEffect(() => {
    AsyncStorage.multiGet(['userToken', 'userRole']).then((entries) => {
      const token = entries[0][1];
      const role = entries[1][1];
      if (token) {
        if (role === 'ADMIN') router.replace('/admin');
        else if (role === 'CONTRIBUTOR') router.replace('/contributor');
        else router.replace('/(tabs)');
      }
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

import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import { CustomButton } from '../components/buttons/CustomButton';
import { GlobalStyles } from '../constants/Style';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={[GlobalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#333' }}>
        Hello!
      </Text>
      <Text style={{ fontSize: 18, marginBottom: 40, textAlign: 'center', color: '#666' }}>
        Chào mừng bé đến với{"\n"}Ứng dụng Học Tiếng Anh!
      </Text>

      <CustomButton 
        title="BẮT ĐẦU ĐĂNG NHẬP" 
        onPress={() => router.push('/(auth)/login')} 
      />
    </View>
  );
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, View, useWindowDimensions } from 'react-native';

import { CustomButton } from '../../components/buttons/CustomButton';
import { CustomModal } from '../../components/modals/CustomModal';
import { GlobalStyles } from '../../constants/Style';
import { loginApi } from '../../services/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Lấy chiều rộng màn hình để tự động scale
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage("Vui lòng nhập đầy đủ Email và Mật khẩu!");
      return;
    }

    try {
      setLoading(true);
      const data = await loginApi(email, password);

      if (data.code === 200) {
        const token = data.data.jwtToken; 
        const role = data.data.role;

        if (!token) {
          setAlertMessage("Lỗi: Không tìm thấy jwtToken!");
          setAlertVisible(true);
          return;
        }

        await AsyncStorage.setItem('userToken', token); 
        await AsyncStorage.setItem('userRole', role);

        if (role === 'ADMIN') {
          router.replace('/admin'); 
        } else {
          router.replace('/(tabs)'); 
        }
      } else {
        setAlertMessage(data.message);
        setAlertVisible(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (

    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6', padding: 20 }}>
      
      <CustomModal
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title="Đăng nhập thất bại"
        message={alertMessage}
        type="error"
      />

      <View style={[
        GlobalStyles.container, 
        { 
          width: isMobile ? '100%' : 500, 
          backgroundColor: 'transparent',
          alignSelf: 'center'
        }
      ]}>
        
        <Text style={[GlobalStyles.title, { textAlign: 'center', marginBottom: 40 }]}>
          Welcome back!{"\n"}Ready to learn?
        </Text>

        <TextInput
          style={GlobalStyles.input}
          placeholder="Email hoặc Username"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={GlobalStyles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        {errorMessage ? (
          <Text style={{ color: '#ef4444', textAlign: 'center', marginBottom: 16, fontSize: 14, fontWeight: '500' }}>
            {errorMessage}
          </Text>
        ) : null}

        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginVertical: 10 }} />
        ) : (
          <CustomButton title="ĐĂNG NHẬP" onPress={handleLogin} />
        )}

        <View style={{ marginVertical: 15 }} />

        <CustomButton
          title="TẠO TÀI KHOẢN MỚI"
          type="outline"
          onPress={() => router.push('/(auth)/register')}
        />
      </View>

    </View>
  );
}
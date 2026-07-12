
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, TextInput, View, useWindowDimensions } from 'react-native';

import { CustomButton } from '../../components/buttons/CustomButton';
import { CustomModal } from '../../components/modals/CustomModal';
import { GlobalStyles } from '../../constants/Style';
import { registerApi } from '../../services/authService';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const router = useRouter();
  
  // State quản lý hiển thị lỗi và loading
  const [errorMessage, setErrorMessage] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');
  const [loading, setLoading] = useState(false);

  // Lấy kích thước màn hình để tự động co giãn
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const handleRegister = async () => {
    setErrorMessage('');
    
    // Validate cơ bản
    if (!username || !email || !password) {
      setErrorMessage("Vui lòng điền đầy đủ các trường!");
      return;
    }

    try {
      setLoading(true);
      const data = await registerApi(username, email, password);
      
      if (data.success) { 
        setAlertType('success');
        setAlertMessage("Tạo tài khoản thành công!");
        setAlertVisible(true);
      } else {
        setAlertType('error');
        setAlertMessage(data.message || "Đăng ký thất bại");
        setAlertVisible(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi kết nối mạng");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setAlertVisible(false);
    // Nếu đăng ký thành công thì chuyển về Login khi đóng Modal
    if (alertType === 'success') {
      router.replace('/(auth)/login');
    }
  };

  return (
    // View bao bọc ép form vào chính giữa màn hình (Center 100%)
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6', padding: 20 }}>
      
      <CustomModal
        visible={alertVisible}
        onClose={handleModalClose}
        title={alertType === 'success' ? "Chúc mừng" : "Lỗi"}
        message={alertMessage}
        type={alertType}
      />

      <KeyboardAvoidingView 
        // Ép width 500 trên PC và 100% trên Mobile giống trang Login
        style={[
          GlobalStyles.container, 
          { 
            width: isMobile ? '100%' : 500, 
            backgroundColor: 'transparent',
            alignSelf: 'center'
          }
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={[GlobalStyles.title, { textAlign: 'center', marginBottom: 30 }]}>
          Tạo tài khoản mới
        </Text>
        
        <TextInput 
          style={GlobalStyles.input} 
          placeholder="Tên của bé (Username)" 
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput 
          style={GlobalStyles.input} 
          placeholder="Email của bố mẹ" 
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput 
          style={GlobalStyles.input} 
          placeholder="Mật khẩu" 
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
          <ActivityIndicator size="large" color="#10b981" style={{ marginVertical: 10 }} />
        ) : (
          <CustomButton title="ĐĂNG KÝ" onPress={handleRegister} />
        )}
        
        <View style={{ marginVertical: 15 }} />
        
        <CustomButton 
          title="ĐÃ CÓ TÀI KHOẢN? ĐĂNG NHẬP" 
          type="outline" 
          onPress={() => router.push('/(auth)/login')} 
        />
      </KeyboardAvoidingView>

    </View>
  );
}
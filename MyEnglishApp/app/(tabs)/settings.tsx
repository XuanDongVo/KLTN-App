import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { useLearning } from '@/context/LearningContext';
import { logoutApi, logoutAllApi } from '@/services/authService';
import { Alert } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { resetProgress } = useLearning();
  const [email, setEmail] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('userEmail').then((value) => setEmail(value ?? '')).catch(() => undefined);
  }, []));

  const logout = async () => {
    setLoggingOut(true);
    setLogoutError('');
    try {
      const token = await AsyncStorage.getItem('refreshToken');
      if (token) await logoutApi(token);
    } catch {}
    
    try {
      await AsyncStorage.multiRemove(['userId', 'userToken', 'userRole', 'userEmail', 'refreshToken']);
      await resetProgress().catch(() => undefined);
      setConfirmVisible(false);
      router.replace({ pathname: '/(auth)/login', params: { loggedOut: '1' } });
    } catch {
      setLogoutError('Không thể xóa phiên đăng nhập. Vui lòng thử lại.');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogoutAll = async () => {
    Alert.alert('Đăng xuất mọi thiết bị', 'Bạn có chắc chắn muốn đăng xuất khỏi tất cả thiết bị không?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: async () => {
        try {
          const email = await AsyncStorage.getItem('userEmail');
          if (email) await logoutAllApi(email);
        } catch {}
        await AsyncStorage.multiRemove(['userId', 'userToken', 'userRole', 'userEmail', 'refreshToken']);
        await resetProgress().catch(() => undefined);
        router.replace({ pathname: '/(auth)/login', params: { loggedOut: '1' } });
      }},
    ]);
  };

  return <SafeAreaView style={styles.safe} edges={['top']}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>TÀI KHOẢN VÀ ỨNG DỤNG</Text>
      <Text style={styles.title}>Cài đặt</Text>
      <Text style={styles.subtitle}>Quản lý phiên đăng nhập trên thiết bị này.</Text>

      <Text style={styles.sectionTitle}>Tài khoản</Text>
      <View style={styles.accountPanel}>
        <View style={styles.avatar}><MaterialCommunityIcons name="account" size={30} color={Theme.colors.blueDark} /></View>
        <View style={styles.accountCopy}>
          <Text style={styles.accountTitle}>{email || 'Tài khoản học viên'}</Text>
          <View style={styles.syncRow}><View style={styles.syncDot} /><Text style={styles.accountSubtitle}>Đang đồng bộ tiến độ với máy chủ</Text></View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Phiên đăng nhập</Text>
      <Pressable accessibilityRole="button" onPress={() => setConfirmVisible(true)} style={({ pressed }) => [styles.logoutRow, pressed && styles.rowPressed]}>
        <View style={styles.logoutIcon}><MaterialCommunityIcons name="logout" size={24} color={Theme.colors.coralDark} /></View>
        <View style={styles.logoutCopy}>
          <Text style={styles.logoutTitle}>Đăng xuất</Text>
          <Text style={styles.logoutSubtitle}>Rời tài khoản trên thiết bị này</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={25} color={Theme.colors.muted} />
      </Pressable>
      
      <Pressable accessibilityRole="button" onPress={handleLogoutAll} style={({ pressed }) => [styles.logoutRow, pressed && styles.rowPressed, { marginTop: 10 }]}>
        <View style={styles.logoutIcon}><MaterialCommunityIcons name="shield-alert-outline" size={24} color={Theme.colors.coralDark} /></View>
        <View style={styles.logoutCopy}>
          <Text style={styles.logoutTitle}>Đăng xuất mọi nơi</Text>
          <Text style={styles.logoutSubtitle}>Xóa tất cả các phiên đăng nhập</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={25} color={Theme.colors.muted} />
      </Pressable>

      <View style={styles.note}>
        <MaterialCommunityIcons name="cloud-check-outline" size={22} color={Theme.colors.greenDark} />
        <Text style={styles.noteText}>Bài học đã hoàn thành trên máy chủ vẫn được giữ lại khi đăng xuất.</Text>
      </View>
      {logoutError ? <View style={styles.errorBanner}><MaterialCommunityIcons name="alert-circle" size={21} color={Theme.colors.coralDark} /><Text style={styles.errorText}>{logoutError}</Text></View> : null}
    </ScrollView>

    <Modal transparent visible={confirmVisible} animationType="fade" onRequestClose={() => !loggingOut && setConfirmVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalPanel}>
          <View style={styles.modalIcon}><MaterialCommunityIcons name="logout" size={30} color={Theme.colors.coralDark} /></View>
          <Text style={styles.modalTitle}>Đăng xuất khỏi Fun English?</Text>
          <Text style={styles.modalText}>Phiên đăng nhập và số liệu tạm trên thiết bị sẽ được xóa. Tiến độ đã đồng bộ trên máy chủ không bị mất.</Text>
          {logoutError ? <Text style={styles.modalError}>{logoutError}</Text> : null}
          {loggingOut ? <ActivityIndicator size="large" color={Theme.colors.coral} /> : <>
            <ActionButton label="Đăng xuất" icon="logout" color={Theme.colors.coral} onPress={logout} />
            <Pressable accessibilityRole="button" onPress={() => setConfirmVisible(false)} style={styles.cancelButton}><Text style={styles.cancelText}>Ở lại</Text></Pressable>
          </>}
        </View>
      </View>
    </Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { flexGrow: 1, width: '100%', maxWidth: 680, alignSelf: 'center', padding: 20, paddingBottom: 45 },
  eyebrow: { color: Theme.colors.greenDark, fontSize: 11, fontWeight: '900', marginTop: 8 },
  title: { color: Theme.colors.ink, fontSize: 30, fontWeight: '900', marginTop: 3 },
  subtitle: { color: Theme.colors.muted, fontSize: 15, lineHeight: 21, marginTop: 5 },
  sectionTitle: { color: Theme.colors.ink, fontSize: 16, fontWeight: '900', marginTop: 28, marginBottom: 9 },
  accountPanel: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF' },
  avatar: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF7FE' },
  accountCopy: { flex: 1 },
  accountTitle: { color: Theme.colors.ink, fontSize: 16, fontWeight: '900' },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  syncDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.colors.green },
  accountSubtitle: { flex: 1, color: Theme.colors.muted, fontSize: 12, fontWeight: '700' },
  logoutRow: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderWidth: 1, borderBottomWidth: 3, borderColor: '#FFD0CD', borderRadius: 8, backgroundColor: '#FFFFFF' },
  rowPressed: { transform: [{ translateY: 2 }], borderBottomWidth: 1 },
  logoutIcon: { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0EF' },
  logoutCopy: { flex: 1 },
  logoutTitle: { color: Theme.colors.coralDark, fontSize: 16, fontWeight: '900' },
  logoutSubtitle: { color: Theme.colors.muted, fontSize: 12, marginTop: 3 },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, paddingVertical: 18 },
  noteText: { flex: 1, color: Theme.colors.muted, fontSize: 12, lineHeight: 18 },
  errorBanner: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, backgroundColor: '#FFF0EF' },
  errorText: { flex: 1, color: Theme.colors.coralDark, fontWeight: '700' },
  modalOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 22, backgroundColor: 'rgba(28,45,52,0.48)' },
  modalPanel: { width: '100%', maxWidth: 420, padding: 20, borderRadius: 8, backgroundColor: '#FFFFFF', ...Theme.shadow },
  modalIcon: { width: 58, height: 58, borderRadius: 29, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0EF' },
  modalTitle: { color: Theme.colors.ink, fontSize: 21, fontWeight: '900', textAlign: 'center', marginTop: 14 },
  modalText: { color: Theme.colors.muted, lineHeight: 21, textAlign: 'center', marginTop: 7, marginBottom: 20 },
  modalError: { color: Theme.colors.coralDark, fontWeight: '700', textAlign: 'center', marginBottom: 14 },
  cancelButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 5 },
  cancelText: { color: Theme.colors.blueDark, fontWeight: '900' },
});

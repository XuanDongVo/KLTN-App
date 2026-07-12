
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Slot, usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // State cho Menu Drawer chỉ dùng trên Mobile
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/(auth)/login');
  };

  const sidebarAnimatedStyle = useAnimatedStyle(() => {
    if (isMobile) {
      return {
        transform: [{ translateX: withTiming(isOpen ? 0 : -260, { duration: 300 }) }],
      };
    }
    return {
      width: 260,
      transform: [{ translateX: 0 }]
    };
  });

  const isOverviewActive = pathname === '/admin';
  const isUnitsActive = pathname.startsWith('/admin/units');

  return (
    <View style={styles.mainContainer}>

      {/* Lớp nền đen mờ (Overlay) khi mở menu trên Mobile */}
      {isMobile && isOpen && (
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)} />
      )}

      <Animated.View style={[
        styles.sidebar,
        isMobile ? styles.sidebarMobileAbsolute : {}, 
        sidebarAnimatedStyle
      ]}>
        
        <View style={styles.brandHeader}>
          <Text style={styles.brandText} numberOfLines={1}>Admin Panel</Text>
          {isMobile && (
            <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.toggleBtn}>
              <Ionicons name="close" size={26} color="white" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.menuList}>
          <TouchableOpacity 
            onPress={() => { router.push('/admin'); if(isMobile) setIsOpen(false); }} 
            style={[styles.menuItem, isOverviewActive && styles.menuItemActive]}
          >
            <Ionicons name="apps" size={22} color={isOverviewActive ? '#3b82f6' : '#9ca3af'} />
            <Text style={[styles.menuLinkText, isOverviewActive && styles.stylesActiveText]} numberOfLines={1}>Tổng quan</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => { router.push('/admin/units'); if(isMobile) setIsOpen(false); }} 
            style={[styles.menuItem, isUnitsActive && styles.menuItemActive]}
          >
            <Ionicons name="folder-open" size={22} color={isUnitsActive ? '#3b82f6' : '#9ca3af'} />
            <Text style={[styles.menuLinkText, isUnitsActive && styles.stylesActiveText]} numberOfLines={1}>Bài học</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <TouchableOpacity onPress={handleLogout} style={[styles.menuItem, { marginTop: 'auto' }]}>
            <Ionicons name="log-out" size={24} color="#ef4444" />
            <Text style={[styles.menuLinkText, { color: '#ef4444' }]} numberOfLines={1}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* 2. VÙNG NỘI DUNG ĐẶT SAU ĐỂ NẰM BÊN PHẢI */}
      <View style={styles.contentBody}>
        {/* Thanh Header phụ hiện nút Menu 3 sọc khi ở Mobile */}
        {isMobile && (
          <View style={styles.mobileHeader}>
            <TouchableOpacity onPress={() => setIsOpen(true)} style={styles.mobileMenuBtn}>
              <Ionicons name="menu" size={28} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.mobileHeaderTitle}>Admin Panel</Text>
          </View>
        )}
        <Slot />
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f3f4f6', flexDirection: 'row' },
  contentBody: { flex: 1, height: '100%', overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 },
  sidebar: { backgroundColor: '#1f2937', paddingVertical: 20, zIndex: 50 },
  sidebarMobileAbsolute: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 260 },
  mobileHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, elevation: 2, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  mobileMenuBtn: { marginRight: 15 },
  mobileHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  brandHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 30, height: 40 },
  brandText: { color: 'white', fontSize: 20, fontWeight: 'bold', flex: 1 },
  toggleBtn: { padding: 5, alignItems: 'center', justifyContent: 'center' },
  menuList: { flex: 1, paddingHorizontal: 10, gap: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, gap: 15, overflow: 'hidden' },
  menuItemActive: { backgroundColor: '#374151' },
  menuLinkText: { color: '#d1d5db', fontSize: 16, fontWeight: '500', flex: 1 },
  stylesActiveText: { color: 'white', fontWeight: 'bold' }
});
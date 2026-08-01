import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Slot, usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Theme } from '@/constants/Theme';
import { styles } from '@/styles/admin/_layout.styles';

const links = [
  { path: '/admin', label: 'Tổng quan', icon: 'view-dashboard' },
  { path: '/admin/curriculum', label: 'Chương trình học', icon: 'book-education' },
  { path: '/admin/users', label: 'Người học', icon: 'account-group' },
  { path: '/admin/media', label: 'Thư viện ảnh', icon: 'image-multiple' },
];

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const mobile = width < 820;
  const [open, setOpen] = useState(false);
  const navigate = (path: string) => { router.push(path as never); setOpen(false); };

  const logout = async () => {
    await AsyncStorage.multiRemove(['userToken', 'userRole', 'userEmail']);
    router.replace('/(auth)/login');
  };

  return <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
    <View style={styles.shell}>
      {mobile && open ? <Pressable accessibilityLabel="Đóng menu" style={styles.overlay} onPress={() => setOpen(false)} /> : null}
      {(!mobile || open) ? <View style={[
        styles.sidebar,
        mobile && styles.mobileSidebar,
        mobile && { paddingBottom: Math.max(15, insets.bottom) },
      ]}>
        <View style={styles.brand}>
          <View style={styles.brandIcon}><MaterialCommunityIcons name="book-open-page-variant" size={24} color="#FFFFFF" /></View>
          <View style={styles.brandCopy}><Text style={styles.brandName}>Fun English</Text><Text style={styles.brandRole}>CURRICULUM ADMIN</Text></View>
          {mobile ? <Pressable accessibilityLabel="Đóng menu" onPress={() => setOpen(false)} style={styles.closeMenu}><MaterialCommunityIcons name="close" size={25} color="#FFFFFF" /></Pressable> : null}
        </View>
        <View style={styles.links}>{links.map((link) => {
          const active = link.path === '/admin' ? pathname === link.path : pathname.startsWith(link.path);
          return <Pressable key={link.path} onPress={() => navigate(link.path)} style={[styles.link, active && styles.linkActive]}>
            <MaterialCommunityIcons name={link.icon as never} size={21} color={active ? Theme.colors.green : '#A9B5BD'} />
            <Text style={[styles.linkText, active && styles.linkTextActive]}>{link.label}</Text>
          </Pressable>;
        })}</View>
        <Pressable accessibilityRole="button" onPress={logout} style={styles.logout}>
          <MaterialCommunityIcons name="logout" size={21} color={Theme.colors.coral} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
      </View> : null}
      <View style={styles.body}>
        {mobile ? <View style={styles.mobileHeader}>
          <Pressable accessibilityLabel="Mở menu quản trị" onPress={() => setOpen(true)} style={styles.menu}>
            <MaterialCommunityIcons name="menu" size={27} color={Theme.colors.ink} />
          </Pressable>
          <Text style={styles.mobileTitle}>Fun English Admin</Text>
        </View> : null}
        <Slot />
      </View>
    </View>
  </SafeAreaView>;
}

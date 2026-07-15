import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Slot, usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Theme } from '@/constants/Theme';

const links = [
  { path: '/admin', label: 'Tong quan', icon: 'view-dashboard' },
  { path: '/admin/curriculum', label: 'Chuong trinh hoc', icon: 'book-education' },
  { path: '/admin/units', label: 'Noi dung cu', icon: 'archive-edit' },
];

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const mobile = width < 820;
  const [open, setOpen] = useState(false);
  const navigate = (path: string) => { router.push(path as never); setOpen(false); };

  return <View style={styles.shell}>
    {mobile && open && <Pressable style={styles.overlay} onPress={() => setOpen(false)} />}
    {(!mobile || open) && <View style={[styles.sidebar, mobile && styles.mobileSidebar]}>
      <View style={styles.brand}><View style={styles.brandIcon}><MaterialCommunityIcons name="book-open-page-variant" size={24} color="#FFFFFF" /></View><View><Text style={styles.brandName}>Fun English</Text><Text style={styles.brandRole}>CURRICULUM ADMIN</Text></View></View>
      <View style={styles.links}>{links.map((link) => {
        const active = link.path === '/admin' ? pathname === link.path : pathname.startsWith(link.path);
        return <Pressable key={link.path} onPress={() => navigate(link.path)} style={[styles.link, active && styles.linkActive]}><MaterialCommunityIcons name={link.icon as never} size={21} color={active ? Theme.colors.green : '#A9B5BD'} /><Text style={[styles.linkText, active && styles.linkTextActive]}>{link.label}</Text></Pressable>;
      })}</View>
      <Pressable style={styles.logout} onPress={async () => { await AsyncStorage.multiRemove(['userToken', 'userRole', 'userEmail']); router.replace('/(auth)/login'); }}><MaterialCommunityIcons name="logout" size={21} color={Theme.colors.coral} /><Text style={styles.logoutText}>Đăng xuất</Text></Pressable>
    </View>}
    <View style={styles.body}>{mobile && <View style={styles.mobileHeader}><Pressable onPress={() => setOpen(true)} style={styles.menu}><MaterialCommunityIcons name="menu" size={27} color={Theme.colors.ink} /></Pressable><Text style={styles.mobileTitle}>Fun English Admin</Text></View>}<Slot /></View>
  </View>;
}

const styles = StyleSheet.create({
  shell: { flex: 1, flexDirection: 'row', backgroundColor: Theme.colors.background }, body: { flex: 1, overflow: 'hidden' }, overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(18,32,40,0.45)', zIndex: 20 },
  sidebar: { width: 248, backgroundColor: '#24323D', padding: 15, zIndex: 30 }, mobileSidebar: { position: 'absolute', left: 0, top: 0, bottom: 0 }, brand: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#3B4A55', marginBottom: 18 }, brandIcon: { width: 42, height: 42, borderRadius: 8, backgroundColor: Theme.colors.greenDark, alignItems: 'center', justifyContent: 'center' }, brandName: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' }, brandRole: { color: '#94A4AD', fontSize: 9, fontWeight: '900', marginTop: 2 },
  links: { flex: 1, gap: 6 }, link: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12, borderRadius: 7 }, linkActive: { backgroundColor: '#354650' }, linkText: { color: '#C3CDD3', fontWeight: '700' }, linkTextActive: { color: '#FFFFFF', fontWeight: '900' }, logout: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12 }, logoutText: { color: '#FFAAA5', fontWeight: '800' },
  mobileHeader: { height: 62, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: Theme.colors.border, paddingHorizontal: 10 }, menu: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, mobileTitle: { color: Theme.colors.ink, fontWeight: '900', fontSize: 17 },
});

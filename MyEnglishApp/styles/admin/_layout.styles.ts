import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#24323D' },
  shell: { flex: 1, flexDirection: 'row', backgroundColor: Theme.colors.background },
  body: { flex: 1, minWidth: 0, overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(18,32,40,0.45)', zIndex: 20 },
  sidebar: { width: 248, backgroundColor: '#24323D', padding: 15, zIndex: 30 },
  mobileSidebar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '82%', maxWidth: 310 },
  brand: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#3B4A55', marginBottom: 18 },
  brandIcon: { width: 42, height: 42, borderRadius: 8, backgroundColor: Theme.colors.greenDark, alignItems: 'center', justifyContent: 'center' },
  brandCopy: { flex: 1 },
  brandName: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  brandRole: { color: '#94A4AD', fontSize: 9, fontWeight: '900', marginTop: 2 },
  closeMenu: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  links: { flex: 1, gap: 6 },
  link: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12, borderRadius: 7 },
  linkActive: { backgroundColor: '#354650' },
  linkText: { color: '#C3CDD3', fontWeight: '700' },
  linkTextActive: { color: '#FFFFFF', fontWeight: '900' },
  logout: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12 },
  logoutText: { color: '#FFAAA5', fontWeight: '800' },
  mobileHeader: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: Theme.colors.border, paddingHorizontal: 10 },
  menu: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  mobileTitle: { color: Theme.colors.ink, fontWeight: '900', fontSize: 17 },
});

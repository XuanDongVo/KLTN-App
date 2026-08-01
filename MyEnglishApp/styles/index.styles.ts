import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
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

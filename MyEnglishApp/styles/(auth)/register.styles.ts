import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  content: { flexGrow: 1, width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: 22, paddingBottom: 30 },
  topBar: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  iconPlaceholder: { width: 44 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandText: { color: Theme.colors.ink, fontSize: 13, fontWeight: '900' },
  artwork: { height: 142, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#EAF7FE', overflow: 'hidden' },
  artworkImage: { width: '100%', height: '100%' },
  eyebrow: { color: Theme.colors.greenDark, fontSize: 11, fontWeight: '900', textAlign: 'center', marginTop: 14 },
  title: { color: Theme.colors.ink, fontSize: 27, fontWeight: '900', textAlign: 'center', marginTop: 3 },
  subtitle: { color: Theme.colors.muted, lineHeight: 21, textAlign: 'center', marginTop: 5, marginBottom: 20 },
  label: { color: Theme.colors.ink, fontWeight: '800', marginBottom: 7 },
  inputShell: { minHeight: 55, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 2, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 13, marginBottom: 14 },
  input: { flex: 1, minHeight: 51, color: Theme.colors.ink, fontSize: 16 },
  passwordToggle: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  errorBanner: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, backgroundColor: '#FFF0EF', marginBottom: 12 },
  error: { flex: 1, color: Theme.colors.coralDark, fontWeight: '700', lineHeight: 19 },
  submit: { minHeight: 56, justifyContent: 'center' },
  switchButton: { minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: 5 },
  switchText: { color: Theme.colors.muted, fontWeight: '700' },
  switchStrong: { color: Theme.colors.blueDark, fontWeight: '900' },
});

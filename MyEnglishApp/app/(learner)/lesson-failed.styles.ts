import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  badge: { width: 126, height: 126, borderRadius: 63, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFEBEB', borderWidth: 7, borderColor: '#FFFFFF', ...Theme.shadow },
  eyebrow: { color: Theme.colors.coral, fontSize: 11, fontWeight: '900', marginTop: 24 },
  title: { color: Theme.colors.ink, fontSize: 32, fontWeight: '900', marginTop: 4 },
  subtitle: { color: Theme.colors.muted, textAlign: 'center', lineHeight: 21, marginTop: 7 },
  bottom: { padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: Theme.colors.border, backgroundColor: '#FFFFFF' },
});

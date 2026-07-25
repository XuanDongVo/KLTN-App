import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  badge: { width: 126, height: 126, borderRadius: 63, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF5CE', borderWidth: 7, borderColor: '#FFFFFF', ...Theme.shadow },
  eyebrow: { color: Theme.colors.greenDark, fontSize: 11, fontWeight: '900', marginTop: 24 },
  title: { color: Theme.colors.ink, fontSize: 32, fontWeight: '900', marginTop: 4 },
  subtitle: { color: Theme.colors.muted, textAlign: 'center', lineHeight: 21, marginTop: 7 },
  stars: { flexDirection: 'row', gap: 4, marginTop: 18 },
  stats: { width: '100%', maxWidth: 420, flexDirection: 'row', gap: 10, marginTop: 24 },
  stat: { flex: 1, minHeight: 108, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF' },
  statValue: { color: Theme.colors.ink, fontSize: 20, fontWeight: '900', marginTop: 4 },
  statLabel: { color: Theme.colors.muted, fontSize: 11, fontWeight: '700', marginTop: 2 },
  bottom: { padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: Theme.colors.border, backgroundColor: '#FFFFFF' },
});

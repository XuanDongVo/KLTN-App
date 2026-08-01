import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background }, header: { minHeight: 74, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: Theme.colors.border, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9 }, back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, eyebrow: { color: Theme.colors.violet, fontSize: 10, fontWeight: '900' }, title: { color: Theme.colors.ink, fontSize: 20, fontWeight: '900' }, content: { padding: 18, paddingBottom: 38, maxWidth: 620, width: '100%', alignSelf: 'center' }, intro: { flexDirection: 'row', gap: 10, backgroundColor: '#F0EDFF', borderRadius: 8, padding: 13, marginBottom: 16, alignItems: 'center' }, introText: { flex: 1, color: Theme.colors.ink, fontWeight: '700', lineHeight: 19 },
});

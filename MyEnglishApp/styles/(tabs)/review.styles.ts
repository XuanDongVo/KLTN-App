import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  header: { minHeight: 84, paddingHorizontal: 20, justifyContent: 'center', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  eyebrow: { color: Theme.colors.violet, fontSize: 11, fontWeight: '900' },
  title: { color: Theme.colors.ink, fontSize: 24, fontWeight: '900', marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 42, maxWidth: 680, width: '100%', alignSelf: 'center', gap: 10 },
  empty: { minHeight: 360, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyIcon: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEEAFE' },
  emptyTitle: { color: Theme.colors.ink, fontSize: 21, fontWeight: '900', marginTop: 18 },
  emptyText: { color: Theme.colors.muted, textAlign: 'center', lineHeight: 20, marginTop: 6 },
  primaryButton: { minHeight: 48, marginTop: 20, paddingHorizontal: 18, borderRadius: 8, flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: Theme.colors.greenDark },
  primaryText: { color: '#FFFFFF', fontWeight: '900' },
  lesson: { minHeight: 78, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderBottomWidth: 3, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF' },
  lessonIcon: { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  completedIcon: { backgroundColor: '#E6F8E9' },
  progressIcon: { backgroundColor: '#EAF7FE' },
  lessonCopy: { flex: 1 },
  lessonTitle: { color: Theme.colors.ink, fontSize: 16, fontWeight: '900' },
  lessonMeta: { color: Theme.colors.muted, fontSize: 11, marginTop: 4 },
  stars: { flexDirection: 'row' },
  error: { color: Theme.colors.coralDark, fontWeight: '700', textAlign: 'center', marginTop: 30 },
});

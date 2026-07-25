import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalContent: { flexShrink: 1, width: '100%', maxWidth: 700, maxHeight: '90%', backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  modalTitle: { color: Theme.colors.ink, fontSize: 18, fontWeight: '900' },
  close: { padding: 4 },
  modalBody: { flexShrink: 1, backgroundColor: '#F8FAFB' },
  scrollContent: { padding: 16 },
  error: { flexDirection: 'row', gap: 8, alignItems: 'center', borderWidth: 1, borderColor: '#FFD0CD', borderRadius: 8, backgroundColor: '#FFF0EF', padding: 11, marginBottom: 16 },
  errorText: { flex: 1, color: Theme.colors.coralDark, fontWeight: '700' },
  loading: { minHeight: 200, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { minWidth: 140, flexGrow: 1, flexBasis: 160, maxWidth: 220, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  image: { width: '100%', aspectRatio: 16 / 10, backgroundColor: '#EFF3F5' },
  cardCopy: { padding: 8 },
  fileName: { color: Theme.colors.ink, fontWeight: '900', fontSize: 11 },
  meta: { color: Theme.colors.muted, fontSize: 9, marginTop: 4 },
  empty: { minHeight: 200, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { color: Theme.colors.ink, fontSize: 15, fontWeight: '900', marginTop: 10, textAlign: 'center' },
});

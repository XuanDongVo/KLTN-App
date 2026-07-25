import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  root: { gap: 10, borderTopWidth: 1, borderTopColor: Theme.colors.border, paddingTop: 13 },
  heading: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  headingActions: { flexDirection: 'row', gap: 8 },
  title: { color: Theme.colors.greenDark, fontWeight: '900', fontSize: 13 },
  upload: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 7, backgroundColor: Theme.colors.blueDark, paddingHorizontal: 12 },
  pickerButton: { backgroundColor: '#F0F5F9', borderWidth: 1, borderColor: '#D9E2E8' },
  uploadText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  pickerText: { color: Theme.colors.blueDark },
  disabled: { opacity: 0.55 },
  preview: { minHeight: 110, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#F8FAFB', padding: 9 },
  image: { width: 104, height: 92, borderRadius: 7, backgroundColor: '#FFFFFF' },
  previewCopy: { flex: 1, minWidth: 0 },
  path: { color: Theme.colors.ink, fontWeight: '700', fontSize: 11 },
  dimensions: { color: Theme.colors.muted, marginTop: 5, fontSize: 10 },
  field: { gap: 5 },
  label: { color: Theme.colors.ink, fontSize: 12, fontWeight: '900' },
  input: { minHeight: 50, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 7, backgroundColor: '#FFFFFF', paddingHorizontal: 12, color: Theme.colors.ink, fontSize: 15 },
  columns: { flexDirection: 'row', gap: 10 },
  column: { flex: 1 },
});

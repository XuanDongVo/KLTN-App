import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Theme.colors.ink, marginBottom: 8, textTransform: 'uppercase' },
  fieldHint: { fontSize: 13, color: Theme.colors.muted, marginBottom: 8 },
  input: { backgroundColor: Theme.colors.background, borderWidth: 1, borderColor: '#D3DCE6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: Theme.colors.ink },
  inputError: { borderColor: Theme.colors.coral },
  multiline: { height: 100 },
  fieldError: { fontSize: 12, color: Theme.colors.coral, marginTop: 4 },
  listItem: { backgroundColor: '#F8F9FA', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E9F0' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listTitle: { fontSize: 14, fontWeight: '700', color: Theme.colors.ink },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: '#F0E6FF', borderRadius: 8, marginTop: 4, marginBottom: 16 },
  addText: { marginLeft: 8, fontSize: 14, fontWeight: '700', color: Theme.colors.violet },
  segment: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: Theme.colors.background, borderWidth: 1, borderColor: '#D3DCE6', borderRadius: 8, alignItems: 'center' },
  segmentActive: { backgroundColor: '#E0F2F1', borderColor: Theme.colors.green },
  segmentText: { fontSize: 14, fontWeight: '600', color: Theme.colors.muted },
  segmentTextActive: { color: Theme.colors.greenDark },
  iconButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.background, borderWidth: 1, borderColor: '#D3DCE6' },
  iconButtonCompact: { width: 28, height: 28, borderRadius: 14 },
  disabled: { opacity: 0.5 },
});

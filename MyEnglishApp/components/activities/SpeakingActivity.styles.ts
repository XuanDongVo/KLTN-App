import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 14 },
  sampleButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 2, borderColor: '#B9E3F8', backgroundColor: '#EAF7FE' },
  sampleText: { color: Theme.colors.blueDark, fontSize: 15, fontWeight: '900' },
  micCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#FFF0EF', borderWidth: 3, borderColor: '#FFD0CD', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  micRecording: { backgroundColor: Theme.colors.coral, borderColor: Theme.colors.coralDark },
  phrase: { color: Theme.colors.ink, fontSize: 24, lineHeight: 32, fontWeight: '900', textAlign: 'center' },
  helper: { minHeight: 40, color: Theme.colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  reviewRow: { width: '100%', flexDirection: 'row', gap: 10 },
  reviewButton: { flex: 1, minHeight: 54, borderRadius: 8, borderWidth: 2, borderColor: '#B9E3F8', backgroundColor: '#EAF7FE', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  reviewText: { color: Theme.colors.blueDark, fontWeight: '900' },
  submitButton: { flex: 1.4, minHeight: 54, borderRadius: 8, backgroundColor: Theme.colors.green, borderBottomWidth: 4, borderBottomColor: Theme.colors.greenDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  submitText: { color: '#FFFFFF', fontWeight: '900' },
  note: { color: Theme.colors.muted, fontSize: 11, lineHeight: 16, textAlign: 'center' },
});

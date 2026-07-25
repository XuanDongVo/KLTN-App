import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 15 },
  listenButton: { width: 92, height: 92, borderRadius: 46, backgroundColor: Theme.colors.blue, borderBottomWidth: 6, borderBottomColor: Theme.colors.blueDark, alignItems: 'center', justifyContent: 'center' },
  helper: { color: Theme.colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  choices: { width: '100%', gap: 10 },
  choice: { minHeight: 60, borderRadius: 8, borderWidth: 2, borderBottomWidth: 4, borderColor: Theme.colors.border, backgroundColor: '#FFFFFF', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  choiceSelected: { borderColor: Theme.colors.green, backgroundColor: '#F0FBF2' },
  choiceText: { color: Theme.colors.ink, fontSize: 17, fontWeight: '800' },
});

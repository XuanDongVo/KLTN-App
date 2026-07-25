import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  button: { minHeight: 52, borderRadius: 8, borderBottomWidth: 4, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  pressed: { transform: [{ translateY: 3 }], borderBottomWidth: 1 },
  label: { color: '#FFFFFF', fontWeight: '900', fontSize: 15, textAlign: 'center' },
  outlineLabel: { color: Theme.colors.ink },
});

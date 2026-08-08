import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 42 },
  value: { fontSize: 16, fontWeight: '800' },
});

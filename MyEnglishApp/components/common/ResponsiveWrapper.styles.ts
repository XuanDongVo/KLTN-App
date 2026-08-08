import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, width: '100%' },
  fixedContent: { flex: 1, width: '100%' },
  innerContent: { width: '100%', flex: 1 },
  baseContainer: { flex: 1 },
  mobilePadding: { padding: 15 },
  desktopPadding: { padding: 25 }
});

import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  row: { width: '100%', alignItems: 'center', minHeight: 150 }, left: { alignItems: 'flex-start', paddingLeft: '21%' }, right: { alignItems: 'flex-end', paddingRight: '21%' },
  wrapper: { width: 132, alignItems: 'center' }, pressed: { transform: [{ translateY: 3 }] },
  currentLabel: { backgroundColor: Theme.colors.ink, color: '#FFFFFF', fontWeight: '900', fontSize: 10, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginBottom: 8 },
  nodeShadow: { width: 78, height: 84, borderRadius: 39, justifyContent: 'flex-start' }, node: { width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: 'rgba(255,255,255,0.34)' },
  title: { marginTop: 8, textAlign: 'center', color: Theme.colors.ink, fontWeight: '800', fontSize: 14, lineHeight: 18 }, lockedTitle: { color: Theme.colors.muted }, stars: { flexDirection: 'row', marginTop: 2 },
});

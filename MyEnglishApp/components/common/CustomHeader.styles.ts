import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white', gap: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { width: 38, height: 38, backgroundColor: '#f3f4f6', borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', flex: 1 },
});

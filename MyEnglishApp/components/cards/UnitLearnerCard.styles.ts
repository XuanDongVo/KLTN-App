import { StyleSheet, Platform, Dimensions } from 'react-native';
import { Theme } from '@/constants/Theme';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  cardContainer: {
    width: Platform.OS === 'web' ? 320 : width * 0.75,
    height: 320,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeLearn: { backgroundColor: '#eff6ff' },
  badgeReview: { backgroundColor: '#ecfdf5' },
  statusText: { fontSize: 12, fontWeight: '700', color: '#3b82f6' },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  actionBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnLearn: { backgroundColor: '#3b82f6' },
  btnReview: { backgroundColor: '#10b981' },
  actionBtnText: { color: 'white', fontSize: 15, fontWeight: 'bold' }
});

import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 360,
  },
  card: {
    width: '100%',
    minHeight: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: Theme.colors.border,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    backgroundColor: '#F8FBFF',
    borderColor: '#B9E3F8',
  },
  cardBack: {
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    color: Theme.colors.ink,
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    marginVertical: 12,
  },
  tapHint: {
    color: Theme.colors.blueDark,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 20,
    opacity: 0.6,
  },
  heroImage: {
    width: '100%',
    maxHeight: 200,
    borderRadius: 8,
    backgroundColor: '#E8EEF2',
  },
  meaning: {
    color: Theme.colors.violet,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  actions: {
    gap: 14,
    minHeight: 120, // Keep space for the buttons so it doesn't jump
  },
  listenButton: {
    minHeight: 52,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    borderRadius: 26,
    backgroundColor: '#EAF7FE',
    borderWidth: 1,
    borderColor: '#B9E3F8',
  },
  listenText: {
    color: Theme.colors.blueDark,
    fontWeight: '900',
    fontSize: 16,
  },
  helper: {
    color: Theme.colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 20,
  },
});

import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
  },
  card: {
    width: '100%',
    minHeight: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 5,
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    borderColor: '#B9E3F8',
    backgroundColor: '#F8FBFF',
  },
  cardBack: {
    borderColor: '#C7D1D7',
    backgroundColor: '#FFFFFF',
  },
  vocabularyWord: { 
    color: Theme.colors.ink, 
    fontSize: 34, 
    fontWeight: '900', 
    textAlign: 'center' 
  },
  tapHint: { 
    color: Theme.colors.blueDark, 
    fontSize: 14, 
    fontWeight: '800', 
    marginTop: 20, 
    opacity: 0.6 
  },
  wordSpeaker: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: Theme.colors.blue,
    marginBottom: 12
  },
  meaningDivider: { 
    width: 52, 
    height: 3, 
    borderRadius: 2, 
    backgroundColor: Theme.colors.yellow, 
    marginVertical: 12 
  },
  vocabularyMeaning: { 
    color: Theme.colors.violet, 
    fontSize: 21, 
    fontWeight: '900', 
    textAlign: 'center' 
  },
  vocabularyExample: { 
    color: Theme.colors.muted, 
    lineHeight: 20, 
    marginTop: 8, 
    textAlign: 'center' 
  }
});

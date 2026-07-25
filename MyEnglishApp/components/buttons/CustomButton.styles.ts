import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';
import { AppColors } from '../../constants/Colors';

export const styles = StyleSheet.create({
  btn: {
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  outline: {
    borderWidth: 2,
    borderColor: AppColors.border,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});

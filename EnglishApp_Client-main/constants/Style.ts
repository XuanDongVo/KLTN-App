import { StyleSheet } from 'react-native';
import { AppColors } from './Colors';

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
    paddingHorizontal: 25,
  },
  input: {
    height: 55,
    backgroundColor: '#F7F7F7',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    color: AppColors.grey,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4B4B4B',
    textAlign: 'center',
    marginVertical: 30,
  }
});
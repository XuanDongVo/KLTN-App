import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { AppColors } from '../../constants/Colors';

interface Props {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'social' | 'outline';
  bgColor?: string;
}

export const CustomButton = ({ title, onPress, type = 'primary', bgColor }: Props) => {
  return (
    <TouchableOpacity 
      style={[
        styles.btn, 
        type === 'outline' ? styles.outline : { backgroundColor: bgColor || AppColors.primary }
      ]} 
      onPress={onPress}
    >
      <Text style={[styles.text, type === 'outline' && { color: AppColors.grey }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { AppColors } from '../../constants/Colors';
import { styles } from './CustomButton.styles';

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

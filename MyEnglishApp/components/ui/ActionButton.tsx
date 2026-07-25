import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Theme } from '@/constants/Theme';
import { styles } from './ActionButton.styles';

type Props = { label: string; onPress: () => void; disabled?: boolean; color?: string; icon?: string; outline?: boolean };

export function ActionButton({ label, onPress, disabled, color = Theme.colors.green, icon, outline }: Props) {
  const backgroundColor = outline ? '#FFFFFF' : disabled ? '#CBD5DB' : color;
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor, borderColor: outline ? Theme.colors.border : darken(backgroundColor) }, pressed && !disabled && styles.pressed]}>
    {icon && <MaterialCommunityIcons name={icon as never} size={21} color={outline ? Theme.colors.ink : '#FFFFFF'} />}
    <Text style={[styles.label, outline && styles.outlineLabel]}>{label}</Text>
  </Pressable>;
}

function darken(color: string) {
  if (!color.startsWith('#') || color.length !== 7) return color;
  return `#${[1, 3, 5].map((index) => Math.max(0, parseInt(color.slice(index, index + 2), 16) - 30).toString(16).padStart(2, '0')).join('')}`;
}

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Theme } from '@/constants/Theme';

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

const styles = StyleSheet.create({
  button: { minHeight: 52, borderRadius: 8, borderBottomWidth: 4, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  pressed: { transform: [{ translateY: 3 }], borderBottomWidth: 1 },
  label: { color: '#FFFFFF', fontWeight: '900', fontSize: 15, textAlign: 'center' },
  outlineLabel: { color: Theme.colors.ink },
});

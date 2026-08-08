import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/Theme';
import { Lesson } from '@/types/learning';
import { styles } from './LessonPathNode.styles';

type Props = { lesson: Lesson; locked: boolean; completed: boolean; current: boolean; side: 'left' | 'center' | 'right'; stars: number; onPress: () => void };

export function LessonPathNode({ lesson, locked, completed, current, side, stars, onPress }: Props) {
  const color = locked ? '#B9C5CC' : lesson.color;
  return <View style={[styles.row, side === 'left' && styles.left, side === 'right' && styles.right]}><Pressable onPress={onPress} disabled={locked} accessibilityRole="button" accessibilityLabel={`${lesson.title}${locked ? ', đang khóa' : ''}`} style={({ pressed }) => [styles.wrapper, pressed && !locked && styles.pressed]}>
    {current && <Text style={styles.currentLabel}>BÀI TIẾP THEO</Text>}
    <View style={[styles.nodeShadow, { backgroundColor: locked ? '#94A4AD' : darken(color) }]}><View style={[styles.node, { backgroundColor: color }]}><MaterialCommunityIcons name={(locked ? 'lock' : completed ? 'check-bold' : lesson.icon) as never} size={30} color="#FFFFFF" /></View></View>
    <Text style={[styles.title, locked && styles.lockedTitle]} numberOfLines={2}>{lesson.title}</Text>
    {completed && <View style={styles.stars}>{[1, 2, 3].map((star) => <MaterialCommunityIcons key={star} name="star" size={14} color={star <= stars ? Theme.colors.yellow : '#D7E0E5'} />)}</View>}
  </Pressable></View>;
}

function darken(color: string) {
  const value = color.replace('#', '');
  const channels = [0, 2, 4].map((index) => Math.max(0, parseInt(value.slice(index, index + 2), 16) - 35).toString(16).padStart(2, '0'));
  return `#${channels.join('')}`;
}

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/Theme';
import { useLearning } from '@/context/LearningContext';

export function StatusStrip() {
  const { state } = useLearning();
  const items = [
    { icon: 'fire', value: state.streak, color: Theme.colors.coral },
    { icon: 'star-four-points', value: state.xp, color: Theme.colors.yellowDark },
    { icon: 'heart', value: state.hearts, color: Theme.colors.coral },
  ] as const;
  return <View style={styles.container}>{items.map((item) => <View key={item.icon} style={styles.item}><MaterialCommunityIcons name={item.icon} size={22} color={item.color} /><Text style={[styles.value, { color: item.color }]}>{item.value}</Text></View>)}</View>;
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 42 },
  value: { fontSize: 16, fontWeight: '800' },
});

import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Theme } from '@/constants/Theme';
import { Field, IconButton, adminStyles } from '../AdminShared';
import { styles } from './FormStyles';

export function MatchPairsForm({ data, onChange }: any) {
  const pairs = data.pairs ?? [];
  return <View>
    <Text style={adminStyles.fieldLabel}>Danh sách cặp từ</Text>
    <Text style={adminStyles.fieldHint}>Học sinh sẽ phải nối Tiếng Anh với Tiếng Việt tương ứng.</Text>
    {pairs.map((pair: any, i: number) => (
      <View key={i} style={styles.listItem}>
        <View style={styles.listHeader}><Text style={styles.listTitle}>Cặp số {i + 1}</Text><IconButton icon="delete" label="Xóa" danger compact onPress={() => { const next = [...pairs]; next.splice(i, 1); onChange({ ...data, pairs: next }); }} /></View>
        <Field label="Tiếng Anh" placeholder="VD: Cat" value={pair.left} onChangeText={(t: string) => { const next = [...pairs]; next[i].left = t; onChange({ ...data, pairs: next }); }} />
        <Field label="Nghĩa Tiếng Việt" placeholder="VD: Con mèo" value={pair.right} onChangeText={(t: string) => { const next = [...pairs]; next[i].right = t; onChange({ ...data, pairs: next }); }} />
      </View>
    ))}
    <Pressable style={styles.addButton} onPress={() => onChange({ ...data, pairs: [...pairs, { left: '', right: '' }] })}><MaterialCommunityIcons name="plus" size={20} color={Theme.colors.violet} /><Text style={styles.addText}>Thêm cặp</Text></Pressable>
  </View>;
}


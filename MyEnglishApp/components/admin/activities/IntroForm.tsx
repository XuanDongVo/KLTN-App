import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Theme } from '@/constants/Theme';
import { Field, IconButton, adminStyles } from '../AdminShared';
import { styles } from './FormStyles';

export function IntroForm({ data, onChange }: any) {
  const items = data.items ?? [];
  return <View>
    <Text style={adminStyles.fieldLabel}>Danh sách từ vựng</Text>
    {items.map((item: any, i: number) => (
      <View key={i} style={styles.listItem}>
        <View style={styles.listHeader}><Text style={styles.listTitle}>Từ số {i + 1}</Text><IconButton icon="delete" label="Xóa" danger compact onPress={() => { const next = [...items]; next.splice(i, 1); onChange({ ...data, items: next }); }} /></View>
        <Field label="Tiếng Anh" placeholder="VD: Dog" value={item.word} onChangeText={(t: string) => { const next = [...items]; next[i].word = t; onChange({ ...data, items: next }); }} />
        <Field label="Tiếng Việt" placeholder="VD: Con chó" value={item.meaning} onChangeText={(t: string) => { const next = [...items]; next[i].meaning = t; onChange({ ...data, items: next }); }} />
        <Field label="Ví dụ (Tùy chọn)" placeholder="VD: The dog is barking." value={item.example} onChangeText={(t: string) => { const next = [...items]; next[i].example = t; onChange({ ...data, items: next }); }} />
      </View>
    ))}
    <Pressable style={styles.addButton} onPress={() => onChange({ ...data, items: [...items, { word: '', meaning: '', example: '' }] })}><MaterialCommunityIcons name="plus" size={20} color={Theme.colors.violet} /><Text style={styles.addText}>Thêm từ vựng</Text></Pressable>
  </View>;
}


import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Theme } from '@/constants/Theme';
import { Field, IconButton, adminStyles } from '../AdminShared';
import { styles } from './FormStyles';

export function TypeAnswerForm({ data, onChange }: any) {
  const acceptedAnswers = data.acceptedAnswers ?? [];
  return <View>
    <Field label="Gợi ý trong ô nhập" placeholder="VD: My name ..." value={data.placeholder ?? ''} onChangeText={(t: string) => onChange({ ...data, placeholder: t })} />
    <Text style={adminStyles.fieldLabel}>Các đáp án được chấp nhận</Text>
    {acceptedAnswers.map((ans: string, i: number) => (
      <View key={i} style={[styles.listItem, { paddingBottom: 12 }]}>
        <View style={styles.listHeader}><Text style={styles.listTitle}>Đáp án {i + 1}</Text><IconButton icon="delete" label="Xóa" danger compact onPress={() => { const next = [...acceptedAnswers]; next.splice(i, 1); onChange({ ...data, acceptedAnswers: next }); }} /></View>
        <TextInput style={adminStyles.input} placeholder="VD: My name is Ben." value={ans} onChangeText={(t: string) => { const next = [...acceptedAnswers]; next[i] = t; onChange({ ...data, acceptedAnswers: next }); }} />
      </View>
    ))}
    <Pressable style={styles.addButton} onPress={() => onChange({ ...data, acceptedAnswers: [...acceptedAnswers, ''] })}><MaterialCommunityIcons name="plus" size={20} color={Theme.colors.violet} /><Text style={styles.addText}>Thêm đáp án</Text></Pressable>
  </View>;
}


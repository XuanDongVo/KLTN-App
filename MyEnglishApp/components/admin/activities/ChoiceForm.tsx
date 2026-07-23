import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Theme } from '@/constants/Theme';
import { Field, IconButton, adminStyles } from '../AdminShared';
import { styles } from './FormStyles';

export function ChoiceForm({ data, onChange }: any) {
  const options = data.options ?? [];
  const correctId = data.correctId ?? '';
  return <View>
    <Text style={adminStyles.fieldLabel}>Các đáp án lựa chọn</Text>
    {options.map((opt: any, i: number) => (
      <View key={i} style={styles.listItem}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Đáp án {opt.id.toUpperCase()}</Text>
          <IconButton icon="delete" label="Xóa" danger compact onPress={() => { 
            const next = [...options]; 
            next.splice(i, 1); 
            let nextCorrectId = correctId;
            if (correctId === opt.id) {
              nextCorrectId = next.length > 0 ? next[0].id : '';
            }
            onChange({ ...data, options: next, correctId: nextCorrectId }); 
          }} />
        </View>
        <Field label="Nội dung hiển thị" placeholder="Nhập đáp án" value={opt.label} onChangeText={(t: string) => { 
          const next = [...options]; 
          next[i] = { ...next[i], label: t }; 
          onChange({ ...data, options: next }); 
        }} />
        <Pressable onPress={() => onChange({ ...data, correctId: opt.id })} style={[styles.segment, correctId === opt.id && styles.segmentActive, { marginTop: 8 }]}>
          <Text style={[styles.segmentText, correctId === opt.id && styles.segmentTextActive]}>
            {correctId === opt.id ? 'Đang chọn làm Đáp án đúng' : 'Chọn làm Đáp án đúng'}
          </Text>
        </Pressable>
      </View>
    ))}
    <Pressable style={styles.addButton} onPress={() => { 
      const maxCode = options.reduce((max: number, o: any) => Math.max(max, o.id.charCodeAt(0)), 96);
      const nextId = String.fromCharCode(maxCode + 1); 
      onChange({ ...data, options: [...options, { id: nextId, label: '' }] }); 
    }}>
      <MaterialCommunityIcons name="plus" size={20} color={Theme.colors.violet} />
      <Text style={styles.addText}>Thêm đáp án</Text>
    </Pressable>
  </View>;
}

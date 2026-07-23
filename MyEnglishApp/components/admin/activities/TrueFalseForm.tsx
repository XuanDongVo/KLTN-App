import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Theme } from '@/constants/Theme';
import { Field, IconButton, adminStyles } from '../AdminShared';
import { styles } from './FormStyles';

export function TrueFalseForm({ data, onChange }: any) {
  return <View>
    <Field label="Nội dung nhận định" placeholder="VD: The sun rises in the west." value={data.statement ?? ''} onChangeText={(t: string) => onChange({ ...data, statement: t })} multiline />
    <Text style={adminStyles.fieldLabel}>Đáp án đúng</Text>
    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
      <Pressable onPress={() => onChange({ ...data, isTrue: true })} style={[styles.segment, data.isTrue && styles.segmentActive, { flex: 1 }]}><Text style={[styles.segmentText, data.isTrue && styles.segmentTextActive]}>Đúng (True)</Text></Pressable>
      <Pressable onPress={() => onChange({ ...data, isTrue: false })} style={[styles.segment, !data.isTrue && styles.segmentActive, { flex: 1 }]}><Text style={[styles.segmentText, !data.isTrue && styles.segmentTextActive]}>Sai (False)</Text></Pressable>
    </View>
  </View>;
}


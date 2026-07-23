import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Theme } from '@/constants/Theme';
import { Field, IconButton, adminStyles } from '../AdminShared';
import { styles } from './FormStyles';

export function WordOrderForm({ data, onChange }: any) {
  return <View>
    <Field label="Câu đúng hoàn chỉnh" hint="Nhập câu hoàn chỉnh. Học sinh sẽ phải xếp lại các từ bị xáo trộn." placeholder="VD: I have an apple." value={data.correctSentence ?? ''} onChangeText={(t: string) => onChange({ ...data, correctSentence: t })} multiline />
  </View>;
}


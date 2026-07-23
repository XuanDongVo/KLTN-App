import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Theme } from '@/constants/Theme';
import { Field, IconButton, adminStyles } from '../AdminShared';
import { styles } from './FormStyles';

export function SpeakForm({ data, onChange }: any) {
  return <View>
    <Field label="Câu mẫu cần đọc" placeholder="VD: I go to school every day." value={data.modelText ?? ''} onChangeText={(t: string) => onChange({ ...data, modelText: t })} multiline />
  </View>;
}


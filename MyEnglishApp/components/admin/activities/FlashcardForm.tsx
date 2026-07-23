import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Theme } from '@/constants/Theme';
import { Field, IconButton, adminStyles } from '../AdminShared';
import { styles } from './FormStyles';

export function FlashcardForm({ data, onChange }: any) {
  return <View>
    <Field label="Từ vựng (Tiếng Anh)" placeholder="VD: Apple" value={data.term ?? ''} onChangeText={(t: string) => onChange({ ...data, term: t })} />
    <Field label="Nghĩa tiếng Việt" placeholder="VD: Quả táo" value={data.meaning ?? ''} onChangeText={(t: string) => onChange({ ...data, meaning: t })} />
  </View>;
}


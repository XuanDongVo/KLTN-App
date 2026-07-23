import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Theme } from '@/constants/Theme';
import { Field, IconButton, adminStyles } from '../AdminShared';
import { styles } from './FormStyles';
import { adminCurriculumService } from '@/services/adminCurriculumService';

export function ChoiceForm({ data, onChange, mediaPath }: any) {
  const options = data.options ?? [];
  const correctId = data.correctId ?? '';
  const [generating, setGenerating] = useState(false);

  const handleAIGenerate = async () => {
    if (!mediaPath) return;
    setGenerating(true);
    try {
      const res = await adminCurriculumService.generateImageCaption(mediaPath);
      const newOptions = [{ id: 'a', label: res.caption }];
      const distractors = res.objects.sort(() => 0.5 - Math.random()).slice(0, 3);
      const chars = ['b', 'c', 'd'];
      distractors.forEach((obj: string, idx: number) => {
        if (chars[idx]) newOptions.push({ id: chars[idx], label: obj });
      });
      if (newOptions.length < 2) newOptions.push({ id: 'b', label: '' });
      onChange({ ...data, options: newOptions, correctId: 'a' });
    } catch (e: any) {
      Alert.alert('Lỗi AI', e.message || 'Không thể tạo đáp án.');
    } finally {
      setGenerating(false);
    }
  };
  return <View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={adminStyles.fieldLabel}>Các đáp án lựa chọn</Text>
      {mediaPath && <Pressable onPress={handleAIGenerate} disabled={generating} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E5F0FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
        {generating ? <ActivityIndicator size="small" color={Theme.colors.blueDark} style={{ marginRight: 6 }} /> : <Text style={{ fontSize: 16, marginRight: 4 }}>✨</Text>}
        <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.blueDark }}>{generating ? 'Đang tạo...' : 'AI Sinh Đáp Án'}</Text>
      </Pressable>}
    </View>
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

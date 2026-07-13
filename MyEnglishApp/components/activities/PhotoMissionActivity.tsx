import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { useLearning } from '@/context/LearningContext';
import { createImageCaption } from '@/services/imageCaptionService';
import { CaptionResult } from '@/types/learning';

type Props = { onComplete?: () => void };

export function PhotoMissionActivity({ onComplete }: Props) {
  const { recordCaption } = useLearning();
  const [uri, setUri] = useState<string>();
  const [caption, setCaption] = useState<CaptionResult>();
  const [loading, setLoading] = useState(false);

  const choose = async (source: 'camera' | 'gallery') => {
    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Cần quyền máy ảnh', 'Hãy cho phép truy cập máy ảnh để làm nhiệm vụ này.');
        return;
      }
    }
    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true });
    if (!result.canceled) {
      setUri(result.assets[0].uri);
      setCaption(undefined);
    }
  };

  const discover = async () => {
    if (!uri) return;
    setLoading(true);
    try {
      const result = await createImageCaption(uri);
      setCaption(result);
      await recordCaption();
    } catch {
      Alert.alert('Chưa nhận diện được', 'Thử lại với ảnh rõ và đủ sáng hơn nhé.');
    } finally {
      setLoading(false);
    }
  };

  if (caption) return <View style={styles.result}>
    {uri && <Image source={{ uri }} style={styles.preview} />}
    <View style={styles.captionIcon}><MaterialCommunityIcons name="creation" size={26} color={Theme.colors.violet} /></View>
    <Text style={styles.smallLabel}>AI CAPTION</Text>
    <Text style={styles.caption}>{caption.caption}</Text>
    <Text style={styles.translation}>Hãy nghe và đọc to câu tiếng Anh này một lần.</Text>
    <Pressable style={styles.listenCaption} onPress={() => Speech.speak(caption.caption, { language: 'en-US', rate: 0.75 })}><MaterialCommunityIcons name="volume-high" size={22} color={Theme.colors.blueDark} /><Text style={styles.listenCaptionText}>Nghe caption</Text></Pressable>
    <ActionButton label={onComplete ? 'Đã đọc xong' : 'Thử ảnh khác'} icon={onComplete ? 'check' : 'camera-retake'} onPress={() => onComplete ? onComplete() : setCaption(undefined)} />
  </View>;

  return <View style={styles.container}>
    {uri ? <Image source={{ uri }} style={styles.preview} /> : <View style={styles.placeholder}><MaterialCommunityIcons name="image-plus" size={54} color={Theme.colors.blue} /><Text style={styles.placeholderText}>Chụp hoặc chọn một đồ vật an toàn, rõ nét</Text></View>}
    <View style={styles.actions}>
      <Pressable style={styles.sourceButton} onPress={() => choose('camera')}><MaterialCommunityIcons name="camera" size={25} color={Theme.colors.blueDark} /><Text style={styles.sourceLabel}>Chụp ảnh</Text></Pressable>
      <Pressable style={styles.sourceButton} onPress={() => choose('gallery')}><MaterialCommunityIcons name="image-multiple" size={25} color={Theme.colors.violet} /><Text style={styles.sourceLabel}>Thư viện</Text></Pressable>
    </View>
    {loading ? <View style={styles.loading}><ActivityIndicator color={Theme.colors.green} /><Text style={styles.loadingText}>Đang khám phá bức ảnh...</Text></View> : <ActionButton label="Tạo caption tiếng Anh" icon="creation" disabled={!uri} onPress={discover} />}
    <Text style={styles.privacy}>Ảnh chỉ được gửi để tạo caption và không được chia sẻ công khai.</Text>
  </View>;
}

const styles = StyleSheet.create({
  container: { gap: 14 }, result: { alignItems: 'center', gap: 10 },
  preview: { width: '100%', aspectRatio: 4 / 3, borderRadius: 8, backgroundColor: '#E8EEF2' },
  placeholder: { width: '100%', aspectRatio: 4 / 3, borderRadius: 8, borderWidth: 2, borderStyle: 'dashed', borderColor: '#BFD9E8', backgroundColor: '#EFF9FE', alignItems: 'center', justifyContent: 'center', padding: 30, gap: 12 },
  placeholderText: { color: Theme.colors.muted, textAlign: 'center', fontWeight: '700', lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10 }, sourceButton: { flex: 1, minHeight: 64, borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: '#FFFFFF', borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 3 }, sourceLabel: { color: Theme.colors.ink, fontWeight: '800' },
  loading: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }, loadingText: { color: Theme.colors.muted, fontWeight: '700' },
  privacy: { color: Theme.colors.muted, fontSize: 11, textAlign: 'center', lineHeight: 16 }, captionIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#F0EDFF', alignItems: 'center', justifyContent: 'center', marginTop: -26 },
  smallLabel: { color: Theme.colors.violet, fontSize: 11, fontWeight: '900' }, caption: { color: Theme.colors.ink, fontSize: 23, lineHeight: 30, fontWeight: '900', textAlign: 'center' }, translation: { color: Theme.colors.muted, marginBottom: 4 },
  listenCaption: { minHeight: 48, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#EAF7FE', borderWidth: 1, borderColor: '#B9E3F8', flexDirection: 'row', alignItems: 'center', gap: 8 }, listenCaptionText: { color: Theme.colors.blueDark, fontWeight: '900' },
});

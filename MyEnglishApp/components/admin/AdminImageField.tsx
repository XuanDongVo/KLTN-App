import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Theme } from '@/constants/Theme';
import { pickAndUploadAdminImage } from '@/services/adminMediaUpload';
import type { BackendMedia } from '@/types/backendCurriculum';
import { MediaPickerModal } from './MediaPickerModal';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '') ?? '';

export function AdminImageField({ value, onChange }: { value: BackendMedia; onChange: (value: BackendMedia) => void }) {
  const [uploading, setUploading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const uri = value.path.startsWith('/') ? `${API_URL}${value.path}` : value.path;

  const upload = async () => {
    setUploading(true);
    try {
      const asset = await pickAndUploadAdminImage();
      if (asset) onChange({ path: asset.secureUrl, width: asset.width, height: asset.height, alt: value.alt });
    } catch (reason) {
      Alert.alert('Không tải được ảnh', reason instanceof Error ? reason.message : 'Đã xảy ra lỗi không xác định.');
    } finally {
      setUploading(false);
    }
  };

  return <View style={styles.root}>
    <View style={styles.heading}>
      <Text style={styles.title}>Ảnh bìa</Text>
      <View style={styles.headingActions}>
        <Pressable disabled={uploading} onPress={() => setShowPicker(true)} style={[styles.upload, styles.pickerButton, uploading && styles.disabled]}>
          <MaterialCommunityIcons name="image-multiple-outline" size={19} color={Theme.colors.blueDark} />
          <Text style={[styles.uploadText, styles.pickerText]}>Chọn từ thư viện</Text>
        </Pressable>
        <Pressable disabled={uploading} onPress={() => void upload()} style={[styles.upload, uploading && styles.disabled]}>
          {uploading ? <ActivityIndicator color="#FFFFFF" /> : <MaterialCommunityIcons name="cloud-upload-outline" size={19} color="#FFFFFF" />}
          <Text style={styles.uploadText}>{uploading ? 'Đang tải' : 'Tải ảnh lên'}</Text>
        </Pressable>
      </View>
    </View>
    {uri ? <View style={styles.preview}><Image source={{ uri }} resizeMode="contain" style={styles.image} /><View style={styles.previewCopy}><Text numberOfLines={2} style={styles.path}>{value.path}</Text><Text style={styles.dimensions}>{value.width} × {value.height}px</Text></View></View> : null}
    <Field label="Dán URL HTTPS hoặc đường dẫn /curriculum" value={value.path} onChangeText={(path) => onChange({ ...value, path })} />
    <Field label="Mô tả ảnh cho trẻ" value={value.alt} onChangeText={(alt) => onChange({ ...value, alt })} />
    <View style={styles.columns}><View style={styles.column}><Field label="Chiều rộng" value={String(value.width)} onChangeText={(width) => onChange({ ...value, width: Number(width) })} keyboardType="number-pad" /></View><View style={styles.column}><Field label="Chiều cao" value={String(value.height)} onChangeText={(height) => onChange({ ...value, height: Number(height) })} keyboardType="number-pad" /></View></View>
    {showPicker ? <MediaPickerModal onClose={() => setShowPicker(false)} onSelect={(asset) => {
      onChange({ path: asset.secureUrl, width: asset.width, height: asset.height, alt: value.alt });
      setShowPicker(false);
    }} /> : null}
  </View>;
}

function Field({ label, ...props }: { label: string; value: string; onChangeText: (value: string) => void; keyboardType?: 'default' | 'number-pad' }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput {...props} style={styles.input} placeholderTextColor="#8A98A1" /></View>;
}

const styles = StyleSheet.create({
  root: { gap: 10, borderTopWidth: 1, borderTopColor: Theme.colors.border, paddingTop: 13 },
  heading: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  headingActions: { flexDirection: 'row', gap: 8 },
  title: { color: Theme.colors.greenDark, fontWeight: '900', fontSize: 13 },
  upload: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 7, backgroundColor: Theme.colors.blueDark, paddingHorizontal: 12 },
  pickerButton: { backgroundColor: '#F0F5F9', borderWidth: 1, borderColor: '#D9E2E8' },
  uploadText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  pickerText: { color: Theme.colors.blueDark },
  disabled: { opacity: 0.55 },
  preview: { minHeight: 110, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#F8FAFB', padding: 9 },
  image: { width: 104, height: 92, borderRadius: 7, backgroundColor: '#FFFFFF' },
  previewCopy: { flex: 1, minWidth: 0 },
  path: { color: Theme.colors.ink, fontWeight: '700', fontSize: 11 },
  dimensions: { color: Theme.colors.muted, marginTop: 5, fontSize: 10 },
  field: { gap: 5 },
  label: { color: Theme.colors.ink, fontSize: 12, fontWeight: '900' },
  input: { minHeight: 50, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 7, backgroundColor: '#FFFFFF', paddingHorizontal: 12, color: Theme.colors.ink, fontSize: 15 },
  columns: { flexDirection: 'row', gap: 10 },
  column: { flex: 1 },
});

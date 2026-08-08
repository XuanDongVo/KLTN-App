import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Theme } from '@/constants/Theme';
import { pickAndUploadAdminImage } from '@/services/adminMediaUpload';
import type { BackendMedia } from '@/types/backendCurriculum';
import { MediaPickerModal } from './MediaPickerModal';
import { styles } from './AdminImageField.styles';

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

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/Theme';
import { pickAndUploadAdminImage } from '@/services/adminMediaUpload';
import { adminOperationsService } from '@/services/adminOperationsService';
import type { AdminMediaAsset } from '@/types/adminOperations';
import { styles } from '@/styles/admin/media/index.styles';
import { useModal } from "@/context/ModalContext";

export default function AdminMediaScreen() {
  const { showAlert } = useModal();
  const [assets, setAssets] = useState<AdminMediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try { setAssets(await adminOperationsService.getMedia()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tải được thư viện ảnh.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const upload = async () => {
    setUploading(true);
    try { const asset = await pickAndUploadAdminImage(); if (asset) setAssets((current) => [asset, ...current]); }
    catch (reason) { showAlert('Không tải được ảnh', reason instanceof Error ? reason.message : 'Đã xảy ra lỗi không xác định.'); }
    finally { setUploading(false); }
  };

  return <ScrollView contentContainerStyle={styles.content}>
    <View style={styles.heading}><View style={styles.headingCopy}><Text style={styles.eyebrow}>CLOUDINARY MEDIA</Text><Text style={styles.title}>Thư viện ảnh</Text><Text style={styles.subtitle}>Ảnh đã tải lên được dùng lại bằng URL an toàn; không tự xóa để bảo vệ curriculum cũ.</Text></View><Pressable disabled={uploading} onPress={() => void upload()} style={[styles.upload, uploading && styles.disabled]}>{uploading ? <ActivityIndicator color="#FFFFFF" /> : <MaterialCommunityIcons name="cloud-upload-outline" size={21} color="#FFFFFF" />}<Text style={styles.uploadText}>{uploading ? 'Đang tải ảnh' : 'Tải ảnh lên'}</Text></Pressable></View>
    {error ? <View style={styles.error}><MaterialCommunityIcons name="alert-circle" size={21} color={Theme.colors.coralDark} /><Text style={styles.errorText}>{error}</Text></View> : null}
    {loading ? <View style={styles.loading}><ActivityIndicator size="large" color={Theme.colors.green} /></View> : assets.length ? <View style={styles.grid}>{assets.map((asset) => <View key={asset.id} style={styles.card}><Image source={{ uri: asset.secureUrl }} resizeMode="cover" style={styles.image} /><View style={styles.cardCopy}><Text numberOfLines={1} style={styles.fileName}>{asset.originalFileName}</Text><Text style={styles.meta}>{asset.width} × {asset.height}px · {formatBytes(asset.bytes)}</Text><Text numberOfLines={2} style={styles.url}>{asset.secureUrl}</Text></View></View>)}</View> : <View style={styles.empty}><MaterialCommunityIcons name="image-plus-outline" size={48} color={Theme.colors.muted} /><Text style={styles.emptyTitle}>Chưa có ảnh Cloudinary</Text><Text style={styles.subtitle}>Tải ảnh đầu tiên hoặc tiếp tục dán URL trực tiếp trong Curriculum CMS.</Text></View>}
  </ScrollView>;
}

function formatBytes(value: number) { return value >= 1024 * 1024 ? `${(value / 1024 / 1024).toFixed(1)} MB` : `${Math.round(value / 1024)} KB`; }

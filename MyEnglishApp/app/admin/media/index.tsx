import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/Theme';
import { pickAndUploadAdminImage } from '@/services/adminMediaUpload';
import { adminOperationsService } from '@/services/adminOperationsService';
import type { AdminMediaAsset } from '@/types/adminOperations';

export default function AdminMediaScreen() {
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
    catch (reason) { Alert.alert('Không tải được ảnh', reason instanceof Error ? reason.message : 'Đã xảy ra lỗi không xác định.'); }
    finally { setUploading(false); }
  };

  return <ScrollView contentContainerStyle={styles.content}>
    <View style={styles.heading}><View style={styles.headingCopy}><Text style={styles.eyebrow}>CLOUDINARY MEDIA</Text><Text style={styles.title}>Thư viện ảnh</Text><Text style={styles.subtitle}>Ảnh đã tải lên được dùng lại bằng URL an toàn; không tự xóa để bảo vệ curriculum cũ.</Text></View><Pressable disabled={uploading} onPress={() => void upload()} style={[styles.upload, uploading && styles.disabled]}>{uploading ? <ActivityIndicator color="#FFFFFF" /> : <MaterialCommunityIcons name="cloud-upload-outline" size={21} color="#FFFFFF" />}<Text style={styles.uploadText}>{uploading ? 'Đang tải ảnh' : 'Tải ảnh lên'}</Text></Pressable></View>
    {error ? <View style={styles.error}><MaterialCommunityIcons name="alert-circle" size={21} color={Theme.colors.coralDark} /><Text style={styles.errorText}>{error}</Text></View> : null}
    {loading ? <View style={styles.loading}><ActivityIndicator size="large" color={Theme.colors.green} /></View> : assets.length ? <View style={styles.grid}>{assets.map((asset) => <View key={asset.id} style={styles.card}><Image source={{ uri: asset.secureUrl }} resizeMode="cover" style={styles.image} /><View style={styles.cardCopy}><Text numberOfLines={1} style={styles.fileName}>{asset.originalFileName}</Text><Text style={styles.meta}>{asset.width} × {asset.height}px · {formatBytes(asset.bytes)}</Text><Text numberOfLines={2} style={styles.url}>{asset.secureUrl}</Text></View></View>)}</View> : <View style={styles.empty}><MaterialCommunityIcons name="image-plus-outline" size={48} color={Theme.colors.muted} /><Text style={styles.emptyTitle}>Chưa có ảnh Cloudinary</Text><Text style={styles.subtitle}>Tải ảnh đầu tiên hoặc tiếp tục dán URL trực tiếp trong Curriculum CMS.</Text></View>}
  </ScrollView>;
}

function formatBytes(value: number) { return value >= 1024 * 1024 ? `${(value / 1024 / 1024).toFixed(1)} MB` : `${Math.round(value / 1024)} KB`; }

const styles = StyleSheet.create({
  content: { width: '100%', maxWidth: 1100, alignSelf: 'center', padding: 18, paddingBottom: 50 }, heading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }, headingCopy: { flex: 1, minWidth: 250 }, eyebrow: { color: Theme.colors.greenDark, fontSize: 11, fontWeight: '900' }, title: { color: Theme.colors.ink, fontSize: 28, fontWeight: '900', marginTop: 3 }, subtitle: { color: Theme.colors.muted, lineHeight: 18, marginTop: 4 },
  upload: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 7, borderBottomWidth: 4, borderBottomColor: Theme.colors.blueDark, backgroundColor: Theme.colors.blue, paddingHorizontal: 14 }, uploadText: { color: '#FFFFFF', fontWeight: '900' }, disabled: { opacity: 0.5 }, error: { marginTop: 14, flexDirection: 'row', gap: 8, alignItems: 'center', borderWidth: 1, borderColor: '#FFD0CD', borderRadius: 8, backgroundColor: '#FFF0EF', padding: 11 }, errorText: { flex: 1, color: Theme.colors.coralDark, fontWeight: '700' }, loading: { minHeight: 360, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 }, card: { minWidth: 240, flexGrow: 1, flexBasis: 300, maxWidth: 360, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', overflow: 'hidden' }, image: { width: '100%', aspectRatio: 16 / 10, backgroundColor: '#EFF3F5' }, cardCopy: { padding: 11 }, fileName: { color: Theme.colors.ink, fontWeight: '900', fontSize: 13 }, meta: { color: Theme.colors.muted, fontSize: 10, marginTop: 4 }, url: { color: Theme.colors.blueDark, fontSize: 9, lineHeight: 13, marginTop: 7 }, empty: { minHeight: 360, alignItems: 'center', justifyContent: 'center', padding: 30 }, emptyTitle: { color: Theme.colors.ink, fontSize: 17, fontWeight: '900', marginTop: 10 },
});

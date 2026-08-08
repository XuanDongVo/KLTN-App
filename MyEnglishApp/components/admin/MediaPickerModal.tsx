import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/Theme';
import { adminOperationsService } from '@/services/adminOperationsService';
import type { AdminMediaAsset } from '@/types/adminOperations';
import { styles } from './MediaPickerModal.styles';

export function MediaPickerModal({ onClose, onSelect }: { onClose: () => void; onSelect: (asset: AdminMediaAsset) => void }) {
  const [assets, setAssets] = useState<AdminMediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await adminOperationsService.getMedia();
        if (active) setAssets(data);
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'Không tải được thư viện ảnh.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  return <Modal visible transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.modalBackdrop}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Chọn từ thư viện</Text>
          <Pressable style={styles.close} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={Theme.colors.ink} />
          </Pressable>
        </View>
        <ScrollView style={styles.modalBody} contentContainerStyle={styles.scrollContent}>
          {error ? <View style={styles.error}><MaterialCommunityIcons name="alert-circle" size={21} color={Theme.colors.coralDark} /><Text style={styles.errorText}>{error}</Text></View> : null}
          {loading ? <View style={styles.loading}><ActivityIndicator size="large" color={Theme.colors.green} /></View> :
            assets.length ? <View style={styles.grid}>
              {assets.map((asset) => (
                <Pressable key={asset.id} style={styles.card} onPress={() => onSelect(asset)}>
                  <Image source={{ uri: asset.secureUrl }} resizeMode="cover" style={styles.image} />
                  <View style={styles.cardCopy}>
                    <Text numberOfLines={1} style={styles.fileName}>{asset.originalFileName}</Text>
                    <Text style={styles.meta}>{asset.width} × {asset.height}px</Text>
                  </View>
                </Pressable>
              ))}
            </View> : <View style={styles.empty}><MaterialCommunityIcons name="image-outline" size={40} color={Theme.colors.muted} /><Text style={styles.emptyTitle}>Chưa có ảnh nào trong thư viện</Text></View>
          }
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

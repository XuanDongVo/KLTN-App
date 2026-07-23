import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/Theme';
import { adminOperationsService } from '@/services/adminOperationsService';
import type { AdminMediaAsset } from '@/types/adminOperations';

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

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalContent: { flexShrink: 1, width: '100%', maxWidth: 700, maxHeight: '90%', backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  modalTitle: { color: Theme.colors.ink, fontSize: 18, fontWeight: '900' },
  close: { padding: 4 },
  modalBody: { flexShrink: 1, backgroundColor: '#F8FAFB' },
  scrollContent: { padding: 16 },
  error: { flexDirection: 'row', gap: 8, alignItems: 'center', borderWidth: 1, borderColor: '#FFD0CD', borderRadius: 8, backgroundColor: '#FFF0EF', padding: 11, marginBottom: 16 },
  errorText: { flex: 1, color: Theme.colors.coralDark, fontWeight: '700' },
  loading: { minHeight: 200, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { minWidth: 140, flexGrow: 1, flexBasis: 160, maxWidth: 220, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  image: { width: '100%', aspectRatio: 16 / 10, backgroundColor: '#EFF3F5' },
  cardCopy: { padding: 8 },
  fileName: { color: Theme.colors.ink, fontWeight: '900', fontSize: 11 },
  meta: { color: Theme.colors.muted, fontSize: 9, marginTop: 4 },
  empty: { minHeight: 200, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { color: Theme.colors.ink, fontSize: 15, fontWeight: '900', marginTop: 10, textAlign: 'center' },
});

import React from 'react';
import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// Thêm imageUrl vào Props
interface UnitLearnerCardProps {
  item: {
    id: number;
    title: string;
    description: string;
    isCompleted: boolean;
    imageUrl?: string; // Ảnh của Unit
  };
  onPress: () => void;
}

export default function UnitLearnerCard({ item, onPress }: UnitLearnerCardProps) {
  // Dùng ảnh mặc định nếu Unit chưa có ảnh
  const defaultImage = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'; 

  return (
    <View style={styles.cardContainer}>
      <Image 
        source={{ uri: item.imageUrl || defaultImage }} 
        style={styles.cardImage} 
      />

      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <View style={[styles.statusBadge, item.isCompleted ? styles.badgeReview : styles.badgeLearn]}>
             <Text style={styles.statusText}>
               {item.isCompleted ? 'Đã hoàn thành' : 'Chưa học'}
             </Text>
          </View>
        </View>

        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        
        <View style={{ flex: 1 }} />

        <TouchableOpacity 
          style={[styles.actionBtn, item.isCompleted ? styles.btnReview : styles.btnLearn]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>
            {item.isCompleted ? "Ôn tập ngay" : "Bắt đầu làm bài"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: Platform.OS === 'web' ? 320 : width * 0.75,
    height: 320,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeLearn: { backgroundColor: '#eff6ff' },
  badgeReview: { backgroundColor: '#ecfdf5' },
  statusText: { fontSize: 12, fontWeight: '700', color: '#3b82f6' },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  actionBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnLearn: { backgroundColor: '#3b82f6' },
  btnReview: { backgroundColor: '#10b981' },
  actionBtnText: { color: 'white', fontSize: 15, fontWeight: 'bold' }
});
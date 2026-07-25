import React from 'react';
import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './UnitLearnerCard.styles';

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

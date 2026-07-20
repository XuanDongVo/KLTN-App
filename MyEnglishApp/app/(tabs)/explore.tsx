import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Theme } from '@/constants/Theme';

const photoMissionImage = require('@/assets/images/lessons/greetings.png'); // Placeholder

export default function ExploreScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Khám phá</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Nhiệm vụ AI</Text>
        <Pressable 
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push('/(learner)/photo-mission')}
        >
          <View style={styles.cardImageContainer}>
            <Image source={photoMissionImage} style={styles.cardImage} resizeMode="contain" />
            <View style={styles.badge}>
              <MaterialCommunityIcons name="star-shooting" size={14} color="#FFFFFF" />
              <Text style={styles.badgeText}>MỚI</Text>
            </View>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Nhiệm vụ chụp ảnh</Text>
            <Text style={styles.cardDescription}>
              Khám phá thế giới xung quanh! Chụp ảnh các đồ vật để AI giúp bé học từ vựng tiếng Anh.
            </Text>
            <View style={styles.actionRow}>
              <Text style={styles.actionText}>Bắt đầu ngay</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color={Theme.colors.greenDark} />
            </View>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    paddingHorizontal: 22,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Theme.colors.ink,
  },
  content: {
    padding: 22,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.ink,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    borderColor: Theme.colors.green,
  },
  cardImageContainer: {
    height: 160,
    backgroundColor: '#EAF7FE',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Theme.colors.coral,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.ink,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: Theme.colors.muted,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.greenDark,
  },
});

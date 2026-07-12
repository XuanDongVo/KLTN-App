import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

export interface Unit {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

interface UnitCardProps {
  unit: Unit;
  index: number;
}


export const UnitCard = ({ unit, index }: UnitCardProps) => {

  const router = useRouter();

  const handlePress = () => {
    router.push(`/admin/units/${unit.id}`);
  };
  return (
    <TouchableOpacity 
      onPress={handlePress} 
      activeOpacity={0.7}
    >
      <Animated.View 
        entering={FadeInRight.delay(index * 100).duration(400)}
        style={{ 
          flexDirection: 'row', 
          backgroundColor: 'white', 
          padding: 15, 
          borderRadius: 10, 
          marginBottom: 15, 
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,
        }}
      >
        <Image 
          source={{ uri: unit.imageUrl || 'https://via.placeholder.com/150' }} 
          style={{ width: 80, height: 80, borderRadius: 8, marginRight: 15, backgroundColor: '#e5e7eb' }} 
        />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>{unit.title}</Text>
          <Text numberOfLines={2} style={{ fontSize: 14, color: '#6b7280', marginTop: 4, lineHeight: 18 }}>
            {unit.description || 'Chưa có mô tả.'}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};
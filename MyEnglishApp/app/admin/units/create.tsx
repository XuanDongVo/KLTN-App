import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { unitService } from '../../../services/unitService';

export default function CreateUnitScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleCreateUnit = async () => {
    if (!title || !imageUri) return alert("Vui lòng điền đủ thông tin và chọn ảnh");
    setLoading(true);

    try {
      const fileName = `unit_${Date.now()}`;
      
      // 1. Lấy chữ ký từ BE
      const sigData = await unitService.getCloudinarySignature(fileName);
      if (!sigData.result) throw new Error("Không thể lấy chữ ký Cloudinary");

      // 2. Upload ảnh lên Cloudinary
      const cloudData = await unitService.uploadToCloudinary(imageUri, sigData, fileName,'english_units');
      if (!cloudData.secure_url) throw new Error("Upload ảnh thất bại");

      // 3. Gọi BE lưu Database
      const saveData = await unitService.createUnit({
        title,
        description,
        imageUrl: cloudData.secure_url
      });

      if (saveData.code === 200) {
        alert("Thêm bài học thành công!");
        router.push('/admin/units'); 
      } else {
        alert("Lỗi Backend: " + saveData.message);
      }
    } catch (error) {
      alert("Lỗi quá trình tạo bài học!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 30, borderRadius: 10, elevation: 3 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 25 }}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ 
            width: 45, 
            height: 45, 
            backgroundColor: '#f3f4f6', 
            borderRadius: 50,
            justifyContent: 'center', 
            alignItems: 'center', 
            marginRight: 15 
          }}>
          <Ionicons name="arrow-back" size={24} color="#4b5563" />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>Thêm Bài Học Mới</Text>
      </View>
      
      <TextInput placeholder="Tên bài học" value={title} onChangeText={setTitle} style={{ borderWidth: 1, borderColor: '#d1d5db', padding: 15, borderRadius: 8, marginBottom: 15 }} />
      <TextInput placeholder="Mô tả bài học" value={description} onChangeText={setDescription} style={{ borderWidth: 1, borderColor: '#d1d5db', padding: 15, borderRadius: 8, marginBottom: 20 }} />

      <TouchableOpacity onPress={pickImage} style={{ backgroundColor: '#f3f4f6', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#d1d5db', borderStyle: 'dashed' }}>
        <Text style={{ fontWeight: 'bold', color: '#4b5563' }}>📸 Bấm để chọn ảnh minh họa</Text>
      </TouchableOpacity>

      {imageUri && (
        <Animated.Image entering={ZoomIn.duration(400)} source={{ uri: imageUri }} style={{ width: '100%', height: 300, borderRadius: 10, marginBottom: 20 }} />
      )}

      <TouchableOpacity onPress={handleCreateUnit} disabled={loading} style={{ backgroundColor: '#4ade80', padding: 15, borderRadius: 8, alignItems: 'center' }}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Lưu Bài Học</Text>}
      </TouchableOpacity>
    </View>
  );
}
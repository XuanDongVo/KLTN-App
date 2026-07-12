import React from 'react';
import { Image, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface DynamicQuestionFieldsProps {
  qType: 'FILL_IN_BLANK' | 'MATCHING' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'IMAGE_CHOICE';
  imageUri: string;
  onPickImage: () => void;
  state: any;
  setState: React.Dispatch<React.SetStateAction<any>>;
}

export const DynamicQuestionFields = ({ qType, imageUri, onPickImage, state, setState }: DynamicQuestionFieldsProps) => {
  return (
    <View style={{ padding: 15, backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 20 }}>
      {(qType === 'TRUE_FALSE' || qType === 'IMAGE_CHOICE') && (
        <TouchableOpacity onPress={onPickImage} style={{ height: 160, backgroundColor: '#e5e7eb', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#d1d5db' }}>
          {imageUri ? <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} /> : <Text style={{ color: '#6b7280', fontWeight: '500' }}>Chọn hình ảnh của câu hỏi</Text>}
        </TouchableOpacity>
      )}

      {/* 1. FILL_IN_BLANK */}
      {qType === 'FILL_IN_BLANK' && (
        <View>
          <Text style={{ fontWeight: '500', marginBottom: 5 }}>Nhập câu đầy đủ hoàn chỉnh (User side sẽ tự ẩn từ đi):</Text>
          <TextInput placeholder="Ví dụ: The cat is sleeping on the sofa." value={state.sentence || ''} onChangeText={t => setState({ ...state, sentence: t })} style={{ backgroundColor: 'white', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db', marginBottom: 12 }} />
          <Text style={{ fontWeight: '500', marginBottom: 5 }}>Từ muốn giấu:</Text>
          <TextInput placeholder="Từ khóa" value={state.missingWordsStr || ''} onChangeText={t => setState({ ...state, missingWordsStr: t })} style={{ backgroundColor: 'white', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db' }} />
        </View>
      )}

      {/* 2. MULTIPLE_CHOICE */}
      {qType === 'MULTIPLE_CHOICE' && (
        <View>
          <Text style={{ fontWeight: '500', marginBottom: 5 }}>Nhập câu đầy đủ chứa từ cần chọn:</Text>
          <TextInput placeholder="Ví dụ: He goes to school every day." value={state.questionText || ''} onChangeText={t => setState({ ...state, questionText: t })} style={{ backgroundColor: 'white', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db', marginBottom: 12 }} />
          <Text style={{ fontWeight: '500', marginBottom: 5 }}>Đáp án đúng xuất hiện trong câu:</Text>
          <TextInput placeholder="Ví dụ: goes" value={state.correctAnswer || ''} onChangeText={t => setState({ ...state, correctAnswer: t })} style={{ backgroundColor: 'white', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db', marginBottom: 12 }} />
          <Text style={{ fontWeight: '500', marginBottom: 5 }}>Các đáp án sai nhiễu (Cách nhau bằng dấu phẩy):</Text>
          <TextInput placeholder="Ví dụ: go, going, gone" value={state.distractorsStr || ''} onChangeText={t => setState({ ...state, distractorsStr: t })} style={{ backgroundColor: 'white', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db' }} />
        </View>
      )}

      {/* 3. TRUE_FALSE */}
      {qType === 'TRUE_FALSE' && (
        <View>
          <Text style={{ fontWeight: '500', marginBottom: 5 }}>Câu miêu tả để học sinh đối chiếu xem hình:</Text>
          <TextInput placeholder="Ví dụ: A cute cat is playing with a ball." value={state.captionText || ''} onChangeText={t => setState({ ...state, captionText: t })} style={{ backgroundColor: 'white', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db', marginBottom: 15 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '600', color: '#374151' }}>Câu miêu tả trên ĐÚNG với bức hình?</Text>
            <Switch value={state.isTrue ?? true} onValueChange={v => setState({ ...state, isTrue: v })} />
          </View>
        </View>
      )}

      {/* 4. IMAGE_CHOICE */}
      {qType === 'IMAGE_CHOICE' && (
        <View>
          <Text style={{ fontWeight: '500', marginBottom: 5 }}>Câu hỏi cho bức hình:</Text>
          <TextInput placeholder="Ví dụ: What is the animal in the picture?" value={state.questionText || ''} onChangeText={t => setState({ ...state, questionText: t })} style={{ backgroundColor: 'white', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db', marginBottom: 12 }} />
          <Text style={{ fontWeight: '500', marginBottom: 5 }}>Đáp án đúng:</Text>
          <TextInput placeholder="Ví dụ: Cat" value={state.correctAnswer || ''} onChangeText={t => setState({ ...state, correctAnswer: t })} style={{ backgroundColor: 'white', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db', marginBottom: 12 }} />
          <Text style={{ fontWeight: '500', marginBottom: 5 }}>Các phương án sai (Cách nhau dấu phẩy):</Text>
          <TextInput placeholder="Ví dụ: Dog, Bird, Fish" value={state.distractorsStr || ''} onChangeText={t => setState({ ...state, distractorsStr: t })} style={{ backgroundColor: 'white', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db' }} />
        </View>
      )}

      {/* 5. MATCHING */}
      {qType === 'MATCHING' && (
        <View>
          <Text style={{ fontWeight: '600', marginBottom: 10, color: '#374151' }}>Nhập các cặp từ nối tương ứng:</Text>
          {(state.pairs || [{ left: '', right: '' }]).map((p: any, idx: number) => (
            <View key={idx} style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
              <TextInput placeholder="Vế trái (Apple)" value={p.left} onChangeText={text => { const newP = [...(state.pairs || [{ left: '', right: '' }])]; newP[idx].left = text; setState({ ...state, pairs: newP }); }} style={{ flex: 1, backgroundColor: 'white', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db' }} />
              <TextInput placeholder="Vế phải (Quả táo)" value={p.right} onChangeText={text => { const newP = [...(state.pairs || [{ left: '', right: '' }])]; newP[idx].right = text; setState({ ...state, pairs: newP }); }} style={{ flex: 1, backgroundColor: 'white', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db' }} />
            </View>
          ))}
          <TouchableOpacity onPress={() => setState({ ...state, pairs: [...(state.pairs || [{ left: '', right: '' }]), { left: '', right: '' }] })}><Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>➕ Thêm một cặp nối</Text></TouchableOpacity>
        </View>
      )}
    </View>
  );
};
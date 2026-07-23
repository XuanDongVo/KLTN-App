import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';

function Field({ label, hint, error, multiline, placeholder, value, onChangeText, keyboardType, autoCapitalize }: any) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text>{hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}<TextInput multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} style={[styles.input, error && styles.inputError, multiline && styles.multiline]} placeholderTextColor="#8A98A1" placeholder={placeholder} value={value} onChangeText={onChangeText} keyboardType={keyboardType} autoCapitalize={autoCapitalize} />{error ? <Text style={styles.fieldError}>{error}</Text> : null}</View>;
}

function IconButton({ icon, label, onPress, disabled, danger, compact }: any) {
  return <Pressable accessibilityLabel={label} disabled={disabled} onPress={(event) => { event.stopPropagation(); onPress(); }} style={[styles.iconButton, compact && styles.iconButtonCompact, disabled && styles.disabled]}><MaterialCommunityIcons name={icon} size={compact ? 18 : 21} color={danger ? Theme.colors.coralDark : Theme.colors.muted} /></Pressable>;
}

export function FlashcardForm({ data, onChange }: any) {
  return <View>
    <Field label="Từ vựng (Tiếng Anh)" placeholder="VD: Apple" value={data.term ?? ''} onChangeText={(t: string) => onChange({ ...data, term: t })} />
    <Field label="Nghĩa tiếng Việt" placeholder="VD: Quả táo" value={data.meaning ?? ''} onChangeText={(t: string) => onChange({ ...data, meaning: t })} />
  </View>;
}

export function TrueFalseForm({ data, onChange }: any) {
  return <View>
    <Field label="Nội dung nhận định" placeholder="VD: The sun rises in the west." value={data.statement ?? ''} onChangeText={(t: string) => onChange({ ...data, statement: t })} multiline />
    <Text style={styles.fieldLabel}>Đáp án đúng</Text>
    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
      <Pressable onPress={() => onChange({ ...data, isTrue: true })} style={[styles.segment, data.isTrue && styles.segmentActive, { flex: 1 }]}><Text style={[styles.segmentText, data.isTrue && styles.segmentTextActive]}>Đúng (True)</Text></Pressable>
      <Pressable onPress={() => onChange({ ...data, isTrue: false })} style={[styles.segment, !data.isTrue && styles.segmentActive, { flex: 1 }]}><Text style={[styles.segmentText, !data.isTrue && styles.segmentTextActive]}>Sai (False)</Text></Pressable>
    </View>
  </View>;
}

export function SpeakForm({ data, onChange }: any) {
  return <View>
    <Field label="Câu mẫu cần đọc" placeholder="VD: I go to school every day." value={data.modelText ?? ''} onChangeText={(t: string) => onChange({ ...data, modelText: t })} multiline />
  </View>;
}

export function WordOrderForm({ data, onChange }: any) {
  return <View>
    <Field label="Câu đúng hoàn chỉnh" hint="Nhập câu hoàn chỉnh. Học sinh sẽ phải xếp lại các từ bị xáo trộn." placeholder="VD: I have an apple." value={data.correctSentence ?? ''} onChangeText={(t: string) => onChange({ ...data, correctSentence: t })} multiline />
  </View>;
}

export function IntroForm({ data, onChange }: any) {
  const items = data.items ?? [];
  return <View>
    <Text style={styles.fieldLabel}>Danh sách từ vựng</Text>
    {items.map((item: any, i: number) => (
      <View key={i} style={styles.listItem}>
        <View style={styles.listHeader}><Text style={styles.listTitle}>Từ số {i + 1}</Text><IconButton icon="delete" label="Xóa" danger compact onPress={() => { const next = [...items]; next.splice(i, 1); onChange({ ...data, items: next }); }} /></View>
        <Field label="Tiếng Anh" placeholder="VD: Dog" value={item.word} onChangeText={(t: string) => { const next = [...items]; next[i].word = t; onChange({ ...data, items: next }); }} />
        <Field label="Tiếng Việt" placeholder="VD: Con chó" value={item.meaning} onChangeText={(t: string) => { const next = [...items]; next[i].meaning = t; onChange({ ...data, items: next }); }} />
        <Field label="Ví dụ (Tùy chọn)" placeholder="VD: The dog is barking." value={item.example} onChangeText={(t: string) => { const next = [...items]; next[i].example = t; onChange({ ...data, items: next }); }} />
      </View>
    ))}
    <Pressable style={styles.addButton} onPress={() => onChange({ ...data, items: [...items, { word: '', meaning: '', example: '' }] })}><MaterialCommunityIcons name="plus" size={20} color={Theme.colors.violet} /><Text style={styles.addText}>Thêm từ vựng</Text></Pressable>
  </View>;
}

export function MatchPairsForm({ data, onChange }: any) {
  const pairs = data.pairs ?? [];
  return <View>
    <Text style={styles.fieldLabel}>Danh sách cặp từ</Text>
    <Text style={styles.fieldHint}>Học sinh sẽ phải nối Tiếng Anh với Tiếng Việt tương ứng.</Text>
    {pairs.map((pair: any, i: number) => (
      <View key={i} style={styles.listItem}>
        <View style={styles.listHeader}><Text style={styles.listTitle}>Cặp số {i + 1}</Text><IconButton icon="delete" label="Xóa" danger compact onPress={() => { const next = [...pairs]; next.splice(i, 1); onChange({ ...data, pairs: next }); }} /></View>
        <Field label="Tiếng Anh" placeholder="VD: Cat" value={pair.left} onChangeText={(t: string) => { const next = [...pairs]; next[i].left = t; onChange({ ...data, pairs: next }); }} />
        <Field label="Nghĩa Tiếng Việt" placeholder="VD: Con mèo" value={pair.right} onChangeText={(t: string) => { const next = [...pairs]; next[i].right = t; onChange({ ...data, pairs: next }); }} />
      </View>
    ))}
    <Pressable style={styles.addButton} onPress={() => onChange({ ...data, pairs: [...pairs, { left: '', right: '' }] })}><MaterialCommunityIcons name="plus" size={20} color={Theme.colors.violet} /><Text style={styles.addText}>Thêm cặp</Text></Pressable>
  </View>;
}

export function ChoiceForm({ data, onChange }: any) {
  const options = data.options ?? [];
  const correctId = data.correctId ?? '';
  return <View>
    <Text style={styles.fieldLabel}>Các đáp án lựa chọn</Text>
    {options.map((opt: any, i: number) => (
      <View key={i} style={styles.listItem}>
        <View style={styles.listHeader}><Text style={styles.listTitle}>Đáp án {opt.id.toUpperCase()}</Text><IconButton icon="delete" label="Xóa" danger compact onPress={() => { const next = [...options]; next.splice(i, 1); onChange({ ...data, options: next }); }} /></View>
        <Field label="Nội dung hiển thị" placeholder="Nhập đáp án" value={opt.label} onChangeText={(t: string) => { const next = [...options]; next[i].label = t; onChange({ ...data, options: next }); }} />
        <Pressable onPress={() => onChange({ ...data, correctId: opt.id })} style={[styles.segment, correctId === opt.id && styles.segmentActive, { marginTop: 8 }]}><Text style={[styles.segmentText, correctId === opt.id && styles.segmentTextActive]}>{correctId === opt.id ? 'Đang chọn làm Đáp án đúng' : 'Chọn làm Đáp án đúng'}</Text></Pressable>
      </View>
    ))}
    <Pressable style={styles.addButton} onPress={() => { const nextId = String.fromCharCode(97 + options.length); onChange({ ...data, options: [...options, { id: nextId, label: '' }] }); }}><MaterialCommunityIcons name="plus" size={20} color={Theme.colors.violet} /><Text style={styles.addText}>Thêm đáp án</Text></Pressable>
  </View>;
}

export function TypeAnswerForm({ data, onChange }: any) {
  const acceptedAnswers = data.acceptedAnswers ?? [];
  return <View>
    <Field label="Gợi ý trong ô nhập" placeholder="VD: My name ..." value={data.placeholder ?? ''} onChangeText={(t: string) => onChange({ ...data, placeholder: t })} />
    <Text style={styles.fieldLabel}>Các đáp án được chấp nhận</Text>
    {acceptedAnswers.map((ans: string, i: number) => (
      <View key={i} style={[styles.listItem, { paddingBottom: 12 }]}>
        <View style={styles.listHeader}><Text style={styles.listTitle}>Đáp án {i + 1}</Text><IconButton icon="delete" label="Xóa" danger compact onPress={() => { const next = [...acceptedAnswers]; next.splice(i, 1); onChange({ ...data, acceptedAnswers: next }); }} /></View>
        <TextInput style={styles.input} placeholder="VD: My name is Ben." value={ans} onChangeText={(t: string) => { const next = [...acceptedAnswers]; next[i] = t; onChange({ ...data, acceptedAnswers: next }); }} />
      </View>
    ))}
    <Pressable style={styles.addButton} onPress={() => onChange({ ...data, acceptedAnswers: [...acceptedAnswers, ''] })}><MaterialCommunityIcons name="plus" size={20} color={Theme.colors.violet} /><Text style={styles.addText}>Thêm đáp án</Text></Pressable>
  </View>;
}

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Theme.colors.ink, marginBottom: 8, textTransform: 'uppercase' },
  fieldHint: { fontSize: 13, color: Theme.colors.muted, marginBottom: 8 },
  input: { backgroundColor: Theme.colors.background, borderWidth: 1, borderColor: '#D3DCE6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: Theme.colors.ink },
  inputError: { borderColor: Theme.colors.coral },
  multiline: { height: 100 },
  fieldError: { fontSize: 12, color: Theme.colors.coral, marginTop: 4 },
  listItem: { backgroundColor: '#F8F9FA', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E9F0' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listTitle: { fontSize: 14, fontWeight: '700', color: Theme.colors.ink },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: '#F0E6FF', borderRadius: 8, marginTop: 4, marginBottom: 16 },
  addText: { marginLeft: 8, fontSize: 14, fontWeight: '700', color: Theme.colors.violet },
  segment: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: Theme.colors.background, borderWidth: 1, borderColor: '#D3DCE6', borderRadius: 8, alignItems: 'center' },
  segmentActive: { backgroundColor: '#E0F2F1', borderColor: Theme.colors.green },
  segmentText: { fontSize: 14, fontWeight: '600', color: Theme.colors.muted },
  segmentTextActive: { color: Theme.colors.greenDark },
  iconButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.background, borderWidth: 1, borderColor: '#D3DCE6' },
  iconButtonCompact: { width: 28, height: 28, borderRadius: 14 },
  disabled: { opacity: 0.5 },
});

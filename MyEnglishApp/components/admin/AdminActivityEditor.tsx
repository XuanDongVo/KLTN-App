import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Theme } from '@/constants/Theme';
import { AdminActivity, AdminLesson, ActivityRequest, ActivityStage } from '@/types/adminCurriculum';
import { BackendActivityType, BackendMedia } from '@/types/backendCurriculum';
import { EditorModal, Field, IconButton, CommandButton, adminStyles, DialogState, activityTypes } from './AdminShared';
import { 
  FlashcardForm, TrueFalseForm, SpeakForm, WordOrderForm, 
  IntroForm, MatchPairsForm, ChoiceForm, TypeAnswerForm 
} from './activities';
import {
  arrayObjects, arrayStrings, recordOf, stringOf, isContentCode, isNonNegativeNumber, messageOf
} from '@/utils/admin';
import { BackendActivityRenderer } from '@/components/activities/BackendActivityRenderer';
import { AdminImageField } from '@/components/admin/AdminImageField';

function defaultMedia(): BackendMedia {
  return { path: '', width: 0, height: 0, alt: '' };
}

export function ActivityEditor({ initial, busy, onClose, onSave, lesson }: { initial?: AdminActivity; busy: boolean; onClose: () => void; onSave: (body: ActivityRequest) => void; lesson: AdminLesson }) {
  const lessonPrefix = lesson.code;
  const existingNums = lesson.activities.map(a => parseInt(a.code.split('_A')[1] ?? '0')).filter(n => !isNaN(n));
  const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
  const nextNum = initial ? '' : String(maxNum + 1).padStart(2, '0');
  const computedCode = initial ? initial.code : `${lessonPrefix}_A${nextNum}`;

  const [type, setType] = useState<BackendActivityType>(initial?.type ?? 'INTRO');
  const [stage, setStage] = useState<ActivityStage>(initial?.stage ?? 'LEARN');
  const [prompt, setPrompt] = useState(initial?.prompt ?? '');
  const [instruction, setInstruction] = useState(initial?.instruction ?? '');
  const [xp, setXp] = useState(initial ? String(initial.xpReward) : '');
  const [media, setMedia] = useState<BackendMedia>({
    path: stringOf(initial?.content?.imagePath),
    width: Number(initial?.content?.imageWidth) || 0,
    height: Number(initial?.content?.imageHeight) || 0,
    alt: stringOf(initial?.content?.imageAlt),
  });

  const initialStructured = useMemo(() => activityToStructured(initial, type), [initial, type]);
  const [activityData, setActivityData] = useState<Record<string, any>>(initialStructured);

  const chooseType = (nextType: BackendActivityType) => {
    setType(nextType);
    setActivityData(activityToStructured(initial?.type === nextType ? initial : undefined, nextType));
  };
  
  return <EditorModal title={initial ? 'Sửa hoạt động' : 'Thêm hoạt động'} onClose={onClose} wide>
    <View style={{ marginBottom: 16 }}>
       <Text style={{ fontSize: 13, fontWeight: '700', color: Theme.colors.ink, marginBottom: 8 }}>Mã hoạt động (Tự động)</Text>
       <View style={{ justifyContent: 'center', backgroundColor: Theme.colors.background, paddingHorizontal: 12, height: 44, borderRadius: 8 }}><Text style={{ fontSize: 15, fontWeight: '600', color: Theme.colors.ink }}>{computedCode}</Text></View>
    </View>
    <Text style={adminStyles.fieldLabel}>Loại hoạt động</Text>
    <View style={adminStyles.typeGrid}>{activityTypes.map((item) => <Pressable key={item.value} onPress={() => chooseType(item.value)} style={[adminStyles.typeOption, type === item.value && adminStyles.typeOptionActive]}><MaterialCommunityIcons name={item.icon as never} size={20} color={type === item.value ? Theme.colors.violet : Theme.colors.muted} /><Text style={[adminStyles.typeLabel, type === item.value && adminStyles.typeLabelActive]}>{item.label}</Text></Pressable>)}</View>
    <Text style={adminStyles.fieldLabel}>Giai đoạn</Text>
    <View style={adminStyles.segmented}>{(['LEARN', 'PRACTISE', 'CHECK'] as ActivityStage[]).map((value) => <Pressable key={value} onPress={() => setStage(value)} style={[adminStyles.segment, stage === value && adminStyles.segmentActive]}><Text style={[adminStyles.segmentText, stage === value && adminStyles.segmentTextActive]}>{value === 'LEARN' ? 'Học' : value === 'PRACTISE' ? 'Luyện tập' : 'Kiểm tra'}</Text></Pressable>)}</View>
    <Field label="Câu hỏi hoặc nội dung" placeholder="Nhập nội dung trẻ sẽ nhìn thấy" value={prompt} onChangeText={setPrompt} multiline />
    <Field label="Hướng dẫn" placeholder="VD: Nghe và chọn đáp án đúng" value={instruction} onChangeText={setInstruction} multiline />
    
    {type === 'IMAGE_CHOICE' && <AdminImageField value={media} onChange={setMedia} />}

    <View style={{ marginTop: 8, marginBottom: 16, borderTopWidth: 1, borderColor: '#E5E9F0', paddingTop: 16 }}>
      {type === 'INTRO' && <IntroForm data={activityData} onChange={setActivityData} />}
      {type === 'FLASHCARD' && <FlashcardForm data={activityData} onChange={setActivityData} />}
      {(type === 'LISTEN_CHOICE' || type === 'IMAGE_CHOICE') && <ChoiceForm data={activityData} onChange={setActivityData} />}
      {type === 'TRUE_FALSE' && <TrueFalseForm data={activityData} onChange={setActivityData} />}
      {type === 'MATCH_PAIRS' && <MatchPairsForm data={activityData} onChange={setActivityData} />}
      {type === 'WORD_ORDER' && <WordOrderForm data={activityData} onChange={setActivityData} />}
      {type === 'TYPE_ANSWER' && <TypeAnswerForm data={activityData} onChange={setActivityData} />}
      {type === 'SPEAK' && <SpeakForm data={activityData} onChange={setActivityData} />}
    </View>

    <Field label="XP" placeholder="VD: 2" value={xp} onChangeText={setXp} keyboardType="number-pad" />
    <CommandButton label={initial ? 'Lưu hoạt động' : 'Tạo hoạt động'} icon="content-save" disabled={busy || !isContentCode(computedCode) || !prompt.trim() || !isNonNegativeNumber(xp)} onPress={() => {
      try {
        const structured = structuredToActivity(type, activityData, initial?.content);
        if (type === 'IMAGE_CHOICE' && media.path) {
          structured.content.imagePath = media.path;
          structured.content.imageWidth = media.width;
          structured.content.imageHeight = media.height;
          structured.content.imageAlt = media.alt;
        }
        onSave({ code: computedCode, type, stage, prompt: prompt.trim(), instruction: instruction.trim(), xpReward: Number(xp), ...structured });
      } catch (reason) {
        Alert.alert('Dữ liệu chưa hợp lệ', messageOf(reason));
      }
    }} />
  </EditorModal>;
}


export function ActivityPreview({ activity, onClose }: { activity: AdminActivity; onClose: () => void }) {
  return <EditorModal title="Xem thử hoạt động" onClose={onClose} wide>
    <View style={adminStyles.previewFrame}>
      <Text style={adminStyles.previewPrompt}>{activity.prompt}</Text>
      {activity.instruction ? <Text style={adminStyles.previewInstruction}>{activity.instruction}</Text> : null}
      <BackendActivityRenderer key={activity.id} activity={{ id: activity.id, code: activity.code, type: activity.type, stage: activity.stage, order: activity.order, prompt: activity.prompt, instruction: activity.instruction, xpReward: activity.xpReward, content: activity.content }} onSubmit={() => undefined} />
    </View>
  </EditorModal>;
}

export function ConfirmationDialog({ dialog, onClose }: { dialog: DialogState; onClose: () => void }) {
  return <Modal transparent animationType="fade" onRequestClose={onClose}>
    <SafeAreaView style={adminStyles.confirmSafe} edges={['top', 'bottom', 'left', 'right']}>
      <Pressable style={adminStyles.confirmBackdrop} onPress={onClose}>
        <Pressable style={adminStyles.confirmPanel} onPress={(event) => event.stopPropagation()}>
          <View style={[adminStyles.confirmIcon, dialog.danger && adminStyles.confirmIconDanger]}>
            <MaterialCommunityIcons name={dialog.danger ? 'trash-can-outline' : 'information-outline'} size={27} color={dialog.danger ? Theme.colors.coralDark : Theme.colors.blueDark} />
          </View>
          <Text style={adminStyles.confirmTitle}>{dialog.title}</Text>
          <Text style={adminStyles.confirmMessage}>{dialog.message}</Text>
          <View style={adminStyles.confirmActions}>
            {dialog.onConfirm ? <CommandButton label="Hủy" icon="close" onPress={onClose} /> : null}
            <CommandButton
              label={dialog.confirmLabel ?? 'Đã hiểu'}
              danger={dialog.danger} primary={!dialog.danger} icon="check"
              onPress={dialog.onConfirm ?? onClose}
            />
          </View>
        </Pressable>
      </Pressable>
    </SafeAreaView>
  </Modal>;
}


function activityToStructured(activity?: AdminActivity, typeOverride?: BackendActivityType): Record<string, any> {
  const type = activity?.type ?? typeOverride ?? 'INTRO';
  if (!activity) {
    if (type === 'INTRO') return { items: [{ word: '', meaning: '', example: '' }] };
    if (type === 'FLASHCARD') return { term: '', meaning: '' };
    if (type === 'LISTEN_CHOICE' || type === 'IMAGE_CHOICE') return { options: [{ id: 'a', label: '' }, { id: 'b', label: '' }], correctId: 'a' };
    if (type === 'TRUE_FALSE') return { statement: '', isTrue: true };
    if (type === 'MATCH_PAIRS') return { pairs: [{ left: '', right: '' }] };
    if (type === 'WORD_ORDER') return { correctSentence: '' };
    if (type === 'TYPE_ANSWER') return { placeholder: '', acceptedAnswers: [''] };
    if (type === 'SPEAK') return { modelText: '' };
    return {};
  }
  const content = activity?.content ?? {};
  const answer = activity?.answer ?? {};

  if (type === 'INTRO') return { items: arrayObjects(content.items).map(item => ({ word: stringOf(item.word), meaning: stringOf(item.meaning), example: stringOf(item.example) })) };
  if (type === 'FLASHCARD') return { term: stringOf(content.term), meaning: stringOf(content.meaning) };
  if (type === 'LISTEN_CHOICE' || type === 'IMAGE_CHOICE') return { options: arrayObjects(content.options).map(item => ({ id: stringOf(item.id), label: stringOf(item.label) })), correctId: stringOf(answer.value) };
  if (type === 'TRUE_FALSE') return { statement: stringOf(content.statement), isTrue: stringOf(answer.value) === 'true' };
  if (type === 'MATCH_PAIRS') {
    const pairsObj = recordOf(answer.pairs);
    return { pairs: Object.entries(pairsObj).map(([left, right]) => ({ left, right: stringOf(right) })) };
  }
  if (type === 'WORD_ORDER') return { correctSentence: arrayStrings(answer.order).join(' ') };
  if (type === 'TYPE_ANSWER') return { placeholder: stringOf(content.placeholder), acceptedAnswers: arrayStrings(answer.accepted) };
  if (type === 'SPEAK') return { modelText: stringOf(content.modelText) };
  return {};
}


function structuredToActivity(type: BackendActivityType, data: Record<string, any>, previous?: Record<string, unknown>): Pick<ActivityRequest, 'content' | 'answer'> {
  const base = { ...(previous ?? {}) };
  if (type === 'INTRO') {
    const items = (data.items as any[]).filter(i => i.word?.trim() && i.meaning?.trim());
    if (!items.length) throw new Error('Vui lòng nhập ít nhất một từ vựng.');
    return { content: { ...base, items }, answer: { mode: 'completion' } };
  }
  if (type === 'FLASHCARD') {
    if (!data.term?.trim() || !data.meaning?.trim()) throw new Error('Vui lòng nhập từ vựng và nghĩa.');
    return { content: { ...base, term: data.term.trim(), meaning: data.meaning.trim(), speechText: data.term.trim() }, answer: { mode: 'completion' } };
  }
  if (type === 'LISTEN_CHOICE' || type === 'IMAGE_CHOICE') {
    const options = (data.options as any[]).filter(o => o.id?.trim() && o.label?.trim());
    if (options.length < 2) throw new Error('Vui lòng nhập ít nhất 2 lựa chọn.');
    const correctOption = options.find(o => o.id.trim() === data.correctId?.trim());
    if (!correctOption) throw new Error('Vui lòng chọn một đáp án đúng hợp lệ.');
    const contentObj = { ...base, options, ...(type === 'LISTEN_CHOICE' ? { speechText: correctOption.label } : {}) };
    return { content: contentObj, answer: { value: data.correctId.trim() } };
  }
  if (type === 'TRUE_FALSE') {
    if (!data.statement?.trim()) throw new Error('Vui lòng nhập nội dung nhận định.');
    return { content: { ...base, statement: data.statement.trim() }, answer: { value: data.isTrue ? 'true' : 'false' } };
  }
  if (type === 'MATCH_PAIRS') {
    const pairs = (data.pairs as any[]).filter(p => p.left?.trim() && p.right?.trim());
    if (pairs.length < 2) throw new Error('Vui lòng nhập ít nhất 2 cặp.');
    return { content: { ...base, left: pairs.map(p => p.left.trim()), right: pairs.map(p => p.right.trim()).reverse(), leftLabel: 'Tiếng Anh', rightLabel: 'Nghĩa tiếng Việt' }, answer: { pairs: Object.fromEntries(pairs.map(p => [p.left.trim(), p.right.trim()])) } };
  }
  if (type === 'WORD_ORDER') {
    const sentence = data.correctSentence?.trim() ?? '';
    if (!sentence) throw new Error('Vui lòng nhập câu hoàn chỉnh.');
    const order = sentence.split(/\s+/);
    if (order.length < 2) throw new Error('Câu phải có ít nhất 2 từ.');
    return { content: { ...base, tokens: [...order.slice(Math.ceil(order.length / 2)), ...order.slice(0, Math.ceil(order.length / 2))] }, answer: { order } };
  }
  if (type === 'TYPE_ANSWER') {
    const accepted = (data.acceptedAnswers as string[]).map(a => a.trim()).filter(Boolean);
    if (!accepted.length) throw new Error('Vui lòng nhập ít nhất một đáp án đúng.');
    return { content: { ...base, placeholder: data.placeholder?.trim() ?? '', maxLength: 120 }, answer: { accepted } };
  }
  if (type === 'SPEAK') {
    if (!data.modelText?.trim()) throw new Error('Vui lòng nhập câu mẫu.');
    return { content: { ...base, modelText: data.modelText.trim() }, answer: { mode: 'completion' } };
  }
  throw new Error('Loại hoạt động chưa được hỗ trợ.');
}


function activityHelper(type: BackendActivityType) {
  if (type === 'INTRO') return { mainLabel: 'Danh sách từ vựng', mainHint: 'Mỗi dòng: từ tiếng Anh | nghĩa tiếng Việt | câu ví dụ', answerLabel: 'Cách hoàn thành', answerHint: 'Hoạt động hoàn thành sau khi trẻ xem hết từ.' };
  if (type === 'FLASHCARD') return { mainLabel: 'Nội dung thẻ', mainHint: 'Từ tiếng Anh | nghĩa tiếng Việt', answerLabel: 'Cách hoàn thành', answerHint: 'Hoạt động hoàn thành sau khi trẻ xem thẻ.' };
  if (type === 'LISTEN_CHOICE' || type === 'IMAGE_CHOICE') return { mainLabel: 'Các lựa chọn', mainHint: 'Mỗi dòng: mã đáp án | nội dung hiển thị', answerLabel: 'Mã đáp án đúng', answerHint: 'Nhập đúng mã ở cột đầu.' };
  if (type === 'TRUE_FALSE') return { mainLabel: 'Nội dung nhận định', mainHint: 'Một câu để trẻ xác định đúng hoặc sai.', answerLabel: 'Đáp án', answerHint: 'Nhập true hoặc false.' };
  if (type === 'MATCH_PAIRS') return { mainLabel: 'Các cặp', mainHint: 'Mỗi dòng: tiếng Anh | nghĩa tiếng Việt', answerLabel: 'Cách hoàn thành', answerHint: 'Trẻ phải ghép đúng tất cả các cặp.' };
  if (type === 'WORD_ORDER') return { mainLabel: 'Câu mẫu', mainHint: 'Nhập câu hoàn chỉnh.', answerLabel: 'Câu đúng', answerHint: 'Nhập câu hoàn chỉnh theo đúng thứ tự.' };
  if (type === 'TYPE_ANSWER') return { mainLabel: 'Gợi ý trong ô nhập', mainHint: 'Ví dụ: My name ...', answerLabel: 'Các đáp án được chấp nhận', answerHint: 'Mỗi dòng là một đáp án.' };
  return { mainLabel: 'Câu mẫu để nói', mainHint: 'Trẻ sẽ nghe và nói theo câu này.', answerLabel: 'Cách hoàn thành', answerHint: 'Hoạt động hoàn thành sau khi trẻ thu âm.' };
}


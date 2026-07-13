import { Activity, LearningUnit, Lesson } from '@/types/learning';

const greetingsImage = require('@/assets/images/lessons/greetings.png');
const classroomImage = require('@/assets/images/lessons/classroom.png');
const animalsImage = require('@/assets/images/lessons/animals.png');

export const curriculum: LearningUnit[] = [
  {
    id: 'unit-1',
    title: 'Hello, friends!',
    subtitle: 'Chào hỏi và giới thiệu bản thân',
    color: '#58CC65',
    accent: '#38A74A',
    coverImage: greetingsImage,
    lessons: [
      {
        id: 'u1-l1', title: 'Say hello', objective: 'Chào hỏi và nói tên của mình', icon: 'hand-wave', color: '#58CC65', estimatedMinutes: 6,
        activities: [
          { id: 'u1-l1-a1', type: 'WORD_CARD', prompt: 'Hello!', meaning: 'Xin chào!', example: 'Hello, I am Mia.', image: greetingsImage, xp: 2 },
          { id: 'u1-l1-a2', type: 'LISTEN_CHOOSE', prompt: 'Con nghe thấy lời chào nào?', speechText: 'Hello, my name is Mia.', choices: [{ id: 'hello', label: 'Hello, my name is Mia.' }, { id: 'bye', label: 'Goodbye, Mia.' }, { id: 'thanks', label: 'Thank you, Mia.' }], answer: 'hello', explanation: '“Hello” là lời chào khi gặp một người.', xp: 3 },
          { id: 'u1-l1-a3', type: 'MULTIPLE_CHOICE', prompt: 'Choose the best greeting.', choices: [{ id: 'hello', label: 'Hello!' }, { id: 'book', label: 'A book' }, { id: 'blue', label: 'Blue' }], answer: 'hello', explanation: 'We say “Hello” when we meet someone.', xp: 3 },
          { id: 'u1-l1-a4', type: 'FILL_IN_BLANK', prompt: 'Điền từ còn thiếu', sentence: 'My name is ____.', answer: 'Mia', explanation: 'Dùng “My name is...” để giới thiệu tên.', xp: 3 },
          { id: 'u1-l1-a5', type: 'SENTENCE_BUILDER', prompt: 'Xếp thành một câu hoàn chỉnh', words: ['Hello,', 'my', 'name', 'is', 'Ben.'], answer: 'Hello, my name is Ben.', xp: 4 },
          { id: 'u1-l1-a6', type: 'TRUE_FALSE', prompt: '“Hi” cũng là một lời chào.', image: greetingsImage, answer: true, explanation: '“Hi” là cách chào thân mật, giống “Hello”.', xp: 3 },
          { id: 'u1-l1-a7', type: 'SPEAK_REPEAT', prompt: 'Hello, my name is Ben.', instruction: 'Nghe mẫu, sau đó đọc to và rõ ràng.', xp: 5 },
        ],
      },
      {
        id: 'u1-l2', title: 'Meet my friends', objective: 'Giới thiệu bạn bè và thầy cô', icon: 'account-group', color: '#4AADE8', estimatedMinutes: 7,
        activities: [
          { id: 'u1-l2-a1', type: 'WORD_CARD', prompt: 'friend', meaning: 'bạn bè', example: 'This is my friend, An.', image: greetingsImage, xp: 2 },
          { id: 'u1-l2-a2', type: 'IMAGE_CHOICE', prompt: 'Who is standing behind the children?', image: greetingsImage, choices: [{ id: 'teacher', label: 'teacher' }, { id: 'doctor', label: 'doctor' }, { id: 'farmer', label: 'farmer' }], answer: 'teacher', explanation: 'The adult in the classroom is the teacher.', xp: 3 },
          { id: 'u1-l2-a3', type: 'LISTEN_CHOOSE', prompt: 'Con nghe thấy ai được giới thiệu?', speechText: 'She is my teacher.', choices: [{ id: 'teacher', label: 'my teacher' }, { id: 'friend', label: 'my friend' }, { id: 'sister', label: 'my sister' }], answer: 'teacher', xp: 3 },
          { id: 'u1-l2-a4', type: 'MATCHING', prompt: 'Nối từ với nghĩa đúng', pairs: [{ left: 'friend', right: 'bạn bè' }, { left: 'teacher', right: 'giáo viên' }, { left: 'classmate', right: 'bạn cùng lớp' }], xp: 4 },
          { id: 'u1-l2-a5', type: 'MULTIPLE_CHOICE', prompt: 'Complete: She ___ my friend.', choices: [{ id: 'is', label: 'is' }, { id: 'are', label: 'are' }, { id: 'am', label: 'am' }], answer: 'is', explanation: 'Dùng “is” với he, she và it.', xp: 3 },
          { id: 'u1-l2-a6', type: 'SENTENCE_BUILDER', prompt: 'Xếp thành câu giới thiệu bạn', words: ['This', 'is', 'my', 'friend,', 'Lan.'], answer: 'This is my friend, Lan.', xp: 4 },
          { id: 'u1-l2-a7', type: 'SPEAK_REPEAT', prompt: 'This is my friend, Lan.', instruction: 'Giới thiệu người bạn trong câu mẫu.', xp: 5 },
        ],
      },
    ],
  },
  {
    id: 'unit-2',
    title: 'At school',
    subtitle: 'Đồ dùng và hoạt động trong lớp',
    color: '#4AADE8',
    accent: '#238AC6',
    coverImage: classroomImage,
    lessons: [
      {
        id: 'u2-l1', title: 'Classroom words', objective: 'Gọi tên đồ dùng học tập', icon: 'school', color: '#4AADE8', estimatedMinutes: 7,
        activities: [
          { id: 'u2-l1-a1', type: 'WORD_CARD', prompt: 'pencil', meaning: 'bút chì', example: 'This is a yellow pencil.', image: classroomImage, xp: 2 },
          { id: 'u2-l1-a2', type: 'IMAGE_CHOICE', prompt: 'Choose the blue book.', image: classroomImage, choices: [{ id: 'book', label: 'book' }, { id: 'bag', label: 'bag' }, { id: 'ruler', label: 'ruler' }], answer: 'book', explanation: 'The blue object with pages is a book.', xp: 3 },
          { id: 'u2-l1-a3', type: 'LISTEN_CHOOSE', prompt: 'Con nghe thấy đồ vật nào?', speechText: 'This is my school bag.', choices: [{ id: 'bag', label: 'school bag' }, { id: 'book', label: 'book' }, { id: 'pencil', label: 'pencil' }], answer: 'bag', xp: 3 },
          { id: 'u2-l1-a4', type: 'MATCHING', prompt: 'Nối đồ dùng với nghĩa đúng', pairs: [{ left: 'book', right: 'quyển sách' }, { left: 'pencil', right: 'bút chì' }, { left: 'ruler', right: 'thước kẻ' }], xp: 4 },
          { id: 'u2-l1-a5', type: 'FILL_IN_BLANK', prompt: 'Điền tên đồ vật', sentence: 'This is a ____.', answer: 'book', explanation: '“A book” nghĩa là một quyển sách.', xp: 3 },
          { id: 'u2-l1-a6', type: 'TRUE_FALSE', prompt: 'The school bag is red.', image: classroomImage, answer: true, explanation: 'Đúng rồi, chiếc cặp trong tranh có màu đỏ.', xp: 3 },
          { id: 'u2-l1-a7', type: 'IMAGE_CAPTION', prompt: 'Photo mission', instruction: 'Chụp một đồ dùng học tập và khám phá tên tiếng Anh của nó.', xp: 5 },
        ],
      },
      {
        id: 'u2-l2', title: 'I can do it', objective: 'Nói về hoạt động trong lớp', icon: 'pencil', color: '#8C78E6', estimatedMinutes: 7,
        activities: [
          { id: 'u2-l2-a1', type: 'MULTIPLE_CHOICE', prompt: 'I can ___ a picture.', choices: [{ id: 'draw', label: 'draw' }, { id: 'eat', label: 'eat' }, { id: 'sleep', label: 'sleep' }], answer: 'draw', explanation: '“Draw a picture” nghĩa là vẽ một bức tranh.', xp: 3 },
          { id: 'u2-l2-a2', type: 'LISTEN_CHOOSE', prompt: 'Bạn nhỏ có thể làm gì?', speechText: 'I can read a book.', choices: [{ id: 'read', label: 'read a book' }, { id: 'draw', label: 'draw a cat' }, { id: 'run', label: 'run fast' }], answer: 'read', xp: 3 },
          { id: 'u2-l2-a3', type: 'MATCHING', prompt: 'Nối hoạt động với nghĩa đúng', pairs: [{ left: 'read', right: 'đọc' }, { left: 'write', right: 'viết' }, { left: 'draw', right: 'vẽ' }], xp: 4 },
          { id: 'u2-l2-a4', type: 'SENTENCE_BUILDER', prompt: 'Xếp thành câu đúng', words: ['I', 'can', 'read', 'a', 'book.'], answer: 'I can read a book.', xp: 4 },
          { id: 'u2-l2-a5', type: 'TRUE_FALSE', prompt: 'I can write with a pencil.', image: classroomImage, answer: true, xp: 3 },
          { id: 'u2-l2-a6', type: 'FILL_IN_BLANK', prompt: 'Điền hoạt động phù hợp', sentence: 'I can ____ my name.', answer: 'write', explanation: '“Write my name” nghĩa là viết tên của mình.', xp: 3 },
          { id: 'u2-l2-a7', type: 'SPEAK_REPEAT', prompt: 'I can read and write.', instruction: 'Đọc to và nhấn rõ hai từ “read” và “write”.', xp: 5 },
        ],
      },
    ],
  },
  {
    id: 'unit-3',
    title: 'Animals around us',
    subtitle: 'Động vật và khả năng của chúng',
    color: '#FFC83D',
    accent: '#D99B13',
    coverImage: animalsImage,
    lessons: [
      {
        id: 'u3-l1', title: 'Animal friends', objective: 'Nhận biết và mô tả động vật', icon: 'paw', color: '#FFC83D', estimatedMinutes: 7,
        activities: [
          { id: 'u3-l1-a1', type: 'WORD_CARD', prompt: 'dog', meaning: 'chú chó', example: 'The dog is happy.', image: animalsImage, xp: 2 },
          { id: 'u3-l1-a2', type: 'IMAGE_CHOICE', prompt: 'Choose the dog.', image: animalsImage, choices: [{ id: 'dog', label: 'dog' }, { id: 'cat', label: 'cat' }, { id: 'bird', label: 'bird' }], answer: 'dog', xp: 3 },
          { id: 'u3-l1-a3', type: 'LISTEN_CHOOSE', prompt: 'Con nghe thấy con vật nào?', speechText: 'The little bird can fly.', choices: [{ id: 'bird', label: 'bird' }, { id: 'horse', label: 'horse' }, { id: 'cat', label: 'cat' }], answer: 'bird', xp: 3 },
          { id: 'u3-l1-a4', type: 'MATCHING', prompt: 'Nối con vật với nghĩa đúng', pairs: [{ left: 'dog', right: 'chó' }, { left: 'cat', right: 'mèo' }, { left: 'bird', right: 'chim' }], xp: 4 },
          { id: 'u3-l1-a5', type: 'FILL_IN_BLANK', prompt: 'Điền con vật phù hợp', sentence: 'It is a small ____.', answer: 'cat', xp: 3 },
          { id: 'u3-l1-a6', type: 'TRUE_FALSE', prompt: 'There is a horse in the picture.', image: animalsImage, answer: true, xp: 3 },
          { id: 'u3-l1-a7', type: 'SPEAK_REPEAT', prompt: 'The little bird can fly.', instruction: 'Đọc chậm và rõ từng từ.', xp: 5 },
        ],
      },
      {
        id: 'u3-l2', title: 'Amazing animals', objective: 'Nói về khả năng của động vật', icon: 'run-fast', color: '#FF7168', estimatedMinutes: 7,
        activities: [
          { id: 'u3-l2-a1', type: 'LISTEN_CHOOSE', prompt: 'Con ngựa có thể làm gì?', speechText: 'A horse can run fast.', choices: [{ id: 'run', label: 'run fast' }, { id: 'fly', label: 'fly high' }, { id: 'read', label: 'read books' }], answer: 'run', xp: 3 },
          { id: 'u3-l2-a2', type: 'MULTIPLE_CHOICE', prompt: 'A bird can ___.', choices: [{ id: 'fly', label: 'fly' }, { id: 'write', label: 'write' }, { id: 'read', label: 'read' }], answer: 'fly', xp: 3 },
          { id: 'u3-l2-a3', type: 'MATCHING', prompt: 'Nối con vật với hoạt động', pairs: [{ left: 'bird', right: 'fly' }, { left: 'horse', right: 'run' }, { left: 'dog', right: 'jump' }], xp: 4 },
          { id: 'u3-l2-a4', type: 'SENTENCE_BUILDER', prompt: 'Xếp thành câu đúng', words: ['A', 'horse', 'can', 'run', 'fast.'], answer: 'A horse can run fast.', xp: 4 },
          { id: 'u3-l2-a5', type: 'FILL_IN_BLANK', prompt: 'Điền hoạt động phù hợp', sentence: 'A bird can ____.', answer: 'fly', xp: 3 },
          { id: 'u3-l2-a6', type: 'TRUE_FALSE', prompt: 'A cat can fly.', image: animalsImage, answer: false, explanation: 'A cat can run and jump, but it cannot fly.', xp: 3 },
          { id: 'u3-l2-a7', type: 'SPEAK_REPEAT', prompt: 'A horse can run fast.', instruction: 'Nghe mẫu rồi đọc với giọng thật tự tin.', xp: 5 },
        ],
      },
    ],
  },
];

export const allLessons = curriculum.flatMap((unit) => unit.lessons);
export const allActivities = allLessons.flatMap((lesson) => lesson.activities);
export const findLesson = (lessonId: string): Lesson | undefined => allLessons.find((lesson) => lesson.id === lessonId);
export const findActivity = (activityId: string): Activity | undefined => allActivities.find((activity) => activity.id === activityId);

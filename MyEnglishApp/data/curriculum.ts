import { Activity, LearningUnit, Lesson } from '@/types/learning';

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const curriculum: LearningUnit[] = [
  {
    id: 'unit-1', title: 'Hello, friends!', subtitle: 'Chao hoi va gioi thieu ban than', color: '#58CC65', accent: '#38A74A',
    lessons: [
      {
        id: 'u1-l1', title: 'Say hello', objective: 'Chao hoi va noi ten cua minh', icon: 'hand-wave', color: '#58CC65', estimatedMinutes: 4,
        activities: [
          { id: 'u1-l1-a1', type: 'WORD_CARD', prompt: 'Hello!', meaning: 'Xin chao!', example: 'Hello, I am Mia.', imageUrl: photo('photo-1544717305-2782549b5136'), xp: 2 },
          { id: 'u1-l1-a2', type: 'MULTIPLE_CHOICE', prompt: 'Choose the best greeting.', choices: [{ id: 'hello', label: 'Hello!' }, { id: 'book', label: 'A book' }, { id: 'blue', label: 'Blue' }], answer: 'hello', explanation: 'We say "Hello" when we meet someone.', xp: 3 },
          { id: 'u1-l1-a3', type: 'FILL_IN_BLANK', prompt: 'Complete the sentence', sentence: 'My name is ____.', answer: 'Mia', explanation: 'Use "My name is..." to introduce yourself.', xp: 3 },
          { id: 'u1-l1-a4', type: 'SENTENCE_BUILDER', prompt: 'Build the sentence', words: ['Hello,', 'my', 'name', 'is', 'Ben.'], answer: 'Hello, my name is Ben.', xp: 4 },
          { id: 'u1-l1-a5', type: 'SPEAK_REPEAT', prompt: 'Hello, my name is Ben.', instruction: 'Doc to cau nay thanh tieng', xp: 3 },
        ],
      },
      {
        id: 'u1-l2', title: 'Meet my friends', objective: 'Gioi thieu ban be va thay co', icon: 'account-group', color: '#4AADE8', estimatedMinutes: 5,
        activities: [
          { id: 'u1-l2-a1', type: 'IMAGE_CHOICE', prompt: 'Who is the teacher?', imageUrl: photo('photo-1509062522246-3755977927d7'), choices: [{ id: 'teacher', label: 'teacher' }, { id: 'friend', label: 'friend' }, { id: 'student', label: 'student' }], answer: 'teacher', xp: 3 },
          { id: 'u1-l2-a2', type: 'TRUE_FALSE', prompt: 'She is my teacher.', imageUrl: photo('photo-1544717305-996b815c338c'), answer: true, xp: 3 },
          { id: 'u1-l2-a3', type: 'MATCHING', prompt: 'Match the words', pairs: [{ left: 'friend', right: 'ban' }, { left: 'teacher', right: 'giao vien' }, { left: 'classmate', right: 'ban cung lop' }], xp: 4 },
          { id: 'u1-l2-a4', type: 'MULTIPLE_CHOICE', prompt: 'Complete: She ___ my friend.', choices: [{ id: 'is', label: 'is' }, { id: 'are', label: 'are' }, { id: 'am', label: 'am' }], answer: 'is', xp: 3 },
          { id: 'u1-l2-a5', type: 'FILL_IN_BLANK', prompt: 'Write the missing word', sentence: 'He is my ____.', answer: 'friend', xp: 3 },
        ],
      },
    ],
  },
  {
    id: 'unit-2', title: 'At school', subtitle: 'Do dung va hoat dong trong lop', color: '#4AADE8', accent: '#238AC6',
    lessons: [
      {
        id: 'u2-l1', title: 'Classroom words', objective: 'Goi ten do dung hoc tap', icon: 'school', color: '#4AADE8', estimatedMinutes: 5,
        activities: [
          { id: 'u2-l1-a1', type: 'WORD_CARD', prompt: 'pencil', meaning: 'but chi', example: 'This is a pencil.', imageUrl: photo('photo-1455390582262-044cdead277a'), xp: 2 },
          { id: 'u2-l1-a2', type: 'IMAGE_CHOICE', prompt: 'Choose the book.', imageUrl: photo('photo-1495446815901-a7297e633e8d'), choices: [{ id: 'book', label: 'book' }, { id: 'bag', label: 'bag' }, { id: 'ruler', label: 'ruler' }], answer: 'book', xp: 3 },
          { id: 'u2-l1-a3', type: 'FILL_IN_BLANK', prompt: 'Complete the sentence', sentence: 'This is a ____.', answer: 'book', xp: 3 },
          { id: 'u2-l1-a4', type: 'TRUE_FALSE', prompt: 'These are pencils.', imageUrl: photo('photo-1517841905240-472988babdf9'), answer: false, explanation: 'The picture shows a person, not pencils.', xp: 3 },
          { id: 'u2-l1-a5', type: 'IMAGE_CAPTION', prompt: 'Photo mission', instruction: 'Chup mot do dung hoc tap va kham pha ten tieng Anh cua no.', xp: 5 },
        ],
      },
      {
        id: 'u2-l2', title: 'I can do it', objective: 'Noi ve hoat dong trong lop', icon: 'pencil', color: '#8C78E6', estimatedMinutes: 5,
        activities: [
          { id: 'u2-l2-a1', type: 'MULTIPLE_CHOICE', prompt: 'I can ___ a picture.', choices: [{ id: 'draw', label: 'draw' }, { id: 'eat', label: 'eat' }, { id: 'sleep', label: 'sleep' }], answer: 'draw', xp: 3 },
          { id: 'u2-l2-a2', type: 'MATCHING', prompt: 'Match each action', pairs: [{ left: 'read', right: 'doc' }, { left: 'write', right: 'viet' }, { left: 'draw', right: 've' }], xp: 4 },
          { id: 'u2-l2-a3', type: 'SENTENCE_BUILDER', prompt: 'Build the sentence', words: ['I', 'can', 'read', 'a', 'book.'], answer: 'I can read a book.', xp: 4 },
          { id: 'u2-l2-a4', type: 'TRUE_FALSE', prompt: 'I can write with a pencil.', answer: true, xp: 3 },
          { id: 'u2-l2-a5', type: 'SPEAK_REPEAT', prompt: 'I can read and write.', instruction: 'Doc to va ro rang', xp: 3 },
        ],
      },
    ],
  },
  {
    id: 'unit-3', title: 'Animals around us', subtitle: 'Dong vat va kha nang cua chung', color: '#FFC83D', accent: '#D99B13',
    lessons: [
      {
        id: 'u3-l1', title: 'Animal friends', objective: 'Nhan biet va mo ta dong vat', icon: 'paw', color: '#FFC83D', estimatedMinutes: 5,
        activities: [
          { id: 'u3-l1-a1', type: 'IMAGE_CHOICE', prompt: 'Choose the dog.', imageUrl: photo('photo-1552053831-71594a27632d'), choices: [{ id: 'dog', label: 'dog' }, { id: 'cat', label: 'cat' }, { id: 'bird', label: 'bird' }], answer: 'dog', xp: 3 },
          { id: 'u3-l1-a2', type: 'MULTIPLE_CHOICE', prompt: 'A bird can ___.', choices: [{ id: 'fly', label: 'fly' }, { id: 'read', label: 'read' }, { id: 'write', label: 'write' }], answer: 'fly', xp: 3 },
          { id: 'u3-l1-a3', type: 'MATCHING', prompt: 'Match the animal', pairs: [{ left: 'dog', right: 'cho' }, { left: 'cat', right: 'meo' }, { left: 'bird', right: 'chim' }], xp: 4 },
          { id: 'u3-l1-a4', type: 'FILL_IN_BLANK', prompt: 'Complete the sentence', sentence: 'It is a small ____.', answer: 'cat', xp: 3 },
          { id: 'u3-l1-a5', type: 'SENTENCE_BUILDER', prompt: 'Build the sentence', words: ['A', 'horse', 'can', 'run', 'fast.'], answer: 'A horse can run fast.', xp: 4 },
        ],
      },
    ],
  },
];

export const allLessons = curriculum.flatMap((unit) => unit.lessons);
export const allActivities = allLessons.flatMap((lesson) => lesson.activities);
export const findLesson = (lessonId: string): Lesson | undefined => allLessons.find((lesson) => lesson.id === lessonId);
export const findActivity = (activityId: string): Activity | undefined => allActivities.find((activity) => activity.id === activityId);

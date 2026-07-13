# Curriculum Seed

## Source

Local PDF:

`document/Fun for Flyers Student_s Book 4th edition - Flip PDF _ FlipBuilder.pdf`

The previous environment did not have Poppler, Python, or OCR tools available on PATH, so direct extraction was not completed. Treat the examples below as a starter curriculum structure inspired by the Flyers-level book, not as exact copied textbook content.

When tools are available, extract only what is needed:

1. Cover/title page.
2. Table of contents.
3. 2-3 representative units.
4. Vocabulary lists, grammar targets, and exercise patterns.
5. Avoid storing large copyrighted passages verbatim; store brief summaries and original activity metadata.

## Curriculum Shape

Target level: A2 Flyers / upper primary children.

Lesson themes should be concrete and visual:

- family and friends
- school and classroom
- animals
- food and shopping
- home and rooms
- hobbies and sports
- weather and clothes
- places in town
- travel and holidays
- stories and daily routines

## Seed Course

Course:

- Title: Fun English Path
- Level: A2 Flyers
- Audience: children
- Goal: build vocabulary, sentence patterns, listening/reading confidence, and short speaking practice.

## Seed Units

Unit 1: Hello, friends

- Objective: greet people, introduce self, identify people.
- Vocabulary: friend, teacher, classmate, boy, girl, name, age.
- Grammar: I am..., My name is..., He/She is...
- Activities:
  - image choice: choose the person matching the word.
  - multiple choice: complete "My name is ____."
  - matching: word to Vietnamese meaning.
  - speaking placeholder: repeat "Hello, my name is..."

Unit 2: At school

- Objective: name classroom objects and simple actions.
- Vocabulary: book, pencil, ruler, desk, board, bag, read, write, draw.
- Grammar: This is a..., These are..., I can...
- Activities:
  - image choice: identify classroom object.
  - fill blank: "This is a ____."
  - true/false: image caption check.
  - image caption mission: take a photo of a school object and receive a simple English caption.
  - listen and choose placeholder: hear word, choose image.

Unit 3: Animals around us

- Objective: describe animals with simple adjectives.
- Vocabulary: cat, dog, bird, horse, monkey, big, small, fast, slow.
- Grammar: It is..., It can..., has/have.
- Activities:
  - matching: animal to ability.
  - multiple choice: "A bird can ____."
  - image choice: choose animal from picture.
  - review: mixed vocabulary.

## Data Template

Use this JSON shape for seed import:

```json
{
  "course": "Fun English Path",
  "unit": "At school",
  "lesson": "Classroom words",
  "objective": "Learner can name classroom objects.",
  "vocabulary": [
    {
      "word": "book",
      "meaning": "sach",
      "partOfSpeech": "noun",
      "example": "This is a book."
    }
  ],
  "activities": [
    {
      "type": "IMAGE_CHOICE",
      "prompt": "Choose the book.",
      "data": {
        "answer": "book",
        "distractors": ["bag", "ruler", "desk"]
      }
    },
    {
      "type": "IMAGE_CAPTION",
      "prompt": "Take or upload a photo of a classroom object.",
      "data": {
        "theme": "classroom object",
        "followUp": "FILL_IN_BLANK",
        "mockCaption": "This is a book."
      }
    }
  ]
}
```

## Extraction Todo

- Install or expose `pdftotext`, `pdfinfo`, and `pdftoppm`, or use an OCR tool if pages are images.
- Save a short extracted outline to this file.
- Create `seed-curriculum.json` only after verifying the exact unit names and topics from the PDF.

package com.example.englishapp_server.dto.request;

import lombok.Data;

import java.util.List;

public class QuestionDataDTO {
    @Data
    public static class FillInBlank {
        private String fullSentence;     // Vd: "The suitcase is big"
        private List<String> missingWords; // Vd: ["suitcase"]
    }

    // 2. Format cho MULTIPLE_CHOICE
    @Data
    public static class MultipleChoice {
        private String question;         // "Which word means 'hành lý'?"
        private String correctAnswer;    // Vd: "Suitcase"
        private List<String> distractors; // Vd: ["Backpack", "Bag"]
    }

    // 3. Format cho IMAGE_BLANK (Ảnh có caption đục lỗ như ý bạn)
    @Data
    public static class ImageBlank {
        private String imageUrl;
        private String caption;          // Vd: "A big blue suitcase"
        private List<String> missingWords; // Vd: ["suitcase", "blue"]
    }
}

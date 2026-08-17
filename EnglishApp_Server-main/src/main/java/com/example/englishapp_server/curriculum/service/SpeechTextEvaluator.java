package com.example.englishapp_server.curriculum.service;

import java.text.Normalizer;
import java.util.Locale;

/** Deterministic transcript comparison; it does not claim to grade phonemes. */
public final class SpeechTextEvaluator {
    private SpeechTextEvaluator() {}

    public static SpeechAssessment assess(String expected, String transcript) {
        String[] expectedWords = normalized(expected).split(" ");
        String[] actualWords = normalized(transcript).split(" ");
        if (expectedWords.length == 0 || actualWords.length == 0 || expectedWords[0].isBlank() || actualWords[0].isBlank()) {
            return new SpeechAssessment(false, 0);
        }
        if (String.join(" ", expectedWords).equals(String.join(" ", actualWords))) {
            return new SpeechAssessment(true, 100);
        }

        int sharedWordsInOrder = longestCommonSubsequence(expectedWords, actualWords);
        double coverage = (double) sharedWordsInOrder / expectedWords.length;
        double precision = (double) sharedWordsInOrder / actualWords.length;
        int score = (int) Math.round((2 * coverage * precision / (coverage + precision)) * 100);
        return new SpeechAssessment(coverage >= 0.90 && score >= 85, score);
    }

    static String normalized(String value) {
        if (value == null) return "";
        String expanded = value.toLowerCase(Locale.ROOT)
                .replaceAll("\\bi'm\\b", "i am")
                .replaceAll("\\byou're\\b", "you are")
                .replaceAll("\\bwe're\\b", "we are")
                .replaceAll("\\bthey're\\b", "they are")
                .replaceAll("\\bcan't\\b", "cannot")
                .replaceAll("\\bdon't\\b", "do not");
        return Normalizer.normalize(expanded, Normalizer.Form.NFKD)
                .replaceAll("[^\\p{L}\\p{N}]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }

    private static int longestCommonSubsequence(String[] left, String[] right) {
        int[][] lengths = new int[left.length + 1][right.length + 1];
        for (int i = 1; i <= left.length; i++) {
            for (int j = 1; j <= right.length; j++) {
                lengths[i][j] = left[i - 1].equals(right[j - 1])
                        ? lengths[i - 1][j - 1] + 1
                        : Math.max(lengths[i - 1][j], lengths[i][j - 1]);
            }
        }
        return lengths[left.length][right.length];
    }
}

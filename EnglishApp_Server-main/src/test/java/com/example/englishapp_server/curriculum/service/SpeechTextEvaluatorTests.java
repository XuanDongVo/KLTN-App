package com.example.englishapp_server.curriculum.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SpeechTextEvaluatorTests {
    @Test
    void acceptsExactPhraseIgnoringCaseAndPunctuation() {
        SpeechAssessment result = SpeechTextEvaluator.assess("I go to school every day.", "i go to school every day");
        assertTrue(result.correct());
        assertEquals(100, result.matchScore());
    }

    @Test
    void rejectsPhraseMissingAnImportantWord() {
        SpeechAssessment result = SpeechTextEvaluator.assess("I go to school every day", "I go school every day");
        assertFalse(result.correct());
    }

    @Test
    void acceptsSupportedContractionVariant() {
        SpeechAssessment result = SpeechTextEvaluator.assess("I am happy", "I'm happy!");
        assertTrue(result.correct());
    }
}

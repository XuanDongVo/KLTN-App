package com.example.englishapp_server.curriculum.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class SpeechTranscriptionService {
    private static final Logger log = LoggerFactory.getLogger(SpeechTranscriptionService.class);
    private static final long MAX_AUDIO_BYTES = 3 * 1024 * 1024;

    private final String apiKey;
    private final String model;

    public SpeechTranscriptionService(@Value("${gemini.api-key:}") String apiKey,
                                      @Value("${gemini.transcription-model:gemini-3.6-flash}") String model) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = model == null || model.isBlank() ? "gemini-3.6-flash" : model.trim();
    }

    public String transcribe(MultipartFile audio, String expectedPhrase) {
        if (apiKey.isBlank()) throw new IllegalStateException("GEMINI_API_KEY or GOOGLE_API_KEY is not configured for speaking practice.");
        if (audio == null || audio.isEmpty()) throw new IllegalArgumentException("Audio recording is empty.");
        if (audio.getSize() > MAX_AUDIO_BYTES) throw new IllegalArgumentException("Audio recording is too large.");

        try {
            byte[] bytes = audio.getBytes();
            String prompt = buildPrompt(expectedPhrase);
            Content content = Content.fromParts(
                    Part.fromText(prompt),
                    Part.fromBytes(bytes, contentType(audio.getContentType()))
            );

            Client client = Client.builder().apiKey(apiKey).build();
            GenerateContentResponse response = client.models.generateContent(model, content, null);
            return cleanTranscript(response == null ? "" : response.text());
        } catch (IOException exception) {
            throw new IllegalArgumentException("Cannot read audio recording.");
        } catch (RuntimeException exception) {
            log.warn("Gemini transcription failed. model={}, error={}", model, exception.getMessage());
            throw new IllegalStateException("Gemini could not transcribe the audio right now. Check Gemini API key, quota, billing, and model access.");
        }
    }

    private String buildPrompt(String expectedPhrase) {
        String hint = expectedPhrase == null || expectedPhrase.isBlank()
                ? ""
                : "\nExpected phrase for context only: " + expectedPhrase.trim();
        return """
                Transcribe the spoken English audio.
                Return only the exact English transcript.
                Do not translate, explain, score, add labels, or add markdown.
                If there is no clear speech, return an empty string.
                """ + hint;
    }

    private String cleanTranscript(String value) {
        if (value == null) return "";
        String transcript = value.trim();
        if (transcript.startsWith("\"") && transcript.endsWith("\"") && transcript.length() > 1) {
            transcript = transcript.substring(1, transcript.length() - 1).trim();
        }
        return transcript;
    }

    private String contentType(String value) {
        return value == null || value.isBlank() ? "audio/m4a" : value;
    }
}

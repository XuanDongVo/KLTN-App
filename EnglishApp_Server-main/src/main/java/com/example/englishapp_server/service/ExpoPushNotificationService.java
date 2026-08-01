package com.example.englishapp_server.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@Service
public class ExpoPushNotificationService {
    private static final Logger logger = LoggerFactory.getLogger(ExpoPushNotificationService.class);
    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
    
    private final RestTemplate restTemplate;

    public ExpoPushNotificationService() {
        this.restTemplate = new RestTemplate();
    }

    public void sendPushNotification(String toToken, String title, String body, Map<String, Object> data) {
        if (toToken == null || toToken.isBlank() || !toToken.startsWith("ExponentPushToken[")) {
            logger.warn("Invalid Expo Push Token: {}", toToken);
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");

            Map<String, Object> payload = new HashMap<>();
            payload.put("to", toToken);
            payload.put("sound", "default");
            payload.put("title", title);
            payload.put("body", body);
            if (data != null) {
                payload.put("data", data);
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(EXPO_PUSH_URL, request, String.class);
            
            logger.info("Push notification sent to {}, response: {}", toToken, response.getBody());
        } catch (Exception e) {
            logger.error("Failed to send Expo push notification", e);
        }
    }
}

package com.example.englishapp_server.notification;

import com.example.englishapp_server.entity.User;
import com.example.englishapp_server.service.ExpoPushNotificationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ExpoPushNotificationService pushService;
    private final ObjectMapper objectMapper;

    public NotificationService(NotificationRepository notificationRepository, ExpoPushNotificationService pushService, ObjectMapper objectMapper) {
        this.notificationRepository = notificationRepository;
        this.pushService = pushService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void sendAndSaveNotification(User user, String title, String message, Map<String, Object> data) {
        // Send Expo Push Notification
        if (user.getExpoPushToken() != null && !user.getExpoPushToken().isBlank()) {
            pushService.sendPushNotification(user.getExpoPushToken(), title, message, data);
        }

        // Save to Database
        String dataJson = null;
        if (data != null && !data.isEmpty()) {
            try {
                dataJson = objectMapper.writeValueAsString(data);
            } catch (JsonProcessingException e) {
                // Ignore serialization error
            }
        }

        Notification notification = new Notification(user.getId(), title, message, dataJson);
        notificationRepository.save(notification);
    }

    public Page<Notification> getUserNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long id, UUID userId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        
        if (!notification.getUserId().equals(userId)) {
            throw new IllegalStateException("Unauthorized to mark this notification as read");
        }
        
        if (!notification.getIsRead()) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }
}

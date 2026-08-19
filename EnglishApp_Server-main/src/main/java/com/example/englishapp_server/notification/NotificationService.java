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
import org.springframework.data.domain.PageRequest;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ExpoPushNotificationService pushService;
    private final ObjectMapper objectMapper;
    private final com.example.englishapp_server.repository.jpa.UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, ExpoPushNotificationService pushService, ObjectMapper objectMapper, com.example.englishapp_server.repository.jpa.UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.pushService = pushService;
        this.objectMapper = objectMapper;
        this.userRepository = userRepository;
    }

    @Transactional
    public void updatePushTokenAndSync(UUID userId, String token) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setExpoPushToken(token);
        userRepository.save(user);
        
        syncUnreadPushNotifications(user);
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

    public void syncUnreadPushNotifications(User user) {
        if (user.getExpoPushToken() == null || user.getExpoPushToken().isBlank()) {
            return;
        }

        java.util.List<Notification> unreadList = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(
                user.getId(), PageRequest.of(0, 6)); // Fetch up to 6

        if (unreadList.isEmpty()) {
            return;
        }

        int limit = 5;
        for (int i = 0; i < Math.min(unreadList.size(), limit); i++) {
            Notification notif = unreadList.get(i);
            
            java.util.Map<String, Object> dataMap = null;
            if (notif.getDataJson() != null && !notif.getDataJson().isBlank()) {
                try {
                    dataMap = objectMapper.readValue(notif.getDataJson(), new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>>(){});
                } catch (JsonProcessingException e) {
                    // Ignore parsing error
                }
            }
            
            pushService.sendPushNotification(user.getExpoPushToken(), notif.getTitle(), notif.getMessage(), dataMap);
        }

        // If there are more than 5, send an aggregate notification
        long totalUnread = getUnreadCount(user.getId());
        if (totalUnread > limit) {
            long remaining = totalUnread - limit;
            pushService.sendPushNotification(
                    user.getExpoPushToken(),
                    "Bạn có thông báo mới",
                    "Bạn còn " + remaining + " thông báo chưa đọc khác. Hãy mở ứng dụng để xem chi tiết.",
                    null
            );
        }
    }
}

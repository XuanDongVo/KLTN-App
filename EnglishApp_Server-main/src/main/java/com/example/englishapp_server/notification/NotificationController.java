package com.example.englishapp_server.notification;

import com.example.englishapp_server.dto.response.ServerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<?> getNotifications(
            @RequestAttribute("userId") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<Notification> notifications = notificationService.getUserNotifications(UUID.fromString(userId), PageRequest.of(page, size));
        return ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(@RequestAttribute("userId") String userId) {
        long count = notificationService.getUnreadCount(UUID.fromString(userId));
        return ok(count);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@RequestAttribute("userId") String userId, @PathVariable Long id) {
        notificationService.markAsRead(id, UUID.fromString(userId));
        return ok(null);
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestAttribute("userId") String userId) {
        notificationService.markAllAsRead(UUID.fromString(userId));
        return ok(null);
    }

    private ResponseEntity<?> ok(Object data) {
        return ResponseEntity.ok(ServerResponse.success(data));
    }
}

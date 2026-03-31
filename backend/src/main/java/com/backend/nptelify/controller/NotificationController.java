package com.backend.nptelify.controller;

import com.backend.nptelify.dto.NotificationResponse;
import com.backend.nptelify.entity.Notification;
import com.backend.nptelify.entity.User;
import com.backend.nptelify.service.NotificationService;
import com.backend.nptelify.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    /**
     * Get all notifications for current user
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications() {
        User user = userDetailsService.getCurrentUser();
        List<Notification> notifications = notificationService.getUserNotifications(user);
        List<NotificationResponse> response = notifications.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get unread notifications for current user
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications() {
        User user = userDetailsService.getCurrentUser();
        List<Notification> notifications = notificationService.getUnreadNotifications(user);
        List<NotificationResponse> response = notifications.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get unread count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        User user = userDetailsService.getCurrentUser();
        long count = notificationService.getUnreadCount(user);
        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Mark notification as read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id) {
        Notification notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(toResponse(notification));
    }

    /**
     * Mark all notifications as read
     */
    @PutMapping("/mark-all-read")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        User user = userDetailsService.getCurrentUser();
        notificationService.markAllAsRead(user);
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read");
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a notification
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification deleted");
        return ResponseEntity.ok(response);
    }

    /**
     * Get recent notifications (last N)
     */
    @GetMapping("/recent/{limit}")
    public ResponseEntity<List<NotificationResponse>> getRecentNotifications(@PathVariable int limit) {
        User user = userDetailsService.getCurrentUser();
        List<Notification> notifications = notificationService.getRecentNotifications(user, limit);
        List<NotificationResponse> response = notifications.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Helper method to convert entity to DTO
    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.isRead(),
                notification.getCreatedAt(),
                notification.getReadAt()
        );
    }
}

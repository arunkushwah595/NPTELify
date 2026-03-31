package com.backend.nptelify.service;

import com.backend.nptelify.entity.Notification;
import com.backend.nptelify.entity.User;
import com.backend.nptelify.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * Create and save a notification for a user
     */
    public Notification createNotification(User user, String type, String title, String message) {
        Notification notification = new Notification(user, type, title, message);
        return notificationRepository.save(notification);
    }

    /**
     * Get all notifications for a user (ordered by newest first)
     */
    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /**
     * Get unread notifications for a user
     */
    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    /**
     * Get count of unread notifications
     */
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    /**
     * Mark a notification as read
     */
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    /**
     * Mark all notifications as read for a user
     */
    public void markAllAsRead(User user) {
        List<Notification> unread = getUnreadNotifications(user);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    /**
     * Delete a notification
     */
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    /**
     * Get recent notifications (limit)
     */
    public List<Notification> getRecentNotifications(User user, int limit) {
        return notificationRepository.findRecentNotifications(user, limit);
    }
}

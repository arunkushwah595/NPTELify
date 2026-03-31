package com.backend.nptelify.repository;

import com.backend.nptelify.entity.Notification;
import com.backend.nptelify.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);

    long countByUserAndIsReadFalse(User user);

    @Query("SELECT n FROM Notification n WHERE n.user = :user ORDER BY n.createdAt DESC LIMIT :limit")
    List<Notification> findRecentNotifications(@Param("user") User user, @Param("limit") int limit);
}

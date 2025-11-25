package com.example.stayops.repository;

import com.example.stayops.entity.Notification;
import com.example.stayops.enums.UserType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdAndUserTypeOrderByCreatedAtDesc(Long userId, UserType userType);

    List<Notification> findByUserIdAndUserTypeAndIsReadOrderByCreatedAtDesc(
            Long userId, UserType userType, Boolean isRead);

    Long countByUserIdAndUserTypeAndIsRead(Long userId, UserType userType, Boolean isRead);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.id = :id")
    void markAsRead(Long id);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP " +
            "WHERE n.userId = :userId AND n.userType = :userType")
    void markAllAsRead(Long userId, UserType userType);
}
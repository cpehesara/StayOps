package com.example.stayops.service;

import com.example.stayops.dto.NotificationDTO;
import com.example.stayops.dto.NotificationRequestDTO;
import com.example.stayops.enums.UserType;

import java.util.List;

public interface NotificationService {
    NotificationDTO createNotification(NotificationRequestDTO requestDTO);
    List<NotificationDTO> getUserNotifications(Long userId, UserType userType);
    List<NotificationDTO> getUnreadNotifications(Long userId, UserType userType);
    Long getUnreadCount(Long userId, UserType userType);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId, UserType userType);
    void deleteNotification(Long notificationId);
}
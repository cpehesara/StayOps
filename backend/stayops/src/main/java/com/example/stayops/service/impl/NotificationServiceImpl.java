package com.example.stayops.service.impl;

import com.example.stayops.dto.NotificationDTO;
import com.example.stayops.dto.NotificationRequestDTO;
import com.example.stayops.entity.Notification;
import com.example.stayops.enums.UserType;
import com.example.stayops.exception.ResourceNotFoundException;
import com.example.stayops.repository.NotificationRepository;
import com.example.stayops.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public NotificationDTO createNotification(NotificationRequestDTO requestDTO) {
        Notification notification = Notification.builder()
                .userId(requestDTO.getUserId())
                .userType(requestDTO.getUserType())
                .title(requestDTO.getTitle())
                .message(requestDTO.getMessage())
                .type(requestDTO.getType())
                .link(requestDTO.getLink())
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        return mapToDTO(saved);
    }

    @Override
    public List<NotificationDTO> getUserNotifications(Long userId, UserType userType) {
        return notificationRepository.findByUserIdAndUserTypeOrderByCreatedAtDesc(userId, userType)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationDTO> getUnreadNotifications(Long userId, UserType userType) {
        return notificationRepository.findByUserIdAndUserTypeAndIsReadOrderByCreatedAtDesc(userId, userType, false)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Long getUnreadCount(Long userId, UserType userType) {
        return notificationRepository.countByUserIdAndUserTypeAndIsRead(userId, userType, false);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new ResourceNotFoundException("Notification not found with id: " + notificationId);
        }
        notificationRepository.markAsRead(notificationId);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId, UserType userType) {
        notificationRepository.markAllAsRead(userId, userType);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new ResourceNotFoundException("Notification not found with id: " + notificationId);
        }
        notificationRepository.deleteById(notificationId);
    }

    private NotificationDTO mapToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .userType(notification.getUserType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .link(notification.getLink())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }
}
package com.example.stayops.dto;

import com.example.stayops.enums.NotificationType;
import com.example.stayops.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private Long id;
    private Long userId;
    private UserType userType;
    private String title;
    private String message;
    private NotificationType type;
    private Boolean isRead;
    private String link;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
package com.example.stayops.dto;

import com.example.stayops.enums.NotificationType;
import com.example.stayops.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequestDTO {
    private Long userId;
    private UserType userType;
    private String title;
    private String message;
    private NotificationType type;
    private String link;
}
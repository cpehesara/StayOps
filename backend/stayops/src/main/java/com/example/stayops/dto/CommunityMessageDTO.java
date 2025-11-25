package com.example.stayops.dto;

import com.example.stayops.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityMessageDTO {
    private Long id;
    private Long senderId;
    private String senderName;
    private UserType senderType;
    private String message;
    private String subject;
    private List<String> attachments;
    private Long parentMessageId;
    private Boolean isAnnouncement;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer replyCount; // Number of replies
}
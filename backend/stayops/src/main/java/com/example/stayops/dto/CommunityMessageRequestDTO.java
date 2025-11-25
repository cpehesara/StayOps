package com.example.stayops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityMessageRequestDTO {
    private String message;
    private String subject;
    private List<String> attachments;
    private Long parentMessageId;
    private Boolean isAnnouncement;
}
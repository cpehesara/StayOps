package com.example.stayops.service;

import com.example.stayops.dto.CommunityMessageDTO;
import com.example.stayops.dto.CommunityMessageRequestDTO;
import com.example.stayops.enums.UserType;

import java.util.List;

public interface CommunityMessageService {
    CommunityMessageDTO createMessage(CommunityMessageRequestDTO requestDTO, Long senderId, String senderName, UserType senderType);
    CommunityMessageDTO updateMessage(Long messageId, CommunityMessageRequestDTO requestDTO, Long userId);
    void deleteMessage(Long messageId, Long userId);
    CommunityMessageDTO getMessage(Long messageId);
    List<CommunityMessageDTO> getAllMessages();
    List<CommunityMessageDTO> getMainMessages();
    List<CommunityMessageDTO> getReplies(Long parentMessageId);
    List<CommunityMessageDTO> getAnnouncements();
    List<CommunityMessageDTO> getUserMessages(Long senderId);
}
package com.example.stayops.service.impl;

import com.example.stayops.dto.CommunityMessageDTO;
import com.example.stayops.dto.CommunityMessageRequestDTO;
import com.example.stayops.entity.CommunityMessage;
import com.example.stayops.enums.UserType;
import com.example.stayops.exception.ResourceNotFoundException;
import com.example.stayops.repository.CommunityMessageRepository;
import com.example.stayops.service.CommunityMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityMessageServiceImpl implements CommunityMessageService {

    private final CommunityMessageRepository messageRepository;

    @Override
    @Transactional
    public CommunityMessageDTO createMessage(CommunityMessageRequestDTO requestDTO, Long senderId,
                                             String senderName, UserType senderType) {
        CommunityMessage message = CommunityMessage.builder()
                .senderId(senderId)
                .senderName(senderName)
                .senderType(senderType)
                .message(requestDTO.getMessage())
                .subject(requestDTO.getSubject())
                .attachments(requestDTO.getAttachments())
                .parentMessageId(requestDTO.getParentMessageId())
                .isAnnouncement(requestDTO.getIsAnnouncement() != null ? requestDTO.getIsAnnouncement() : false)
                .isActive(true)
                .build();

        CommunityMessage saved = messageRepository.save(message);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public CommunityMessageDTO updateMessage(Long messageId, CommunityMessageRequestDTO requestDTO, Long userId) {
        CommunityMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + messageId));

        if (!message.getSenderId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this message");
        }

        message.setMessage(requestDTO.getMessage());
        message.setSubject(requestDTO.getSubject());
        message.setAttachments(requestDTO.getAttachments());

        CommunityMessage updated = messageRepository.save(message);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        CommunityMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + messageId));

        if (!message.getSenderId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this message");
        }

        message.setIsActive(false);
        messageRepository.save(message);
    }

    @Override
    public CommunityMessageDTO getMessage(Long messageId) {
        CommunityMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + messageId));
        return mapToDTO(message);
    }

    @Override
    public List<CommunityMessageDTO> getAllMessages() {
        return messageRepository.findByIsActiveOrderByCreatedAtDesc(true)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CommunityMessageDTO> getMainMessages() {
        return messageRepository.findMainMessages()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CommunityMessageDTO> getReplies(Long parentMessageId) {
        return messageRepository.findByParentMessageIdOrderByCreatedAtAsc(parentMessageId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CommunityMessageDTO> getAnnouncements() {
        return messageRepository.findByIsAnnouncementAndIsActiveOrderByCreatedAtDesc(true, true)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CommunityMessageDTO> getUserMessages(Long senderId) {
        return messageRepository.findBySenderIdOrderByCreatedAtDesc(senderId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private CommunityMessageDTO mapToDTO(CommunityMessage message) {
        Integer replyCount = messageRepository.findByParentMessageIdOrderByCreatedAtAsc(message.getId()).size();

        return CommunityMessageDTO.builder()
                .id(message.getId())
                .senderId(message.getSenderId())
                .senderName(message.getSenderName())
                .senderType(message.getSenderType())
                .message(message.getMessage())
                .subject(message.getSubject())
                .attachments(message.getAttachments())
                .parentMessageId(message.getParentMessageId())
                .isAnnouncement(message.getIsAnnouncement())
                .isActive(message.getIsActive())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .replyCount(replyCount)
                .build();
    }
}
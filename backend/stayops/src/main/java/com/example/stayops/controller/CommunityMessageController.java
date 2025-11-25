package com.example.stayops.controller;

import com.example.stayops.dto.CommunityMessageDTO;
import com.example.stayops.dto.CommunityMessageRequestDTO;
import com.example.stayops.enums.UserType;
import com.example.stayops.service.CommunityMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community-messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CommunityMessageController {

    private final CommunityMessageService messageService;

    @PostMapping
    public ResponseEntity<CommunityMessageDTO> createMessage(
            @RequestBody CommunityMessageRequestDTO requestDTO,
            @RequestParam Long senderId,
            @RequestParam String senderName,
            @RequestParam UserType senderType) {
        CommunityMessageDTO message = messageService.createMessage(requestDTO, senderId, senderName, senderType);
        return new ResponseEntity<>(message, HttpStatus.CREATED);
    }

    @PutMapping("/{messageId}")
    public ResponseEntity<CommunityMessageDTO> updateMessage(
            @PathVariable Long messageId,
            @RequestBody CommunityMessageRequestDTO requestDTO,
            @RequestParam Long userId) {
        CommunityMessageDTO message = messageService.updateMessage(messageId, requestDTO, userId);
        return ResponseEntity.ok(message);
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long messageId,
            @RequestParam Long userId) {
        messageService.deleteMessage(messageId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{messageId}")
    public ResponseEntity<CommunityMessageDTO> getMessage(@PathVariable Long messageId) {
        CommunityMessageDTO message = messageService.getMessage(messageId);
        return ResponseEntity.ok(message);
    }

    @GetMapping
    public ResponseEntity<List<CommunityMessageDTO>> getAllMessages() {
        List<CommunityMessageDTO> messages = messageService.getAllMessages();
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/main")
    public ResponseEntity<List<CommunityMessageDTO>> getMainMessages() {
        List<CommunityMessageDTO> messages = messageService.getMainMessages();
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/{parentMessageId}/replies")
    public ResponseEntity<List<CommunityMessageDTO>> getReplies(@PathVariable Long parentMessageId) {
        List<CommunityMessageDTO> replies = messageService.getReplies(parentMessageId);
        return ResponseEntity.ok(replies);
    }

    @GetMapping("/announcements")
    public ResponseEntity<List<CommunityMessageDTO>> getAnnouncements() {
        List<CommunityMessageDTO> announcements = messageService.getAnnouncements();
        return ResponseEntity.ok(announcements);
    }

    @GetMapping("/user/{senderId}")
    public ResponseEntity<List<CommunityMessageDTO>> getUserMessages(@PathVariable Long senderId) {
        List<CommunityMessageDTO> messages = messageService.getUserMessages(senderId);
        return ResponseEntity.ok(messages);
    }
}
package com.example.stayops.repository;

import com.example.stayops.entity.CommunityMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityMessageRepository extends JpaRepository<CommunityMessage, Long> {

    List<CommunityMessage> findByIsActiveOrderByCreatedAtDesc(Boolean isActive);

    List<CommunityMessage> findByParentMessageIdOrderByCreatedAtAsc(Long parentMessageId);

    List<CommunityMessage> findByIsAnnouncementAndIsActiveOrderByCreatedAtDesc(
            Boolean isAnnouncement, Boolean isActive);

    @Query("SELECT m FROM CommunityMessage m WHERE m.parentMessageId IS NULL " +
            "AND m.isActive = true ORDER BY m.createdAt DESC")
    List<CommunityMessage> findMainMessages();

    List<CommunityMessage> findBySenderIdOrderByCreatedAtDesc(Long senderId);
}
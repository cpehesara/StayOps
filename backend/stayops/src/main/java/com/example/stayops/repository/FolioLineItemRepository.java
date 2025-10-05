package com.example.stayops.repository;

import com.example.stayops.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FolioLineItemRepository extends JpaRepository<FolioLineItem, Long> {
    List<FolioLineItem> findByFolioIdOrderByTransactionDateDesc(Long folioId);
    List<FolioLineItem> findByFolioIdAndIsVoided(Long folioId, Boolean isVoided);
}
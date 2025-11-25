package com.example.stayops.repository;

import com.example.stayops.entity.FolioLineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FolioLineItemRepository extends JpaRepository<FolioLineItem, Long> {

    /**
     * Find all line items for a folio, ordered by transaction date descending
     */
    List<FolioLineItem> findByFolioIdOrderByTransactionDateDesc(Long folioId);

    /**
     * Find line items by folio and voided status
     */
    List<FolioLineItem> findByFolioIdAndIsVoided(Long folioId, Boolean isVoided);

    /**
     * Find active (non-voided) line items by folio ID
     */
    @Query("SELECT li FROM FolioLineItem li WHERE li.folio.id = :folioId AND li.isVoided = false")
    List<FolioLineItem> findActiveByFolioId(@Param("folioId") Long folioId);

    /**
     * Find line items by folio ID and item type (for specific charge types)
     */
    @Query("SELECT li FROM FolioLineItem li WHERE li.folio.id = :folioId " +
            "AND li.itemType = :itemType AND li.isVoided = false")
    List<FolioLineItem> findByFolioIdAndItemType(@Param("folioId") Long folioId,
                                                 @Param("itemType") String itemType);
}
package com.example.stayops.repository;

import com.example.stayops.entity.PricingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PricingRuleRepository extends JpaRepository<PricingRule, Long> {

    List<PricingRule> findByIsActiveTrueOrderByPriorityAsc();

    List<PricingRule> findByRuleTypeAndIsActive(String ruleType, Boolean isActive);

    @Query("SELECT p FROM PricingRule p WHERE p.isActive = true ORDER BY p.priority ASC, p.id ASC")
    List<PricingRule> findActiveRulesInOrder();
}
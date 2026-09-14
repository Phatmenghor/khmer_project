package com.emenu.features.bakong.repository;

import com.emenu.features.bakong.model.BakongAccount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BakongAccountRepository extends JpaRepository<BakongAccount, UUID> {

    Optional<BakongAccount> findByAccountId(String accountId);

    Optional<BakongAccount> findTopByIsDefaultTrueAndEnabledTrue();

    Optional<BakongAccount> findTopByEnabledTrue();

    List<BakongAccount> findAllByEnabledTrue();

    @Query("SELECT a FROM BakongAccount a WHERE a.isDeleted = false AND " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(a.accountId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.merchantName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.acquiringBank) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<BakongAccount> searchAccounts(@Param("search") String search, Pageable pageable);
}

package com.emenu.features.bakong.repository;

import com.emenu.features.bakong.model.BakongTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BakongTransactionRepository extends JpaRepository<BakongTransaction, UUID> {

    Optional<BakongTransaction> findByMd5(String md5);

    Optional<BakongTransaction> findByHash(String hash);

    @Query("SELECT t FROM BakongTransaction t WHERE :search IS NULL OR :search = '' OR " +
           "LOWER(t.md5) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.hash) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.status) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.projectCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.toAccountId) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<BakongTransaction> searchTransactions(@Param("search") String search, Pageable pageable);
}

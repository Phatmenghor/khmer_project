package com.emenu.features.bakong.repository;

import com.emenu.features.bakong.model.BakongTransactionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BakongTransactionLogRepository extends JpaRepository<BakongTransactionLog, UUID> {

    List<BakongTransactionLog> findByMd5OrderByCreatedAtDesc(String md5);

    List<BakongTransactionLog> findByTransactionIdOrderByCreatedAtDesc(String transactionId);

    List<BakongTransactionLog> findByTransactionRefIdOrderByCreatedAtDesc(UUID transactionRefId);
}

package com.emenu.features.bakong.repository;

import com.emenu.features.bakong.model.BakongTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BakongTransactionRepository extends JpaRepository<BakongTransaction, UUID> {

    Optional<BakongTransaction> findByMd5(String md5);

    Optional<BakongTransaction> findByHash(String hash);
}

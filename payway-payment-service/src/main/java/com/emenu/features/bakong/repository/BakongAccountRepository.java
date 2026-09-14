package com.emenu.features.bakong.repository;

import com.emenu.features.bakong.model.BakongAccount;
import org.springframework.data.jpa.repository.JpaRepository;
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
}

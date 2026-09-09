package com.emenu.features.payway.repository;

import com.emenu.features.payway.model.PayWayTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PayWayTransactionRepository extends JpaRepository<PayWayTransaction, Long> {

    Optional<PayWayTransaction> findByTranId(String tranId);
}

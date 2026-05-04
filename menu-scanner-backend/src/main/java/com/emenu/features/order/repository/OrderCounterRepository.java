package com.emenu.features.order.repository;

import com.emenu.features.order.models.OrderCounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderCounterRepository extends JpaRepository<OrderCounter, UUID> {

    Optional<OrderCounter> findByCounterDate(LocalDate counterDate);

    Optional<OrderCounter> findByBusinessIdAndCounterDate(UUID businessId, LocalDate counterDate);

    @Modifying
    @Query("UPDATE OrderCounter SET counterValue = counterValue + 1 WHERE counterDate = :date")
    int incrementCounterForDate(LocalDate date);

    @Modifying
    @Query("UPDATE OrderCounter SET counterValue = counterValue + 1 WHERE businessId = :businessId AND counterDate = :date")
    int incrementCounterForBusinessAndDate(UUID businessId, LocalDate date);
}

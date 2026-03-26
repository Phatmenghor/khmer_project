package com.emenu.features.order.repository;

import com.emenu.features.order.models.OrderItemPricingSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderItemPricingSnapshotRepository extends JpaRepository<OrderItemPricingSnapshot, UUID> {
    Optional<OrderItemPricingSnapshot> findByOrderItemId(UUID orderItemId);
}

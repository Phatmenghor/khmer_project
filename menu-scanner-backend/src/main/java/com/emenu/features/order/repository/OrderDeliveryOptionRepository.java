package com.emenu.features.order.repository;

import com.emenu.features.order.models.OrderDeliveryOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderDeliveryOptionRepository extends JpaRepository<OrderDeliveryOption, UUID> {
    Optional<OrderDeliveryOption> findByOrderId(UUID orderId);
}

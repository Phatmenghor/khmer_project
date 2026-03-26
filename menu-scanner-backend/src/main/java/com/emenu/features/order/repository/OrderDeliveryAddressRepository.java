package com.emenu.features.order.repository;

import com.emenu.features.order.models.OrderDeliveryAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderDeliveryAddressRepository extends JpaRepository<OrderDeliveryAddress, UUID> {
    Optional<OrderDeliveryAddress> findByOrderId(UUID orderId);
}

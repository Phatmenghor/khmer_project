package com.emenu.features.order.repository;

import com.emenu.features.order.models.OrderItemCustomization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemCustomizationRepository extends JpaRepository<OrderItemCustomization, UUID> {
    List<OrderItemCustomization> findByOrderItemId(UUID orderItemId);

    void deleteByOrderItemId(UUID orderItemId);
}

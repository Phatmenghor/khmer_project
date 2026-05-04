package com.emenu.features.order.repository;

import com.emenu.features.order.models.CartItemCustomization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CartItemCustomizationRepository extends JpaRepository<CartItemCustomization, UUID> {

    void deleteByCartItemId(UUID cartItemId);
}

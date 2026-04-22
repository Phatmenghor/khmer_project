package com.emenu.features.main.repository;

import com.emenu.features.main.models.ProductCustomization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductCustomizationRepository extends JpaRepository<ProductCustomization, UUID> {

    List<ProductCustomization> findByProductIdAndStatus(UUID productId, String status);

    List<ProductCustomization> findByProductId(UUID productId);

    List<ProductCustomization> findByProductIdOrderByPriceAdjustment(UUID productId);

    boolean existsByProductIdAndName(UUID productId, String name);
}

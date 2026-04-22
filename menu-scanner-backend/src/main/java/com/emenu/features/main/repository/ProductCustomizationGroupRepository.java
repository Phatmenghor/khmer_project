package com.emenu.features.main.repository;

import com.emenu.features.main.models.ProductCustomizationGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductCustomizationGroupRepository extends JpaRepository<ProductCustomizationGroup, UUID> {

    List<ProductCustomizationGroup> findByProductIdAndStatus(UUID productId, String status);

    List<ProductCustomizationGroup> findByProductId(UUID productId);

    Page<ProductCustomizationGroup> findByProductIdAndStatus(UUID productId, String status, Pageable pageable);

    Page<ProductCustomizationGroup> findByProductId(UUID productId, Pageable pageable);

    boolean existsByProductIdAndName(UUID productId, String name);
}

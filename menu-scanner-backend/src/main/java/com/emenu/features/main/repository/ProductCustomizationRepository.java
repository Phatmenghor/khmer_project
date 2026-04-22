package com.emenu.features.main.repository;

import com.emenu.features.main.models.ProductCustomization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductCustomizationRepository extends JpaRepository<ProductCustomization, UUID> {

    List<ProductCustomization> findByProductCustomizationGroupIdAndStatus(UUID groupId, String status);

    List<ProductCustomization> findByProductCustomizationGroupId(UUID groupId);

    List<ProductCustomization> findByProductCustomizationGroupIdOrderBySortOrder(UUID groupId);

    boolean existsByProductCustomizationGroupIdAndName(UUID groupId, String name);
}

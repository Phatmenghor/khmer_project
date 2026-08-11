package com.emenu.features.order.repository;

import com.emenu.features.order.enums.TableStatus;
import com.emenu.features.order.models.DiningTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DiningTableRepository extends JpaRepository<DiningTable, UUID>, JpaSpecificationExecutor<DiningTable> {
    List<DiningTable> findByBusinessIdAndIsDeletedFalse(UUID businessId);
    List<DiningTable> findByBusinessIdAndStatusAndIsDeletedFalse(UUID businessId, TableStatus status);
    Optional<DiningTable> findByIdAndBusinessIdAndIsDeletedFalse(UUID id, UUID businessId);
}

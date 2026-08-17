package com.emenu.features.order.repository;

import com.emenu.features.order.models.TableSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TableSessionRepository extends JpaRepository<TableSession, UUID>, JpaSpecificationExecutor<TableSession> {

    Optional<TableSession> findByTableIdAndStatus(UUID tableId, String status);

    Optional<TableSession> findByTableIdAndStatusIn(UUID tableId, List<String> statuses);

    List<TableSession> findByBusinessIdAndStatus(UUID businessId, String status);

    List<TableSession> findByBusinessIdAndStatusIn(UUID businessId, List<String> statuses);

    Page<TableSession> findByBusinessIdAndStatus(UUID businessId, String status, Pageable pageable);

    Page<TableSession> findByBusinessId(UUID businessId, Pageable pageable);

    Optional<TableSession> findBySessionNumber(String sessionNumber);
}

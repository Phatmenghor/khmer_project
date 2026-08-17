package com.emenu.features.order.repository;

import com.emenu.features.order.models.TableSessionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TableSessionItemRepository extends JpaRepository<TableSessionItem, UUID> {

    List<TableSessionItem> findBySessionId(UUID sessionId);
}

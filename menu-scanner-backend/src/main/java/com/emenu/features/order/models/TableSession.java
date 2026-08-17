package com.emenu.features.order.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "table_sessions", indexes = {
    @Index(name = "idx_table_sessions_business_id", columnList = "business_id"),
    @Index(name = "idx_table_sessions_table_id", columnList = "table_id"),
    @Index(name = "idx_table_sessions_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableSession extends BaseUUIDEntity {

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @Column(name = "table_id", nullable = false)
    private UUID tableId;

    @Column(name = "table_number", nullable = false)
    private String tableNumber;

    @Column(name = "zone")
    private String zone;

    @Column(name = "session_number", nullable = false, unique = true)
    private String sessionNumber;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // PENDING, ACTIVE, CLOSED, CANCELLED

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Builder.Default
    @Column(name = "total_items")
    private Integer totalItems = 0;

    @Builder.Default
    @Column(name = "subtotal", precision = 10, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "customization_total", precision = 10, scale = 2)
    private BigDecimal customizationTotal = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "tax_percentage", precision = 5, scale = 2)
    private BigDecimal taxPercentage = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Builder.Default
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TableSessionItem> items = new ArrayList<>();
}

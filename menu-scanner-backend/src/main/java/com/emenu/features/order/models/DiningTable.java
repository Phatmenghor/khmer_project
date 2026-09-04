package com.emenu.features.order.models;

import com.emenu.enums.order.TableStatus;
import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "dining_tables")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiningTable extends BaseUUIDEntity {

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @Column(name = "number", nullable = false)
    private String number;

    @Column(name = "name")
    private String name;

    @Column(name = "zone", nullable = false)
    private String zone;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TableStatus status = TableStatus.AVAILABLE;

    @Column(name = "active_order_id")
    private UUID activeOrderId;

    @Column(name = "seated_at")
    private LocalDateTime seatedAt;
}

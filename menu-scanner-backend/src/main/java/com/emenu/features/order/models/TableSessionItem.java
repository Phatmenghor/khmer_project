package com.emenu.features.order.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "table_session_items", indexes = {
    @Index(name = "idx_table_session_items_session_id", columnList = "session_id"),
    @Index(name = "idx_table_session_items_product_id", columnList = "product_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableSessionItem extends BaseUUIDEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private TableSession session;

    @Builder.Default
    @Column(name = "order_round", nullable = false)
    private Integer orderRound = 1;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "size_id")
    private UUID sizeId;

    @Column(name = "size_name")
    private String sizeName;

    @Builder.Default
    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Builder.Default
    @Column(name = "customization_total", precision = 10, scale = 2)
    private BigDecimal customizationTotal = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "status", nullable = false, length = 30)
    private String status = "SERVED"; // PENDING, PREPARING, SERVED, CANCELLED

    @Column(name = "customer_note", columnDefinition = "TEXT")
    private String customerNote;
}

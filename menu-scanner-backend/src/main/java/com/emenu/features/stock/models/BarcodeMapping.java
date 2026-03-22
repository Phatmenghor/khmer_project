package com.emenu.features.stock.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "barcode_mappings",
    indexes = {
        @Index(name = "idx_barcode_mappings_business", columnList = "business_id"),
        @Index(name = "idx_barcode_mappings_barcode", columnList = "barcode"),
        @Index(name = "idx_barcode_mappings_product_stock", columnList = "product_stock_id"),
        @Index(name = "idx_barcode_mappings_active", columnList = "active")
    },
    uniqueConstraints = {
        @UniqueConstraint(
            name = "barcode_unique_per_business",
            columnNames = {"business_id", "barcode"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BarcodeMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID businessId;

    @Column(nullable = false)
    private UUID productStockId;

    @Column(nullable = false, unique = true)
    private String barcode;

    @Column(nullable = true)
    private String barcodeFormat; // CODE128, UPC, EAN13, QR

    @Column(nullable = true)
    private String barcodeImageUrl;

    // ========== Product Info (Snapshot) ==========
    @Column(nullable = false)
    private UUID productId;

    @Column(nullable = true)
    private UUID productSizeId;

    @Column(nullable = true)
    private String productName;

    // ========== Status ==========
    @Column(nullable = false)
    private Boolean active;

    // ========== Audit ==========
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = true)
    private UUID createdBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (active == null) {
            active = true;
        }
    }

    public Boolean isActive() {
        return active;
    }

    public void deactivate() {
        this.active = false;
    }

    public void activate() {
        this.active = true;
    }
}

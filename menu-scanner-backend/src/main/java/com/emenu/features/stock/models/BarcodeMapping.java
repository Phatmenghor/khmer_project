package com.emenu.features.stock.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
    name = "barcode_mappings",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "barcode_unique_per_business",
            columnNames = {"business_id", "barcode"}
        )
    }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class BarcodeMapping extends BaseUUIDEntity {

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @Column(name = "product_stock_id", nullable = false)
    private UUID productStockId;

    @Column(name = "barcode", nullable = false, unique = true)
    private String barcode;

    @Column(name = "barcode_format")
    private String barcodeFormat; // CODE128, UPC, EAN13, QR

    // ========== Product Info ==========
    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "product_size_id")
    private UUID productSizeId;

    @Column(name = "product_name")
    private String productName;

    // ========== Status ==========
    @Column(name = "active", nullable = false)
    private Boolean active;

    @PrePersist
    @Override
    public void prePersist() {
        super.prePersist();
        if (active == null) active = true;
    }
}

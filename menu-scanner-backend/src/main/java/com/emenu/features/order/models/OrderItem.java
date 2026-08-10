package com.emenu.features.order.models;

import com.emenu.features.main.models.Product;
import com.emenu.features.main.models.ProductSize;
import com.emenu.shared.domain.BaseUUIDEntity;
import com.emenu.shared.dto.ImageUrls;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "order_items",
        indexes = {
                @Index(name = "idx_order_items_order_id", columnList = "order_id")
        }
)
@Data
@ToString(callSuper = true, exclude = {"order", "product", "productSize", "itemCustomizations"})
@EqualsAndHashCode(callSuper = true, exclude = {"order", "product", "productSize", "itemCustomizations"})
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem extends BaseUUIDEntity {

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Order order;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @Column(name = "product_size_id")
    private UUID productSizeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_size_id", insertable = false, updatable = false)
    private ProductSize productSize;

    // Snapshot of product details at time of order
    @Column(name = "product_name", nullable = false)
    private String productName;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "product_image_url", columnDefinition = "jsonb")
    private ImageUrls productImageUrl;

    @Column(name = "size_name")
    private String sizeName; // "Standard" if no size

    // Product SKU and barcode snapshot from store master data
    @Column(name = "sku")
    private String sku; // Product SKU from store master data

    @Column(name = "barcode")
    private String barcode; // Product barcode from store master data

    // Pricing snapshot - preserves discount/promotion at time of order
    @Column(name = "current_price", precision = 10, scale = 2)
    private BigDecimal currentPrice; // Base price before discount

    @Column(name = "final_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalPrice; // Price after discount (same as unitPrice for backward compat)

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice; // Price at time of order (same as finalPrice)

    @Column(name = "has_promotion")
    private Boolean hasPromotion;

    // Promotion details snapshot
    @Column(name = "promotion_type")
    private String promotionType; // PERCENTAGE or FIXED_AMOUNT

    @Column(name = "promotion_value", precision = 10, scale = 2)
    private BigDecimal promotionValue;

    @Column(name = "promotion_from_date")
    private LocalDateTime promotionFromDate;

    @Column(name = "promotion_to_date")
    private LocalDateTime promotionToDate;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice; // finalPrice * quantity

    @OneToMany(mappedBy = "orderItem", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Set<OrderItemCustomization> itemCustomizations = new HashSet<>();

    // Total customization cost for this item
    @Column(name = "customization_total", precision = 10, scale = 2)
    private BigDecimal customizationTotal = BigDecimal.ZERO;

    // Business Methods
    public void calculateTotalPrice() {
        this.totalPrice = this.unitPrice.multiply(BigDecimal.valueOf(this.quantity));
    }
}
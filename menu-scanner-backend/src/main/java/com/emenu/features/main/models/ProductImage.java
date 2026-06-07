package com.emenu.features.main.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import com.emenu.shared.dto.ImageUrls;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "product_images",
        indexes = {
                @Index(name = "idx_product_images_product_id", columnList = "product_id")
        }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ProductImage extends BaseUUIDEntity {

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "image", columnDefinition = "jsonb")
    private ImageUrls image;

    public ProductImage(UUID productId, ImageUrls image) {
        this.productId = productId;
        this.image = image;
    }

    public ProductImage(ImageUrls image) {
        this.image = image;
    }

    public void setProduct(Product product) {
        this.product = product;
        if (product != null) {
            this.productId = product.getId();
        } else {
            this.productId = null;
        }
    }
}
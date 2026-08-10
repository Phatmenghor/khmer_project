package com.emenu.features.stock.repository.projection;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public interface ProductStockItemProjection {

    UUID getProductId();
    UUID getProductSizeId();
    String getProductName();
    String getDescription();

    UUID getCategoryId();
    String getCategoryName();
    UUID getBrandId();
    String getBrandName();

    String getSku();
    String getBarcode();
    String getSizeName();

    BigDecimal getPrice();
    BigDecimal getDisplayPrice();
    String getDisplayPromotionType();
    BigDecimal getDisplayPromotionValue();
    LocalDate getDisplayPromotionFromDate();
    LocalDate getDisplayPromotionToDate();

    Boolean getHasPromotion();

    Long getTotalStock();
    Long getQuantityAvailable();
    Long getQuantityReserved();
    Long getQuantityOnHand();

    String getMainImageUrl();
    String getStatus();
    String getStockStatus();
    String getItemType();

    LocalDateTime getCreatedAt();
    LocalDateTime getUpdatedAt();
}

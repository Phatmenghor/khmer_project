package com.emenu.features.stock.mapper;

import com.emenu.enums.product.PromotionStatus;
import com.emenu.features.stock.dto.request.ProductStockCreateRequest;
import com.emenu.features.stock.dto.request.ProductStockUpdateRequest;
import com.emenu.features.stock.dto.response.ProductStockDto;
import com.emenu.features.stock.dto.response.ProductStockItemDto;
import com.emenu.features.stock.models.ProductStock;
import com.emenu.features.stock.repository.projection.ProductStockItemProjection;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.time.LocalDate;
import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductStockMapper {

    @Mapping(target = "isOutOfStock", expression = "java(productStock.isOutOfStock())")
    @Mapping(target = "inventoryValue", expression = "java(productStock.getInventoryValue())")
    ProductStockDto toDto(ProductStock productStock);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "businessId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "isExpired", ignore = true)
    @Mapping(target = "dateIn", ignore = true)
    @Mapping(target = "dateOut", ignore = true)
    ProductStock toEntity(ProductStockCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "businessId", ignore = true)
    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "isExpired", ignore = true)
    void updateEntityFromRequest(ProductStockUpdateRequest request, @MappingTarget ProductStock productStock);

    List<ProductStockDto> toDtoList(List<ProductStock> productStocks);

    @Mapping(target = "id", expression = "java(projection.getProductSizeId() != null ? projection.getProductSizeId() : projection.getProductId())")
    @Mapping(target = "type", source = "itemType")
    @Mapping(target = "price", expression = "java(projection.getPrice() != null ? projection.getPrice().toPlainString() : null)")
    @Mapping(target = "hasPromotion", expression = "java(computePromotionStatus(projection))")
    ProductStockItemDto toItemDto(ProductStockItemProjection projection);

    List<ProductStockItemDto> toItemDtoList(List<ProductStockItemProjection> projections);

    default PromotionStatus computePromotionStatus(ProductStockItemProjection projection) {
        if (projection == null) return PromotionStatus.NONE;
        if (Boolean.TRUE.equals(projection.getHasPromotion())) {
            LocalDate fromDate = projection.getDisplayPromotionFromDate();
            LocalDate toDate = projection.getDisplayPromotionToDate();
            if (fromDate != null && toDate != null) {
                LocalDate today = LocalDate.now();
                if (today.isBefore(fromDate)) return PromotionStatus.FUTURE_PROMOTION;
                if (today.isAfter(toDate)) return PromotionStatus.NONE;
                return PromotionStatus.ACTIVE;
            }
            return PromotionStatus.ACTIVE;
        }
        return PromotionStatus.NONE;
    }
}

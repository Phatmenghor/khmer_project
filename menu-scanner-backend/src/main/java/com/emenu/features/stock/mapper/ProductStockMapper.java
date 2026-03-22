package com.emenu.features.stock.mapper;

import com.emenu.features.stock.dto.request.ProductStockCreateRequest;
import com.emenu.features.stock.dto.request.ProductStockUpdateRequest;
import com.emenu.features.stock.dto.response.ProductStockDto;
import com.emenu.features.stock.models.ProductStock;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PaginationMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductStockMapper {

    @Mapping(target = "profitMargin", expression = "java(calculateProfitMargin(productStock))")
    @Mapping(target = "isOutOfStock", expression = "java(productStock.isOutOfStock())")
    @Mapping(target = "inventoryValue", expression = "java(productStock.getInventoryValue())")
    @Mapping(target = "retailValue", expression = "java(productStock.getRetailValue())")
    @Mapping(target = "potentialProfit", expression = "java(productStock.getPotentialProfit())")
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

    default PaginationResponse<ProductStockDto> toPaginationResponse(Page<ProductStock> page, PaginationMapper paginationMapper) {
        return paginationMapper.toPaginationResponse(page, this::toDtoList);
    }

    // Helper method to calculate profit margin
    default java.math.BigDecimal calculateProfitMargin(ProductStock productStock) {
        if (productStock.getPriceIn().compareTo(java.math.BigDecimal.ZERO) == 0) {
            return java.math.BigDecimal.ZERO;
        }
        return productStock.getPriceOut()
                .subtract(productStock.getPriceIn())
                .divide(productStock.getPriceIn(), 2, java.math.RoundingMode.HALF_UP)
                .multiply(java.math.BigDecimal.valueOf(100));
    }
}

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

    default PaginationResponse<ProductStockDto> toPaginationResponse(Page<ProductStock> page, PaginationMapper paginationMapper) {
        return paginationMapper.toPaginationResponse(page, this::toDtoList);
    }
}

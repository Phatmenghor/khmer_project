package com.emenu.features.main.controller;

import com.emenu.features.main.dto.filter.ProductFilterDto;
import com.emenu.features.main.dto.response.ProductDetailDto;
import com.emenu.features.main.dto.response.ProductListDto;
import com.emenu.features.main.service.ProductService;
import com.emenu.features.main.service.ProductConditionalService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/products")
@RequiredArgsConstructor
@Slf4j
public class PublicProductController {

    private final ProductService productService;
    private final ProductConditionalService productConditionalService;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductListDto>>> getAllPublicProducts(
            @Valid @RequestBody ProductFilterDto filter) {
        log.info("Endpoint: public-search-products - public products retrieval: page={}, size={}", filter.getPageNo(), filter.getPageSize());

        UUID businessId = filter.getBusinessId();

        if (businessId != null && filter.getBrandId() != null && !productConditionalService.businessUsesBrands(businessId)) {
            PaginationResponse<ProductListDto> emptyResponse = new PaginationResponse<>();
            emptyResponse.setContent(new ArrayList<>());
            emptyResponse.setTotalElements(0L);
            emptyResponse.setTotalPages(0);
            return ResponseEntity.ok(ApiResponse.success("Brands are not enabled for this business", emptyResponse));
        }

        PaginationResponse<ProductListDto> products = productService.getAllProducts(filter);

        return ResponseEntity.ok(ApiResponse.success(
            String.format("Found %d products", products.getTotalElements()),
            products
        ));
    }

    @PostMapping("/all-data")
    public ResponseEntity<ApiResponse<List<ProductListDto>>> getAllDataPublicProducts(
            @Valid @RequestBody ProductFilterDto filter) {
        log.info("Endpoint: public-search-all-products - public all products retrieval: business_id={}", filter.getBusinessId());

        UUID businessId = filter.getBusinessId();

        if (businessId != null && filter.getBrandId() != null && !productConditionalService.businessUsesBrands(businessId)) {
            return ResponseEntity.ok(ApiResponse.success("Brands are not enabled for this business", new ArrayList<>()));
        }

        List<ProductListDto> products = productService.getAllDataProducts(filter);

        return ResponseEntity.ok(ApiResponse.success(
                "All products retrieved successfully",
                products
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailDto>> getPublicProductById(@PathVariable UUID id) {
        log.info("Endpoint: public-get-product - public product detail: id={}", id);
        ProductDetailDto product = productService.getProductByIdPublic(id);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product));
    }
}
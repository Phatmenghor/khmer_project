package com.emenu.features.main.controller;

import com.emenu.features.main.dto.filter.ProductFilterDto;
import com.emenu.features.main.dto.response.FavoriteRemoveAllDto;
import com.emenu.features.main.dto.response.FavoriteToggleDto;
import com.emenu.features.main.dto.response.ProductListDto;
import com.emenu.features.main.service.ProductFavoriteService;
import com.emenu.features.main.service.ProductConditionalService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/product-favorites")
@RequiredArgsConstructor
@Slf4j
public class ProductFavoriteController {

    private final ProductFavoriteService favoriteService;
    private final ProductConditionalService productConditionalService;

    @PostMapping("/{productId}/toggle")
    public ResponseEntity<ApiResponse<FavoriteToggleDto>> toggleFavorite(@PathVariable UUID productId) {
        log.info("Endpoint: toggle-favorite - product favorite toggle: product_id={}", productId);
        FavoriteToggleDto result = favoriteService.toggleFavorite(productId);
        return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
    }

    @PostMapping("/my-favorites")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductListDto>>> getUserFavorites(
            @Valid @RequestBody ProductFilterDto filter) {
        log.info("Endpoint: search-favorites - user favorites retrieval: page={}, size={}", filter.getPageNo(), filter.getPageSize());

        UUID businessId = filter.getBusinessId();

        if (businessId != null && filter.getBrandId() != null && !productConditionalService.businessUsesBrands(businessId)) {
            PaginationResponse<ProductListDto> emptyResponse = new PaginationResponse<>();
            emptyResponse.setContent(new ArrayList<>());
            emptyResponse.setTotalElements(0L);
            emptyResponse.setTotalPages(0);
            return ResponseEntity.ok(ApiResponse.success("Brands are not enabled for this business", emptyResponse));
        }

        PaginationResponse<ProductListDto> favorites = favoriteService.getUserFavorites(filter);
        return ResponseEntity.ok(ApiResponse.success("Favorite products retrieved successfully", favorites));
    }

    @DeleteMapping("/all")
    public ResponseEntity<ApiResponse<FavoriteRemoveAllDto>> removeAllFavorites(@RequestParam UUID businessId) {
        log.info("Endpoint: remove-all-favorites - remove all favorites: business_id={}", businessId);
        FavoriteRemoveAllDto result = favoriteService.removeAllFavorites(businessId);
        return ResponseEntity.ok(ApiResponse.success("All favorites removed successfully", result));
    }
}

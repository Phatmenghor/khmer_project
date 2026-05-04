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

    /**
     * Toggle favorite status for a product
     */
    @PostMapping("/{productId}/toggle")
    public ResponseEntity<ApiResponse<FavoriteToggleDto>> toggleFavorite(@PathVariable UUID productId) {
        long startTime = System.currentTimeMillis();
        log.info("POST /api/v1/product-favorites/{}/toggle - Toggle favorite request", productId);

        try {
            FavoriteToggleDto result = favoriteService.toggleFavorite(productId);
            long duration = System.currentTimeMillis() - startTime;

            log.info("POST /api/v1/product-favorites/{}/toggle succeeded in {}ms - Action: {}, Status: {}",
                productId, duration, result.getAction(), result.getIsFavorited());
            return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("POST /api/v1/product-favorites/{}/toggle failed after {}ms - Error: {}",
                productId, duration, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Get paginated list of user's favorite products (businessId from filter body)
     */
    @PostMapping("/my-favorites")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductListDto>>> getUserFavorites(
            @Valid @RequestBody ProductFilterDto filter) {

        long startTime = System.currentTimeMillis();
        log.info("POST /api/v1/product-favorites/my-favorites - Get user favorites - Page: {}, Size: {}, Business: {}, CategoryId: {}, BrandId: {}",
            filter.getPageNo(), filter.getPageSize(), filter.getBusinessId(), filter.getCategoryId(), filter.getBrandId());

        try {
            UUID businessId = filter.getBusinessId();

            if (businessId != null && filter.getCategoryId() != null && !productConditionalService.businessUsesCategories(businessId)) {
                log.info("Business {} does not use categories - returning empty favorites list", businessId);
                PaginationResponse<ProductListDto> emptyResponse = new PaginationResponse<>();
                emptyResponse.setContent(new ArrayList<>());
                emptyResponse.setTotalElements(0L);
                emptyResponse.setTotalPages(0);
                return ResponseEntity.ok(ApiResponse.success("Categories are not enabled for this business", emptyResponse));
            }

            if (businessId != null && filter.getBrandId() != null && !productConditionalService.businessUsesBrands(businessId)) {
                log.info("Business {} does not use brands - returning empty favorites list", businessId);
                PaginationResponse<ProductListDto> emptyResponse = new PaginationResponse<>();
                emptyResponse.setContent(new ArrayList<>());
                emptyResponse.setTotalElements(0L);
                emptyResponse.setTotalPages(0);
                return ResponseEntity.ok(ApiResponse.success("Brands are not enabled for this business", emptyResponse));
            }

            PaginationResponse<ProductListDto> favorites = favoriteService.getUserFavorites(filter);
            long duration = System.currentTimeMillis() - startTime;

            log.info("POST /api/v1/product-favorites/my-favorites succeeded in {}ms - Retrieved {} favorites, Total: {}",
                duration, favorites.getContent().size(), favorites.getTotalElements());
            return ResponseEntity.ok(ApiResponse.success("Favorite products retrieved successfully", favorites));
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("POST /api/v1/product-favorites/my-favorites failed after {}ms - Error: {}",
                duration, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Remove all favorites for current user within a business
     */
    @DeleteMapping("/all")
    public ResponseEntity<ApiResponse<FavoriteRemoveAllDto>> removeAllFavorites(@RequestParam UUID businessId) {
        long startTime = System.currentTimeMillis();
        log.info("DELETE /api/v1/product-favorites/all - Remove all favorites - Business: {}", businessId);

        try {
            FavoriteRemoveAllDto result = favoriteService.removeAllFavorites(businessId);
            long duration = System.currentTimeMillis() - startTime;

            log.info("DELETE /api/v1/product-favorites/all succeeded in {}ms - Removed {} favorites",
                duration, result.getRemovedCount());
            return ResponseEntity.ok(ApiResponse.success("All favorites removed successfully", result));
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("DELETE /api/v1/product-favorites/all failed after {}ms - Business: {}, Error: {}",
                duration, businessId, e.getMessage(), e);
            throw e;
        }
    }
}

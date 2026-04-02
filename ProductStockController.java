package com.emenu.features.stock.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.emenu.features.stock.dto.request.ProductStockItemsFilterRequest;
import com.emenu.features.stock.dto.response.ProductStockItemDto;
import com.emenu.features.stock.dto.response.ApiResponse;
import com.emenu.features.stock.service.ProductStockService;
import com.emenu.security.jwt.JwtTokenProvider;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/product-stock/items")
@RequiredArgsConstructor
public class ProductStockController {

    private final ProductStockService service;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * GET all product stock items with pagination
     * Returns: Complete product details with pricing, promotions, inventory
     *
     * Request:
     * {
     *   "pageNo": 1,
     *   "pageSize": 15,
     *   "search": "Product",
     *   "sortBy": "totalStock",
     *   "sortDirection": "DESC"
     * }
     *
     * Response:
     * {
     *   "status": "success",
     *   "message": "Product stock items retrieved",
     *   "data": {
     *     "content": [
     *       {
     *         "id": "...",
     *         "productId": "...",
     *         "productName": "Product 1626",
     *         "description": "...",
     *         "sku": "SKU-1626",
     *         "barcode": "BARCODE-1626",
     *         "categoryId": "cat-6",
     *         "categoryName": "Category 6",
     *         "brandId": "brand-6",
     *         "brandName": "Brand 6",
     *         "price": "21.00",
     *         "displayPrice": 19.95,
     *         "displayPromotionType": "PERCENTAGE",
     *         "displayPromotionValue": 5,
     *         "displayPromotionFromDate": "2026-04-01T01:41:00",
     *         "displayPromotionToDate": "2026-05-01T01:41:00",
     *         "hasPromotion": true,
     *         "totalStock": 386,
     *         "quantityAvailable": 380,
     *         "quantityReserved": 6,
     *         "quantityOnHand": 386,
     *         "mainImageUrl": "https://...",
     *         "createdAt": "2026-03-27T13:41:00",
     *         "updatedAt": "2026-03-18T13:41:00"
     *       }
     *     ],
     *     "pageNo": 1,
     *     "pageSize": 15,
     *     "totalElements": 250,
     *     "totalPages": 17
     *   }
     * }
     */
    @PostMapping("/my-business")
    public ResponseEntity<ApiResponse<Page<ProductStockItemDto>>> getAllProductStockItems(
        @RequestBody ProductStockItemsFilterRequest filter) {

        UUID businessId = getCurrentUserBusinessId();

        ApiResponse<Page<ProductStockItemDto>> response = service.getAllStockItems(
            businessId,
            filter,
            filter.getPageNo() != null ? filter.getPageNo() : 1,
            filter.getPageSize() != null ? filter.getPageSize() : 15
        );

        return ResponseEntity.ok(response);
    }

    /**
     * GET all product stock items without pagination
     * Returns: All items matching filters (useful for reports/exports)
     *
     * Request: Same as paginated endpoint (pageNo, pageSize ignored)
     *
     * Response:
     * {
     *   "status": "success",
     *   "message": "Product stock items retrieved",
     *   "data": [
     *     {
     *       "id": "...",
     *       "productId": "...",
     *       "productName": "Product 1626",
     *       ... all fields same as paginated ...
     *     }
     *   ]
     * }
     */
    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<List<ProductStockItemDto>>> getAllProductStockItemsWithoutPagination(
        @RequestBody ProductStockItemsFilterRequest filter) {

        UUID businessId = getCurrentUserBusinessId();

        ApiResponse<List<ProductStockItemDto>> response = service.getAllStockItemsWithoutPagination(
            businessId,
            filter
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Helper method to get current user's business ID from JWT token
     */
    private UUID getCurrentUserBusinessId() {
        // Extract from JWT token or security context
        // Example: return jwtTokenProvider.getBusinessIdFromToken(request);
        return null; // Implementation depends on your auth setup
    }
}

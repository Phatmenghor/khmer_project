package com.emenu.features.main.service.impl;

import com.emenu.enums.product.ProductStatus;
import com.emenu.enums.product.StockStatus;
import com.emenu.exception.custom.NotFoundException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.models.User;
import com.emenu.features.main.dto.filter.ProductFilterDto;
import com.emenu.features.main.dto.request.ProductCreateDto;
import com.emenu.features.main.dto.request.ProductImageCreateDto;
import com.emenu.features.main.dto.request.ProductSizeCreateDto;
import com.emenu.features.main.dto.request.ProductCustomizationCreateDto;
import com.emenu.features.main.dto.request.BulkPromotionCreateDto;
import com.emenu.features.main.dto.request.ResetSelectedPromotionsDto;
import com.emenu.features.main.dto.response.ProductDetailDto;
import com.emenu.features.main.dto.response.ProductListDto;
import com.emenu.features.main.dto.response.BulkPromotionResultDto;
import com.emenu.features.main.dto.update.ProductImageUpdateDto;
import com.emenu.features.main.dto.update.ProductSizeUpdateDto;
import com.emenu.features.main.dto.update.ProductCustomizationUpdateDto;
import com.emenu.features.main.dto.update.ProductUpdateDto;
import com.emenu.features.main.mapper.ProductImageMapper;
import com.emenu.features.main.mapper.ProductMapper;
import com.emenu.features.main.mapper.ProductSizeMapper;
import com.emenu.features.main.mapper.ProductCustomizationMapper;
import com.emenu.features.main.models.Product;
import com.emenu.features.main.models.ProductImage;
import com.emenu.features.main.models.ProductSize;
import com.emenu.features.main.models.ProductCustomization;
import com.emenu.features.main.repository.CategoryRepository;
import com.emenu.features.main.repository.BrandRepository;
import com.emenu.features.main.repository.ProductImageRepository;
import com.emenu.features.main.repository.ProductRepository;
import com.emenu.features.main.repository.ProductSizeRepository;
import com.emenu.features.main.repository.ProductCustomizationRepository;
import com.emenu.features.main.service.ProductService;
import com.emenu.features.main.models.Category;
import com.emenu.features.main.models.Brand;
import com.emenu.features.main.specification.ProductSpecification;
import com.emenu.features.main.utils.ProductFavoriteQueryHelper;
import com.emenu.features.main.utils.ProductUtils;
import com.emenu.features.order.utils.CartQueryHelper;
import com.emenu.features.stock.repository.ProductStockRepository;
import com.emenu.security.SecurityUtils;
import com.emenu.features.notification.websocket.service.WebSocketNotificationService;
import com.emenu.shared.dto.BatchImportResponse;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.cancellation.RequestCancellationRegistry;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.transaction.annotation.Propagation;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ProductServiceImpl implements ProductService {

    @Autowired
    @Lazy
    private ProductService self;

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductSizeRepository productSizeRepository;
    private final ProductCustomizationRepository productCustomizationRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductMapper productMapper;
    private final ProductImageMapper productImageMapper;
    private final ProductSizeMapper productSizeMapper;
    private final ProductCustomizationMapper productCustomizationMapper;
    private final PaginationMapper paginationMapper;
    private final SecurityUtils securityUtils;
    private final ProductUtils productUtils;
    private final ProductFavoriteQueryHelper favoriteQueryHelper;
    private final CartQueryHelper cartQueryHelper;
    private final ProductStockRepository productStockRepository;
    private final WebSocketNotificationService webSocketNotificationService;
    private final RequestCancellationRegistry cancellationRegistry;

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProductListDto> getAllProducts(ProductFilterDto filter) {
        Optional<User> currentUser = securityUtils.getCurrentUserOptional();

        if (currentUser.isPresent() && currentUser.get().isBusinessUser() && filter.getBusinessId() == null) {
            filter.setBusinessId(currentUser.get().getBusinessId());
        }

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(),
                filter.getPageSize(),
                filter.getSortBy(),
                filter.getSortDirection()
        );
        Specification<Product> spec = ProductSpecification.filterProducts(
                filter.getBusinessId(),
                filter.getCategoryId(),
                filter.getBrandId(),
                (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) ? filter.getStatuses() : null,
                filter.getHasPromotion(),
                filter.getHasSize(),
                (filter.getStockStatuses() != null && !filter.getStockStatuses().isEmpty()) ? filter.getStockStatuses() : null,
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getSearch(),
                filter.getPromotionFromDate(),
                filter.getPromotionToDate()
        );
        Page<Product> productPage = productRepository.findAll(spec, pageable);

        log.info("Products fetched from database - Total: {}, Page: {}, Size: {}",
                productPage.getTotalElements(), productPage.getNumber(), productPage.getSize());

        if (productPage.getContent().isEmpty()) {
            return paginationMapper.toPaginationResponse(productPage, Collections.emptyList());
        }

        // Batch initialize sizes to avoid lazy-loading (prevents Hibernate pagination warning)
        productPage.getContent().forEach(p -> {
            Hibernate.initialize(p.getSizes());
            if (p.getSizes() != null) {
                p.getSizes().removeIf(s -> Boolean.TRUE.equals(s.getIsDeleted()));
            }
        });

        // Recalculate display fields from current sizes

        List<ProductListDto> dtoList = productMapper.toListDtos(productPage.getContent());

        enrichTotalStock(dtoList, productPage.getContent());

        if (currentUser.isPresent()) {
            List<UUID> productIds = productPage.getContent().stream()
                    .map(Product::getId)
                    .toList();

            // Get favorite products
            List<UUID> favoriteIds = favoriteQueryHelper.getFavoriteProductIds(
                    currentUser.get().getId(),
                    productIds
            );
            Set<UUID> favoriteSet = new HashSet<>(favoriteIds);

            // Get cart quantities for products
            Map<UUID, Integer> cartQuantities = cartQueryHelper.getProductQuantitiesInCart(
                    currentUser.get().getId(),
                    filter.getBusinessId(),
                    productIds
            );

            dtoList.forEach(dto -> {
                dto.setIsFavorited(favoriteSet.contains(dto.getId()));
                dto.setQuantity(cartQuantities.getOrDefault(dto.getId(), 0));
            });
        } else {
            dtoList.forEach(dto -> {
                dto.setIsFavorited(false);
                dto.setQuantity(0);
            });
        }
        log.info("Products retrieved successfully: count={}", dtoList.size());

        return paginationMapper.toPaginationResponse(productPage, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductListDto> getAllDataProducts(ProductFilterDto filter) {
        Optional<User> currentUser = securityUtils.getCurrentUserOptional();

        if (currentUser.isPresent() && currentUser.get().isBusinessUser() && filter.getBusinessId() == null) {
            filter.setBusinessId(currentUser.get().getBusinessId());
        }

        Sort sort = PaginationUtils.createSort(filter.getSortBy(), filter.getSortDirection());
        Specification<Product> spec = ProductSpecification.filterProducts(
                filter.getBusinessId(),
                filter.getCategoryId(),
                filter.getBrandId(),
                (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) ? filter.getStatuses() : null,
                filter.getHasPromotion(),
                filter.getHasSize(),
                (filter.getStockStatuses() != null && !filter.getStockStatuses().isEmpty()) ? filter.getStockStatuses() : null,
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getSearch(),
                filter.getPromotionFromDate(),
                filter.getPromotionToDate()
        );
        List<Product> products = productRepository.findAll(spec, sort);

        log.info("Products fetched from database - Total count: {}", products.size());

        // Recalculate display fields from current sizes

        List<ProductListDto> dtoList = productMapper.toListDtos(products);

        if (products.isEmpty()) {
            return dtoList;
        }

        enrichTotalStock(dtoList, products);

        if (currentUser.isPresent()) {
            List<UUID> productIds = products.stream()
                    .map(Product::getId)
                    .toList();

            // Get favorite products
            List<UUID> favoriteIds = favoriteQueryHelper.getFavoriteProductIds(
                    currentUser.get().getId(),
                    productIds
            );
            Set<UUID> favoriteSet = new HashSet<>(favoriteIds);

            // Get cart quantities for products
            Map<UUID, Integer> cartQuantities = cartQueryHelper.getProductQuantitiesInCart(
                    currentUser.get().getId(),
                    filter.getBusinessId(),
                    productIds
            );

            dtoList.forEach(dto -> {
                dto.setIsFavorited(favoriteSet.contains(dto.getId()));
                dto.setQuantity(cartQuantities.getOrDefault(dto.getId(), 0));
            });
        } else {
            dtoList.forEach(dto -> {
                dto.setIsFavorited(false);
                dto.setQuantity(0);
            });
        }
        log.info("Products retrieved successfully: count={}", dtoList.size());

        return dtoList;
    }


    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProductDetailDto> getAllProductsAdmin(ProductFilterDto filter) {
        // Auto-set business ID for business users if not provided
        Optional<User> currentUser = securityUtils.getCurrentUserOptional();
        if (currentUser.isPresent() && currentUser.get().isBusinessUser() && filter.getBusinessId() == null) {
            filter.setBusinessId(currentUser.get().getBusinessId());
        }

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(),
                filter.getPageSize(),
                filter.getSortBy(),
                filter.getSortDirection()
        );

        // Use specifications for efficient filtering
        Specification<Product> spec = ProductSpecification.filterProducts(
                filter.getBusinessId(),
                filter.getCategoryId(),
                filter.getBrandId(),
                (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) ? filter.getStatuses() : null,
                filter.getHasPromotion(),
                filter.getHasSize(),
                (filter.getStockStatuses() != null && !filter.getStockStatuses().isEmpty()) ? filter.getStockStatuses() : null,
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getSearch(),
                filter.getPromotionFromDate(),
                filter.getPromotionToDate()
        );
        Page<Product> productPage = productRepository.findAll(spec, pageable);

        if (productPage.getContent().isEmpty()) {
            return paginationMapper.toPaginationResponse(productPage, Collections.emptyList());
        }

        // Batch initialize sizes and customizations to avoid lazy-loading
        productPage.getContent().forEach(p -> {
            Hibernate.initialize(p.getSizes());
            Hibernate.initialize(p.getCustomizations());
        });

        // Recalculate display fields from current sizes

        // Use detail DTOs - mapper uses denormalized fields, not relationships
        List<ProductDetailDto> dtoList = productMapper.toDetailDtos(productPage.getContent());

        enrichTotalStockForDetails(dtoList, productPage.getContent());

        return paginationMapper.toPaginationResponse(productPage, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProductDetailDto> getAllProductsAdminPos(ProductFilterDto filter) {
        Optional<User> currentUser = securityUtils.getCurrentUserOptional();
        if (currentUser.isPresent() && currentUser.get().isBusinessUser() && filter.getBusinessId() == null) {
            filter.setBusinessId(currentUser.get().getBusinessId());
        }

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(),
                filter.getPageSize(),
                filter.getSortBy(),
                filter.getSortDirection()
        );

        Specification<Product> spec = ProductSpecification.filterProducts(
                filter.getBusinessId(),
                filter.getCategoryId(),
                filter.getBrandId(),
                (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) ? filter.getStatuses() : null,
                filter.getHasPromotion(),
                filter.getHasSize(),
                (filter.getStockStatuses() != null && !filter.getStockStatuses().isEmpty()) ? filter.getStockStatuses() : null,
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getSearch(),
                filter.getPromotionFromDate(),
                filter.getPromotionToDate()
        );
        Page<Product> productPage = productRepository.findAll(spec, pageable);

        if (productPage.getContent().isEmpty()) {
            return paginationMapper.toPaginationResponse(productPage, Collections.emptyList());
        }

        // Batch initialize sizes and customizations to avoid lazy-loading
        productPage.getContent().forEach(p -> {
            Hibernate.initialize(p.getSizes());
            Hibernate.initialize(p.getCustomizations());
        });

        // Recalculate display fields from current sizes

        List<ProductDetailDto> dtoList = productMapper.toDetailDtos(productPage.getContent());

        enrichTotalStockForDetails(dtoList, productPage.getContent());

        return paginationMapper.toPaginationResponse(productPage, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProductDetailDto> getAllProductsAdminStock(ProductFilterDto filter) {
        // Auto-set business ID for business users if not provided
        Optional<User> currentUser = securityUtils.getCurrentUserOptional();
        if (currentUser.isPresent() && currentUser.get().isBusinessUser() && filter.getBusinessId() == null) {
            filter.setBusinessId(currentUser.get().getBusinessId());
        }

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(),
                filter.getPageSize(),
                filter.getSortBy(),
                filter.getSortDirection()
        );

        // Fetch products with filters
        Specification<Product> spec = ProductSpecification.filterProducts(
                filter.getBusinessId(),
                filter.getCategoryId(),
                filter.getBrandId(),
                (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) ? filter.getStatuses() : null,
                filter.getHasPromotion(),
                filter.getHasSize(),
                (filter.getStockStatuses() != null && !filter.getStockStatuses().isEmpty()) ? filter.getStockStatuses() : null,
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getSearch(),
                filter.getPromotionFromDate(),
                filter.getPromotionToDate()
        );
        Page<Product> productPage = productRepository.findAll(spec, pageable);

        if (productPage.getContent().isEmpty()) {
            return paginationMapper.toPaginationResponse(productPage, Collections.emptyList());
        }

        // Batch initialize sizes to avoid lazy-loading
        productPage.getContent().forEach(p -> {
            Hibernate.initialize(p.getSizes());
            if (p.getSizes() != null) {
                p.getSizes().removeIf(s -> Boolean.TRUE.equals(s.getIsDeleted()));
            }
        });

        // Clear images (not needed for stock listing)
        productPage.getContent().forEach(p -> p.setImages(new ArrayList<>()));

        // Recalculate display fields from current sizes

        // All filters (including hasSize and stockStatuses) are now applied at database level
        List<ProductDetailDto> dtoList = productMapper.toDetailDtos(productPage.getContent());

        // Enrich with stock information
        enrichTotalStockForDetails(dtoList, productPage.getContent());
        enrichProductSizesStock(dtoList);
        log.info("Products with stock retrieved successfully: count={}", dtoList.size());

        return paginationMapper.toPaginationResponse(productPage, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailDto getProductById(UUID id) {
        try {
            Product product = productRepository.findByIdWithAllDetails(id)
                    .orElseThrow(() -> {
                        log.error("Product not found - ID: {}", id);
                        return new NotFoundException("Product not found: " + id);
                    });
            Optional<User> currentUser = securityUtils.getCurrentUserOptional();
            if (currentUser.isPresent() && currentUser.get().isBusinessUser()) {
                validateBusinessAccess(product, currentUser.get());
            }

            // Initialize images and customizations for detail view (avoids MultipleBagFetchException by loading separately)
            Hibernate.initialize(product.getImages());
            Hibernate.initialize(product.getCustomizations());
            // Recalculate display fields from current sizes (fixes stale DB values)

            ProductDetailDto dto = productMapper.toDetailDto(product);
            enrichTotalStockForDetail(dto, product.getId());
            populateUserFieldsForDetail(dto, currentUser, product);
            log.info("Product retrieved successfully: id={}, name={}", id, product.getName());

            return dto;
        } catch (Exception e) {
            log.error("Failed to retrieve product: id={}, error={}", id, e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public ProductDetailDto getProductByIdPublic(UUID id) {
        try {
            Product product = productRepository.findByIdWithAllDetails(id)
                    .orElseThrow(() -> {
                        log.error("Product not found (public access) - ID: {}", id);
                        return new NotFoundException("Product not found: " + id);
                    });
            productRepository.incrementViewCount(id);
            // Initialize images and customizations for detail view (avoids MultipleBagFetchException by loading separately)
            Hibernate.initialize(product.getImages());
            Hibernate.initialize(product.getCustomizations());
            // Recalculate display fields from current sizes (fixes stale DB values)

            ProductDetailDto dto = productMapper.toDetailDto(product);
            enrichTotalStockForDetail(dto, product.getId());
            Optional<User> currentUser = securityUtils.getCurrentUserOptional();
            populateUserFieldsForDetail(dto, currentUser, product);
            log.info("Public product retrieved successfully: id={}, name={}", id, product.getName());

            return dto;
        } catch (Exception e) {
            log.error("Failed to retrieve public product: id={}, error={}", id, e.getMessage());
            throw e;
        }
    }

    private void populateUserFieldsForDetail(ProductDetailDto dto, Optional<User> currentUser, Product product) {
        if (currentUser.isPresent()) {
            UUID userId = currentUser.get().getId();

            boolean isFavorited = favoriteQueryHelper.isFavorited(userId, product.getId());
            dto.setIsFavorited(isFavorited);

            // Get cart quantity for this product
            Map<UUID, Integer> cartQuantities = cartQueryHelper.getProductQuantitiesInCart(
                    userId,
                    product.getBusinessId(),
                    List.of(product.getId())
            );
            dto.setQuantity(cartQuantities.getOrDefault(product.getId(), 0));

            // Get per-size quantities in cart
            if (dto.getSizes() != null && !dto.getSizes().isEmpty()) {
                Map<UUID, Integer> sizeQuantities = cartQueryHelper.getSizeQuantitiesInCart(userId, product.getId());
                dto.getSizes().forEach(size ->
                        size.setQuantity(sizeQuantities.getOrDefault(size.getId(), 0))
                );
            }
        } else {
            dto.setIsFavorited(false);
            dto.setQuantity(0);
            if (dto.getSizes() != null) {
                dto.getSizes().forEach(size -> size.setQuantity(0));
            }
        }
    }

    @Override
    @Transactional
    public ProductDetailDto resetProductPromotion(UUID id) {
        try {
            // Load product only to validate existence and business ownership
            Product product = productRepository.findByIdAndIsDeletedFalse(id)
                    .orElseThrow(() -> new NotFoundException("Product not found: " + id));

            User currentUser = securityUtils.getCurrentUser();
            validateBusinessOwnership(product, currentUser);

            // Reset sizes via native SQL (clearAutomatically evicts L1 cache)
            int sizesReset = productSizeRepository.resetPromotionsByProductId(id);
            // Reset product via native SQL (handles display_price for with/without sizes,
            // clearAutomatically evicts L1 cache so getProductById reads fresh DB data)
            productRepository.resetProductPromotionById(id);

            log.info("Product promotion reset successfully: ID={}, Name='{}'", id, product.getName());
            return getProductById(id);
        } catch (Exception e) {
            log.error("Product promotion reset failed - ID: {}, Error: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public Map<String, Object> resetAllPromotions() {
        log.info("Starting reset all promotions for business");
        try {
            User currentUser = securityUtils.getCurrentUser();
            validateUserBusinessAssociation(currentUser);
            UUID businessId = currentUser.getBusinessId();

            // Use native SQL queries for ultra-fast bulk reset (1000x faster than ORM)
            log.info("Executing native SQL bulk reset for business: {}", businessId);

            // Reset product sizes first (faster query)
            int sizesReset = productSizeRepository.resetAllPromotionsForProductSizes(businessId);
            log.info("Reset promotions for {} product sizes via SQL", sizesReset);

            // Reset products without sizes
            int productsWithoutSizes = productRepository.resetAllPromotionsForProductsWithoutSizes(businessId);
            log.info("Reset promotions for {} products without sizes via SQL", productsWithoutSizes);

            // Reset products with sizes (recalculates display fields from min size price)
            int productsWithSizes = productRepository.resetAllPromotionsForProductsWithSizes(businessId);
            log.info("Reset promotions for {} products with sizes via SQL", productsWithSizes);

            int totalProductsReset = productsWithoutSizes + productsWithSizes;
            log.info("All promotions reset successfully: products={}, sizes={}", totalProductsReset, sizesReset);

            Map<String, Object> response = new HashMap<>();
            response.put("message", String.format("Successfully reset promotions for %d products and %d sizes", totalProductsReset, sizesReset));
            response.put("resetCount", totalProductsReset + sizesReset);
            response.put("productsReset", totalProductsReset);
            response.put("sizesReset", sizesReset);
            
            return response;
        } catch (Exception e) {
            log.error("Failed to reset all promotions: error={}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public Map<String, Object> resetSelectedPromotions(ResetSelectedPromotionsDto request) {
        log.info("Starting reset promotions for {} selected products", request.getProductIds().size());
        try {
            if (request.getProductIds() == null || request.getProductIds().isEmpty()) {
                throw new ValidationException("No products selected");
            }

            User currentUser = securityUtils.getCurrentUser();
            validateUserBusinessAssociation(currentUser);
            UUID businessId = currentUser.getBusinessId();

            // Validate all products belong to current user's business
            List<Product> products = productRepository.findAllById(request.getProductIds());
            int productsValidated = 0;
            for (Product product : products) {
                if (!product.getBusinessId().equals(businessId)) {
                    throw new ValidationException("Product does not belong to your business: " + product.getId());
                }
                productsValidated++;
            }
            int sizesReset = 0;
            int productsReset = 0;

            // Check if we have size mapping
            Map<UUID, List<UUID>> sizeMapping = request.getProductSizeMapping();
            boolean hasSizeMapping = sizeMapping != null && !sizeMapping.isEmpty();

            if (hasSizeMapping) {
                // Reset only specific sizes for selected products
                for (Map.Entry<UUID, List<UUID>> entry : sizeMapping.entrySet()) {
                    UUID productId = entry.getKey();
                    List<UUID> sizeIds = entry.getValue();
                    if (!sizeIds.isEmpty()) {
                        // For each size, reset by fetching and updating
                        // Since we don't have a batch query for specific sizes
                        List<ProductSize> sizes = productSizeRepository.findAllById(sizeIds);
                        for (ProductSize size : sizes) {
                            if (size.getProductId().equals(productId)) {
                                size.removePromotion();
                                sizesReset++;
                            }
                        }
                        productSizeRepository.saveAll(sizes);
                    }
                }
            } else {
                // Reset all promotions for selected products
                sizesReset = productSizeRepository.resetPromotionsBulkForProductSizes(request.getProductIds());
            }

            // Reset product-level promotions
            productsReset = productRepository.resetPromotionsBulk(request.getProductIds());
            Map<String, Object> response = new HashMap<>();
            response.put("message", String.format("Successfully reset promotions for %d products and %d sizes", productsReset, sizesReset));
            response.put("resetCount", productsReset + sizesReset);
            response.put("productsReset", productsReset);
            response.put("sizesReset", sizesReset);
            
            log.info("Selected promotions reset successfully: products={}, sizes={}", productsReset, sizesReset);

            return response;
        } catch (Exception e) {
            log.error("Failed to reset selected promotions: error={}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public BulkPromotionResultDto createBulkPromotions(BulkPromotionCreateDto request) {
        log.info("Starting bulk promotion creation for {} products, Type: {}, Value: {}",
            request.getProductIds().size(), request.getPromotionType(), request.getPromotionValue());
        User currentUser = securityUtils.getCurrentUser();
        validateUserBusinessAssociation(currentUser);
        List<UUID> failedProductIds = new ArrayList<>();
        int successCount = 0;

        // Fetch all requested products
        List<Product> products = productRepository.findAllById(request.getProductIds());
        for (Product product : products) {
            try {
                // Verify business ownership
                if (!product.getBusinessId().equals(currentUser.getBusinessId())) {
                    log.warn("Business ownership mismatch for product: {}, Expected: {}, Got: {}",
                        product.getId(), currentUser.getBusinessId(), product.getBusinessId());
                    failedProductIds.add(product.getId());
                    continue;
                }

                // Set promotion fields on product
                product.setPromotionType(request.getPromotionType());
                product.setPromotionValue(request.getPromotionValue());
                product.setPromotionFromDate(request.getPromotionFromDate());
                product.setPromotionToDate(request.getPromotionToDate());
                // Apply promotion to sizes if product has sizes
                if (product.getHasSizes()) {
                    List<ProductSize> sizes = productSizeRepository.findByProductId(product.getId());
                    // Check if there's a specific size mapping for this product
                    List<UUID> specifiedSizeIds = null;
                    if (request.getProductSizeMapping() != null &&
                        request.getProductSizeMapping().containsKey(product.getId())) {
                        specifiedSizeIds = request.getProductSizeMapping().get(product.getId());
                    }

                    int appliedSizes = 0;
                    int clearedSizes = 0;

                    for (ProductSize size : sizes) {
                        if (!size.getIsDeleted()) {
                            // Apply promotion only to specified sizes, or to all if no specification
                            boolean shouldApply = specifiedSizeIds == null ||
                                                specifiedSizeIds.contains(size.getId());

                            if (shouldApply) {
                                size.setPromotionType(request.getPromotionType());
                                size.setPromotionValue(request.getPromotionValue());
                                size.setPromotionFromDate(request.getPromotionFromDate());
                                size.setPromotionToDate(request.getPromotionToDate());
                                appliedSizes++;
                            } else {
                                // Clear promotion from sizes not in the mapping
                                size.setPromotionType(null);
                                size.setPromotionValue(null);
                                size.setPromotionFromDate(null);
                                size.setPromotionToDate(null);
                                clearedSizes++;
                            }
                        }
                    }
                    productSizeRepository.saveAll(sizes);
                    // Sync display fields from sizes
                } else {
                    // Initialize display fields for product without sizes
                }

                productRepository.save(product);
                successCount++;
            } catch (Exception e) {
                log.error("Failed to apply bulk promotion to product: {}, Error: {}", product.getId(), e.getMessage(), e);
                failedProductIds.add(product.getId());
            }
        }
        log.info("Bulk promotion created successfully: success={}, failed={}", successCount, failedProductIds.size());

        return BulkPromotionResultDto.builder()
                .successCount(successCount)
                .failedCount(failedProductIds.size())
                .failedProductIds(failedProductIds)
                .message(String.format("Successfully created promotion for %d product(s)", successCount))
                .timestamp(java.time.LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public int[] syncExpiredPromotions() {
        int noSizes = productRepository.clearExpiredPromotionsForProductsWithoutSizes();
        int withSizes = productRepository.clearExpiredPromotionsForProductsWithSizes();
        return new int[]{noSizes, withSizes};
    }

    @Override
    @Transactional
    public int[] syncStartedPromotions() {
        int noSizes = productRepository.syncStartedPromotionsForProductsWithoutSizes();
        int withSizes = productRepository.syncStartedPromotionsForProductsWithSizes();
        return new int[]{noSizes, withSizes};
    }

    @Override
    public ProductDetailDto createProduct(ProductCreateDto request) {
        try {
            User currentUser = securityUtils.getCurrentUser();
            validateUserBusinessAssociation(currentUser);

            Product product = productMapper.toEntity(request);
            productMapper.setBusinessFields(product, currentUser.getBusinessId());
            syncDenormalizedNames(product);
            Product savedProduct = productRepository.save(product);
            log.info("Product created successfully: ID={}, Name='{}', Business={}", savedProduct.getId(), savedProduct.getName(), savedProduct.getBusinessId());

            handleProductImages(savedProduct, request.getImages());
            if (request.getSizes() != null && !request.getSizes().isEmpty()) {
                handleProductSizes(savedProduct, request.getSizes());

                List<ProductSize> sizes = productSizeRepository.findByProductId(savedProduct.getId());
                savedProduct.setSizes(sizes);
                savedProduct.setHasSizes(true);
                savedProduct = productRepository.save(savedProduct);
            }

            handleProductCustomizationsOnCreate(savedProduct, request.getCustomizations());
            log.info("Product created successfully: id={}", savedProduct.getId());
            return getProductById(savedProduct.getId());
        } catch (Exception e) {
            log.error("Failed to create product: name={}, error={}", request.getName(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public BatchImportResponse<ProductDetailDto> createProductBatch(List<ProductCreateDto> requests, String importId) {
        log.info("Batch product creation initiated: size={}, importId={}", requests.size(), importId);
        List<BatchImportResponse.RowResult<ProductDetailDto>> results = new ArrayList<>();
        int successCount = 0;
        int errorCount = 0;

        cancellationRegistry.registerImport(importId);

        try {
            for (int i = 0; i < requests.size(); i++) {
                cancellationRegistry.checkCancelled(importId);

                ProductCreateDto req = requests.get(i);
                boolean success = false;
                String errorMsg = null;
                ProductDetailDto resp = null;
                try {
                    resp = self.createProduct(req);
                    results.add(new BatchImportResponse.RowResult<>(i, true, null, resp));
                    successCount++;
                    success = true;
                } catch (ConstraintViolationException ex) {
                    errorMsg = ex.getConstraintViolations().stream()
                            .map(ConstraintViolation::getMessage)
                            .collect(Collectors.joining(", "));
                    log.error("Batch product creation failed at index {} due to validation: {}", i, errorMsg);
                    results.add(new BatchImportResponse.RowResult<>(i, false, errorMsg, null));
                    errorCount++;
                } catch (Exception ex) {
                    log.error("Batch product creation failed at index {}: {}", i, ex.getMessage());
                    errorMsg = ex.getMessage();
                    results.add(new BatchImportResponse.RowResult<>(i, false, errorMsg, null));
                    errorCount++;
                }

                if (importId != null) {
                    int progress = (int) (((double) (i + 1) / requests.size()) * 100);
                    Map<String, Object> lastResult = Map.of(
                        "index", i,
                        "success", success,
                        "error", errorMsg != null ? errorMsg : ""
                    );
                    webSocketNotificationService.notifyImportProgress(
                        importId,
                        progress,
                        i + 1,
                        requests.size(),
                        successCount,
                        errorCount,
                        (i + 1) == requests.size(),
                        lastResult
                    );
                }
            }
        } finally {
            cancellationRegistry.cleanUp(importId);
        }

        return new BatchImportResponse<>(successCount, errorCount, results);
    }

    @Override
    public ProductDetailDto updateProduct(UUID id, ProductUpdateDto request) {
        try {
            Product product = productRepository.findByIdAndIsDeletedFalse(id)
                    .orElseThrow(() -> new NotFoundException("Product not found: " + id));
            User currentUser = securityUtils.getCurrentUser();
            validateBusinessOwnership(product, currentUser);

            productMapper.updateEntity(request, product);
            // Update stock status if provided
            if (request.getStockStatus() != null) {
                product.setStockStatus(request.getStockStatus());
            }

            if (!product.getHasSizes()) {
            }

            // Sync denormalized names in case category/brand changed
            syncDenormalizedNames(product);

            Product updatedProduct = productRepository.save(product);
            log.info("Product saved: ID={}, Name='{}'", updatedProduct.getId(), updatedProduct.getName());

            updateProductImages(updatedProduct, request.getImages());
            boolean sizesChanged = updateProductSizes(updatedProduct, request.getSizes());
            if (sizesChanged) {
                List<ProductSize> sizes = productSizeRepository.findByProductId(updatedProduct.getId());
                updatedProduct.getSizes().clear();
                if (sizes != null) {
                    updatedProduct.getSizes().addAll(sizes);
                }
                boolean hasActiveSizes = sizes != null && sizes.stream().anyMatch(s -> !s.getIsDeleted());
                updatedProduct.setHasSizes(hasActiveSizes);
                updatedProduct = productRepository.save(updatedProduct);
            }

            updateProductCustomizations(updatedProduct, request.getCustomizations());
            log.info("Product updated successfully: id={}", id);
            return getProductById(updatedProduct.getId());
        } catch (Exception e) {
            log.error("Failed to update product: id={}, error={}", id, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public ProductDetailDto deleteProduct(UUID id) {
        try {
            Product product = productRepository.findByIdAndIsDeletedFalse(id)
                    .orElseThrow(() -> new NotFoundException("Product not found: " + id));
            User currentUser = securityUtils.getCurrentUser();
            validateBusinessOwnership(product, currentUser);
            product.softDelete();
            Product deletedProduct = productRepository.save(product);
            log.info("Product deleted successfully (soft delete): ID={}, Name='{}', Business={}", deletedProduct.getId(), deletedProduct.getName(), deletedProduct.getBusinessId());

            return productMapper.toDetailDto(deletedProduct);
        } catch (Exception e) {
            log.error("Product deletion failed - ID: {}, Error: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    private void handleProductImages(Product product, List<ProductImageCreateDto> imageDtos) {
        if (imageDtos == null || imageDtos.isEmpty()) return;

        List<ProductImage> images = imageDtos.stream()
                .filter(imageDto -> imageDto.getImage() != null)
                .map(imageDto -> {
                    ProductImage image = productImageMapper.toEntity(imageDto);
                    image.setProductId(product.getId());
                    return image;
                })
                .toList();

        if (!images.isEmpty()) {
            productImageRepository.saveAll(images);

            if (product.getMainImage() == null || product.getMainImage().getMd() == null) {
                ProductImageCreateDto primaryDto = imageDtos.stream()
                        .filter(dto -> dto.getImage() != null)
                        .filter(dto -> Boolean.TRUE.equals(dto.getIsPrimary()))
                        .findFirst()
                        .orElseGet(() -> imageDtos.stream().filter(dto -> dto.getImage() != null).findFirst().orElse(null));

                if (primaryDto != null) {
                    product.setMainImage(primaryDto.getImage());
                    productRepository.save(product);
                }
            }
        }
    }

    private void handleProductSizes(Product product, List<ProductSizeCreateDto> sizeDtos) {
        if (sizeDtos == null || sizeDtos.isEmpty()) return;

        List<ProductSize> sizes = sizeDtos.stream()
                .map(sizeDto -> {
                    ProductSize size = productSizeMapper.toEntity(sizeDto);
                    size.setProductId(product.getId());
                    return size;
                })
                .toList();

        productSizeRepository.saveAll(sizes);
    }

    private void updateProductImages(Product product, List<ProductImageUpdateDto> imageDtos) {
        if (imageDtos == null || imageDtos.isEmpty()) return;

        List<ProductImage> existingImages = productImageRepository.findByProductId(product.getId());

        List<UUID> idsToDelete = productImageMapper.getIdsToDelete(imageDtos);
        if (!idsToDelete.isEmpty()) {
            existingImages.stream()
                    .filter(img -> idsToDelete.contains(img.getId()))
                    .forEach(img -> {
                        img.softDelete();
                        productImageRepository.save(img);
                    });
        }

        List<ProductImageUpdateDto> toUpdate = productImageMapper.getExistingToUpdate(imageDtos);
        for (ProductImageUpdateDto updateDto : toUpdate) {
            existingImages.stream()
                    .filter(img -> img.getId().equals(updateDto.getId()))
                    .findFirst()
                    .ifPresent(existingImage -> {
                        productImageMapper.updateEntity(updateDto, existingImage);
                        productImageRepository.save(existingImage);
                    });
        }

        List<ProductImage> newImages = productImageMapper.toEntitiesFromUpdate(imageDtos);
        newImages.forEach(img -> img.setProductId(product.getId()));
        if (!newImages.isEmpty()) {
            productImageRepository.saveAll(newImages);
        }
    }

    private boolean updateProductSizes(Product product, List<ProductSizeUpdateDto> sizeDtos) {
        if (sizeDtos == null || sizeDtos.isEmpty()) return false;

        boolean changed = false;
        List<ProductSize> existingSizes = productSizeRepository.findByProductId(product.getId());

        List<UUID> idsToDelete = productSizeMapper.getIdsToDelete(sizeDtos);
        if (!idsToDelete.isEmpty()) {
            existingSizes.stream()
                    .filter(size -> idsToDelete.contains(size.getId()))
                    .forEach(size -> {
                        size.softDelete();
                        productSizeRepository.save(size);
                    });
            changed = true;
        }

        List<ProductSizeUpdateDto> toUpdate = productSizeMapper.getExistingToUpdate(sizeDtos);
        if (!toUpdate.isEmpty()) {
            for (ProductSizeUpdateDto updateDto : toUpdate) {
                existingSizes.stream()
                        .filter(size -> size.getId().equals(updateDto.getId()))
                        .findFirst()
                        .ifPresent(existingSize -> {
                            productSizeMapper.updateEntity(updateDto, existingSize);
                            productSizeRepository.save(existingSize);
                        });
            }
            changed = true;
        }

        List<ProductSize> newSizes = productSizeMapper.toEntitiesFromUpdate(sizeDtos);
        if (!newSizes.isEmpty()) {
            newSizes.forEach(size -> size.setProductId(product.getId()));
            productSizeRepository.saveAll(newSizes);
            changed = true;
        }

        return changed;
    }

    private void handleProductCustomizationsOnCreate(Product product, List<ProductCustomizationCreateDto> customizationDtos) {
        if (customizationDtos == null || customizationDtos.isEmpty()) return;

        List<ProductCustomization> customizations = new ArrayList<>();
        for (ProductCustomizationCreateDto dto : customizationDtos) {
            ProductCustomization customization = new ProductCustomization();
            customization.setProductId(product.getId());
            customization.setName(dto.getName());
            customization.setPriceAdjustment(dto.getPriceAdjustment());
            customizations.add(customization);
        }
        productCustomizationRepository.saveAll(customizations);
    }

    private void updateProductCustomizations(Product product, List<ProductCustomizationUpdateDto> customizationDtos) {
        if (customizationDtos == null || customizationDtos.isEmpty()) return;

        List<ProductCustomization> existingCustomizations = productCustomizationRepository.findByProductId(product.getId());

        // Delete customizations not in the request
        List<UUID> idsToKeep = customizationDtos.stream()
                .filter(dto -> dto.getId() != null)
                .map(ProductCustomizationUpdateDto::getId)
                .toList();

        existingCustomizations.stream()
                .filter(customization -> !idsToKeep.contains(customization.getId()))
                .forEach(customization -> {
                    customization.softDelete();
                    productCustomizationRepository.save(customization);
                });

        // Update existing customizations
        List<ProductCustomizationUpdateDto> toUpdate = customizationDtos.stream()
                .filter(dto -> dto.getId() != null)
                .toList();

        for (ProductCustomizationUpdateDto updateDto : toUpdate) {
            existingCustomizations.stream()
                    .filter(custom -> custom.getId().equals(updateDto.getId()))
                    .findFirst()
                    .ifPresent(existingCustomization -> {
                        existingCustomization.setName(updateDto.getName());
                        existingCustomization.setPriceAdjustment(updateDto.getPriceAdjustment());
                        productCustomizationRepository.save(existingCustomization);
                    });
        }

        // Create new customizations
        List<ProductCustomization> newCustomizations = customizationDtos.stream()
                .filter(dto -> dto.getId() == null)
                .map(dto -> {
                    ProductCustomization custom = new ProductCustomization();
                    custom.setProductId(product.getId());
                    custom.setName(dto.getName());
                    custom.setPriceAdjustment(dto.getPriceAdjustment());
                    return custom;
                })
                .toList();

        if (!newCustomizations.isEmpty()) {
            productCustomizationRepository.saveAll(newCustomizations);
        }
    }

    private void validateUserBusinessAssociation(User user) {
        if (user.getBusinessId() == null) {
            throw new ValidationException("User is not associated with any business");
        }
    }

    private void validateBusinessOwnership(Product product, User user) {
        if (!product.getBusinessId().equals(user.getBusinessId())) {
            throw new ValidationException("You can only modify products from your own business");
        }
    }

    private void validateBusinessAccess(Product product, User user) {
        if (user.isBusinessUser() && !product.getBusinessId().equals(user.getBusinessId())) {
            throw new ValidationException("Access denied to product from different business");
        }
    }

    /**
     * Enrich product sizes with stock information from ProductStock repository
     * Sets totalStock for each ProductSizeDto
     * For products WITH sizes: updates parent totalStock as sum of all sizes
     * For products WITHOUT sizes: totalStock is already set by enrichTotalStockForDetails
     */
    private void enrichProductSizesStock(List<ProductDetailDto> dtoList) {
        for (ProductDetailDto dto : dtoList) {
            if (dto.getSizes() != null && !dto.getSizes().isEmpty()) {
                dto.setHasSizes(true);
                int totalSizesStock = 0;

                // Get stock for each size from repository
                for (var sizeDto : dto.getSizes()) {
                    Integer sizeStock = productStockRepository.sumOnHandQuantityByProductSizeId(sizeDto.getId());
                    int stock = sizeStock != null ? sizeStock : 0;
                    sizeDto.setTotalStock(stock);
                    totalSizesStock += stock;
                }

                // Set parent product totalStock as sum of all sizes
                dto.setTotalStock(totalSizesStock);
                if (dto.getStatus() == ProductStatus.ACTIVE && dto.getStockStatus() == com.emenu.enums.product.StockStatus.ENABLED) {
                    if (totalSizesStock <= 0) {
                        dto.setStatus(ProductStatus.OUT_OF_STOCK);
                    }
                }
            } else {
                dto.setHasSizes(false);
            }
            // For products without sizes, totalStock is already set by enrichTotalStockForDetails
        }
    }

    private void enrichTotalStock(List<ProductListDto> dtoList, List<Product> products) {
        List<UUID> productIds = products.stream().map(Product::getId).toList();
        if (productIds.isEmpty()) return;

        Map<UUID, Integer> stockMap = new HashMap<>();
        productStockRepository.sumOnHandQuantityByProductIds(productIds)
                .forEach(row -> stockMap.put((UUID) row[0], ((Number) row[1]).intValue()));

        dtoList.forEach(dto -> {
            int stock = stockMap.getOrDefault(dto.getId(), 0);
            dto.setTotalStock(stock);
            if (dto.getStatus() == ProductStatus.ACTIVE && dto.getStockStatus() == com.emenu.enums.product.StockStatus.ENABLED) {
                if (stock <= 0) {
                    dto.setStatus(ProductStatus.OUT_OF_STOCK);
                }
            }
        });
    }

    private void enrichTotalStockForDetail(ProductDetailDto dto, UUID productId) {
        List<Object[]> results = productStockRepository.sumOnHandQuantityByProductIds(List.of(productId));
        int stock = 0;
        if (!results.isEmpty()) {
            stock = ((Number) results.get(0)[1]).intValue();
        }
        dto.setTotalStock(stock);
        if (dto.getStatus() == ProductStatus.ACTIVE && dto.getStockStatus() == com.emenu.enums.product.StockStatus.ENABLED) {
            if (stock <= 0) {
                dto.setStatus(ProductStatus.OUT_OF_STOCK);
            }
        }
    }

    private void enrichTotalStockForDetails(List<ProductDetailDto> dtoList, List<Product> products) {
        List<UUID> productIds = products.stream().map(Product::getId).toList();
        if (productIds.isEmpty()) return;

        Map<UUID, Integer> stockMap = new HashMap<>();
        productStockRepository.sumOnHandQuantityByProductIds(productIds)
                .forEach(row -> stockMap.put((UUID) row[0], ((Number) row[1]).intValue()));

        dtoList.forEach(dto -> {
            int stock = stockMap.getOrDefault(dto.getId(), 0);
            dto.setTotalStock(stock);
            if (dto.getStatus() == ProductStatus.ACTIVE && dto.getStockStatus() == com.emenu.enums.product.StockStatus.ENABLED) {
                if (stock <= 0) {
                    dto.setStatus(ProductStatus.OUT_OF_STOCK);
                }
            }
        });
    }

    /**
     * Sync denormalized category, brand, and business names
     * Called when a product is created or updated
     */
    private void syncDenormalizedNames(Product product) {
        // Sync category name
        if (product.getCategoryId() != null) {
            categoryRepository.findByIdAndIsDeletedFalse(product.getCategoryId())
                    .ifPresent(category -> product.setCategoryName(category.getName()));
        }

        // Sync brand name
        if (product.getBrandId() != null) {
            brandRepository.findByIdAndIsDeletedFalse(product.getBrandId())
                    .ifPresent(brand -> product.setBrandName(brand.getName()));
        }

        // Sync business name - get from securityUtils context
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser != null && currentUser.getBusiness() != null) {
            product.setBusinessName(currentUser.getBusiness().getName());
        }
    }
}


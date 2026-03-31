package com.emenu.features.main.service.impl;

import com.emenu.exception.custom.NotFoundException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.models.User;
import com.emenu.features.main.dto.filter.ProductFilterDto;
import com.emenu.features.main.dto.request.ProductCreateDto;
import com.emenu.features.main.dto.request.ProductImageCreateDto;
import com.emenu.features.main.dto.request.ProductSizeCreateDto;
import com.emenu.features.main.dto.request.BulkPromotionCreateDto;
import com.emenu.features.main.dto.response.ProductDetailDto;
import com.emenu.features.main.dto.response.ProductListDto;
import com.emenu.features.main.dto.response.BulkPromotionResultDto;
import com.emenu.features.main.dto.update.ProductImageUpdateDto;
import com.emenu.features.main.dto.update.ProductSizeUpdateDto;
import com.emenu.features.main.dto.update.ProductUpdateDto;
import com.emenu.features.main.mapper.ProductImageMapper;
import com.emenu.features.main.mapper.ProductMapper;
import com.emenu.features.main.mapper.ProductSizeMapper;
import com.emenu.features.main.models.Product;
import com.emenu.features.main.models.ProductImage;
import com.emenu.features.main.models.ProductSize;
import com.emenu.features.main.repository.CategoryRepository;
import com.emenu.features.main.repository.BrandRepository;
import com.emenu.features.main.repository.ProductImageRepository;
import com.emenu.features.main.repository.ProductRepository;
import com.emenu.features.main.repository.ProductSizeRepository;
import com.emenu.features.main.service.ProductService;
import com.emenu.features.main.models.Category;
import com.emenu.features.main.models.Brand;
import com.emenu.features.main.utils.ProductFavoriteQueryHelper;
import com.emenu.features.main.utils.ProductUtils;
import com.emenu.features.order.utils.CartQueryHelper;
import com.emenu.features.stock.repository.ProductStockRepository;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductSizeRepository productSizeRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductMapper productMapper;
    private final ProductImageMapper productImageMapper;
    private final ProductSizeMapper productSizeMapper;
    private final PaginationMapper paginationMapper;
    private final SecurityUtils securityUtils;
    private final ProductUtils productUtils;
    private final ProductFavoriteQueryHelper favoriteQueryHelper;
    private final CartQueryHelper cartQueryHelper;
    private final ProductStockRepository productStockRepository;

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

        Page<Product> productPage = productRepository.findAllWithFilters(
                filter.getBusinessId(),
                filter.getCategoryId(),
                filter.getBrandId(),
                (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) ? filter.getStatuses() : null,
                Boolean.TRUE.equals(filter.getHasPromotion()) ? Boolean.TRUE : null,
                Boolean.FALSE.equals(filter.getHasPromotion()) ? Boolean.TRUE : null,
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getSearch(),
                pageable
        );

        if (productPage.getContent().isEmpty()) {
            return paginationMapper.toPaginationResponse(productPage, Collections.emptyList());
        }

        // Batch initialize sizes to avoid lazy-loading (prevents Hibernate pagination warning)
        productPage.getContent().forEach(p -> Hibernate.initialize(p.getSizes()));

        // Recalculate display fields from current sizes
        productPage.getContent().forEach(Product::syncDisplayFieldsFromSizes);

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

        return paginationMapper.toPaginationResponse(productPage, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductListDto> getAllDataProducts(ProductFilterDto filter) {
        Optional<User> currentUser = securityUtils.getCurrentUserOptional();

        if (currentUser.isPresent() && currentUser.get().isBusinessUser() && filter.getBusinessId() == null) {
            filter.setBusinessId(currentUser.get().getBusinessId());
        }

        List<Product> products = productRepository.findAllWithFilters(
                filter.getBusinessId(),
                filter.getCategoryId(),
                filter.getBrandId(),
                (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) ? filter.getStatuses() : null,
                Boolean.TRUE.equals(filter.getHasPromotion()) ? Boolean.TRUE : null,
                Boolean.FALSE.equals(filter.getHasPromotion()) ? Boolean.TRUE : null,
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getSearch(),
                PaginationUtils.createSort(filter.getSortBy(), filter.getSortDirection())
        );

        // Recalculate display fields from current sizes
        products.forEach(Product::syncDisplayFieldsFromSizes);

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

        // Use optimized query - no category/brand/business/images JOINs (20-30x faster)
        Page<Product> productPage = productRepository.findAllWithFiltersOptimized(
                filter.getBusinessId(),
                filter.getCategoryId(),
                filter.getBrandId(),
                (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) ? filter.getStatuses() : null,
                Boolean.TRUE.equals(filter.getHasPromotion()) ? Boolean.TRUE : null,
                Boolean.FALSE.equals(filter.getHasPromotion()) ? Boolean.TRUE : null,
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getSearch(),
                pageable
        );

        if (productPage.getContent().isEmpty()) {
            return paginationMapper.toPaginationResponse(productPage, Collections.emptyList());
        }

        // Batch initialize sizes to avoid lazy-loading (prevents Hibernate pagination warning)
        productPage.getContent().forEach(p -> Hibernate.initialize(p.getSizes()));

        // Recalculate display fields from current sizes
        productPage.getContent().forEach(Product::syncDisplayFieldsFromSizes);

        // Clear images to prevent lazy-loading (not needed for admin listing)
        productPage.getContent().forEach(p -> p.setImages(new ArrayList<>()));

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

        Page<Product> productPage = productRepository.findAllWithFilters(
                filter.getBusinessId(),
                filter.getCategoryId(),
                filter.getBrandId(),
                (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) ? filter.getStatuses() : null,
                Boolean.TRUE.equals(filter.getHasPromotion()) ? Boolean.TRUE : null,
                Boolean.FALSE.equals(filter.getHasPromotion()) ? Boolean.TRUE : null,
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getSearch(),
                pageable
        );

        if (productPage.getContent().isEmpty()) {
            return paginationMapper.toPaginationResponse(productPage, Collections.emptyList());
        }

        // Batch initialize sizes to avoid lazy-loading (prevents Hibernate pagination warning)
        productPage.getContent().forEach(p -> Hibernate.initialize(p.getSizes()));

        // Clear images to avoid lazy-loading overhead (images not needed in listing)
        productPage.getContent().forEach(p -> p.setImages(new ArrayList<>()));

        // Recalculate display fields from current sizes
        productPage.getContent().forEach(Product::syncDisplayFieldsFromSizes);

        List<ProductDetailDto> dtoList = productMapper.toDetailDtos(productPage.getContent());

        enrichTotalStockForDetails(dtoList, productPage.getContent());

        return paginationMapper.toPaginationResponse(productPage, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailDto getProductById(UUID id) {
        Product product = productRepository.findByIdWithAllDetails(id)
                .orElseThrow(() -> new NotFoundException("Product not found: " + id));

        Optional<User> currentUser = securityUtils.getCurrentUserOptional();
        if (currentUser.isPresent() && currentUser.get().isBusinessUser()) {
            validateBusinessAccess(product, currentUser.get());
        }

        // Initialize images for detail view (avoids MultipleBagFetchException by loading separately)
        Hibernate.initialize(product.getImages());

        // Recalculate display fields from current sizes (fixes stale DB values)
        product.syncDisplayFieldsFromSizes();

        ProductDetailDto dto = productMapper.toDetailDto(product);
        enrichTotalStockForDetail(dto, product.getId());

        populateUserFieldsForDetail(dto, currentUser, product);

        return dto;
    }

    @Override
    @Transactional
    public ProductDetailDto getProductByIdPublic(UUID id) {
        Product product = productRepository.findByIdWithAllDetails(id)
                .orElseThrow(() -> new NotFoundException("Product not found: " + id));

        productRepository.incrementViewCount(id);

        // Initialize images for detail view (avoids MultipleBagFetchException by loading separately)
        Hibernate.initialize(product.getImages());

        // Recalculate display fields from current sizes (fixes stale DB values)
        product.syncDisplayFieldsFromSizes();

        ProductDetailDto dto = productMapper.toDetailDto(product);
        enrichTotalStockForDetail(dto, product.getId());

        Optional<User> currentUser = securityUtils.getCurrentUserOptional();
        populateUserFieldsForDetail(dto, currentUser, product);

        return dto;
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
        log.debug("Starting product promotion reset: ID={}", id);

        try {
            Product product = productRepository.findByIdAndIsDeletedFalse(id)
                    .orElseThrow(() -> new NotFoundException("Product not found: " + id));
            log.debug("Product found for reset: Name='{}', Has promotion: {}", product.getName(), product.getPromotionType() != null);

            User currentUser = securityUtils.getCurrentUser();
            validateBusinessOwnership(product, currentUser);

            // Clear all promotion fields on product
            product.setPromotionType(null);
            product.setPromotionValue(null);
            product.setPromotionFromDate(null);
            product.setPromotionToDate(null);

            // Reset display fields
            product.setHasActivePromotion(false);
            product.setDisplayPromotionType(null);
            product.setDisplayPromotionValue(null);
            product.setDisplayPromotionFromDate(null);
            product.setDisplayPromotionToDate(null);
            log.debug("Promotion fields cleared for product: {}", id);

            // Clear promotions on all product sizes
            if (product.getHasSizes()) {
                List<ProductSize> sizes = productSizeRepository.findByProductId(id);
                int sizesCleared = 0;
                for (ProductSize size : sizes) {
                    if (!size.getIsDeleted()) {
                        size.setPromotionType(null);
                        size.setPromotionValue(null);
                        size.setPromotionFromDate(null);
                        size.setPromotionToDate(null);
                        sizesCleared++;
                    }
                }
                productSizeRepository.saveAll(sizes);
                log.debug("Promotion reset for {} sizes in product: {}", sizesCleared, id);

                // Will be recalculated from sizes
                product.setDisplayPrice(null);
                product.setDisplayOriginPrice(null);
            } else {
                product.setDisplayPrice(product.getPrice());
                product.setDisplayOriginPrice(product.getPrice());
                log.debug("Display price reset for product without sizes: {}", id);
            }

            Product savedProduct = productRepository.save(product);
            log.info("Product promotion reset successfully: ID={}, Name='{}'", savedProduct.getId(), savedProduct.getName());
            return getProductById(savedProduct.getId());
        } catch (Exception e) {
            log.error("Product promotion reset failed - ID: {}, Error: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public Map<String, Object> resetAllPromotions() {
        log.info("Starting reset all promotions for business");
        long startTime = System.currentTimeMillis();

        try {
            User currentUser = securityUtils.getCurrentUser();
            validateUserBusinessAssociation(currentUser);
            log.debug("Reset promotions - Current user: {}, Business: {}", currentUser.getUserIdentifier(), currentUser.getBusinessId());

            // Get all products for the current user's business
            List<Product> products = productRepository.findAllWithFilters(
                currentUser.getBusiness().getId(),
                null, null, null, null, null, null, null, null, Sort.unsorted());
            log.debug("Fetched {} products for promotion reset", products.size());

            int resetProductCount = 0;
            int resetSizeCount = 0;

            for (Product product : products) {
                // Clear all promotion fields on product
                product.setPromotionType(null);
                product.setPromotionValue(null);
                product.setPromotionFromDate(null);
                product.setPromotionToDate(null);

                // Reset display fields
                product.setHasActivePromotion(false);
                product.setDisplayPromotionType(null);
                product.setDisplayPromotionValue(null);
                product.setDisplayPromotionFromDate(null);
                product.setDisplayPromotionToDate(null);

                resetProductCount++;

                // Clear promotions on all product sizes
                if (product.getHasSizes()) {
                    List<ProductSize> sizes = productSizeRepository.findByProductId(product.getId());
                    int sizesCleared = 0;
                    for (ProductSize size : sizes) {
                        if (!size.getIsDeleted()) {
                            size.setPromotionType(null);
                            size.setPromotionValue(null);
                            size.setPromotionFromDate(null);
                            size.setPromotionToDate(null);
                            resetSizeCount++;
                            sizesCleared++;
                        }
                    }
                    if (!sizes.isEmpty()) {
                        productSizeRepository.saveAll(sizes);
                        log.debug("Reset promotions for {} sizes in product: {}", sizesCleared, product.getId());
                    }

                    // Will be recalculated from sizes
                    product.setDisplayPrice(null);
                    product.setDisplayOriginPrice(null);
                } else {
                    product.setDisplayPrice(product.getPrice());
                    product.setDisplayOriginPrice(product.getPrice());
                }
            }

            // Save all products
            if (!products.isEmpty()) {
                productRepository.saveAll(products);
                log.debug("Saved {} products after promotion reset", products.size());
            }

            long duration = System.currentTimeMillis() - startTime;
            log.info("Reset all promotions completed in {}ms - Products: {}, Sizes: {}, Total: {}",
                duration, resetProductCount, resetSizeCount, resetProductCount + resetSizeCount);

            Map<String, Object> response = new HashMap<>();
            response.put("message", String.format("Successfully reset promotions for %d products and %d sizes", resetProductCount, resetSizeCount));
            response.put("resetCount", resetProductCount + resetSizeCount);
            response.put("productsReset", resetProductCount);
            response.put("sizesReset", resetSizeCount);

            return response;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Reset all promotions failed after {}ms - Error: {}", duration, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public BulkPromotionResultDto createBulkPromotions(BulkPromotionCreateDto request) {
        log.info("Starting bulk promotion creation for {} products, Type: {}, Value: {}",
            request.getProductIds().size(), request.getPromotionType(), request.getPromotionValue());
        long startTime = System.currentTimeMillis();

        User currentUser = securityUtils.getCurrentUser();
        validateUserBusinessAssociation(currentUser);
        log.debug("Bulk promotion - Current user: {}, Business: {}", currentUser.getUserIdentifier(), currentUser.getBusinessId());

        List<UUID> failedProductIds = new ArrayList<>();
        int successCount = 0;

        // Fetch all requested products
        List<Product> products = productRepository.findAllById(request.getProductIds());
        log.debug("Fetched {} products from database", products.size());

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
                log.debug("Promotion set on product: {}, Type: {}, Value: {}",
                    product.getId(), request.getPromotionType(), request.getPromotionValue());

                // Apply promotion to sizes if product has sizes
                if (product.getHasSizes()) {
                    List<ProductSize> sizes = productSizeRepository.findByProductId(product.getId());
                    log.debug("Product has {} sizes, applying promotion selectively", sizes.size());

                    // Check if there's a specific size mapping for this product
                    List<UUID> specifiedSizeIds = null;
                    if (request.getProductSizeMapping() != null &&
                        request.getProductSizeMapping().containsKey(product.getId())) {
                        specifiedSizeIds = request.getProductSizeMapping().get(product.getId());
                        log.debug("Size mapping specified for product: {}, Sizes: {}", product.getId(), specifiedSizeIds.size());
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
                    log.debug("Bulk promotion applied to {} sizes, cleared {} sizes for product: {}",
                        appliedSizes, clearedSizes, product.getId());

                    // Sync display fields from sizes
                    product.syncDisplayFieldsFromSizes();
                } else {
                    // Initialize display fields for product without sizes
                    product.initializeDisplayFields();
                    log.debug("Display fields initialized for product without sizes: {}", product.getId());
                }

                productRepository.save(product);
                successCount++;
                log.debug("Bulk promotion successfully applied to product: {}", product.getId());
            } catch (Exception e) {
                log.error("Failed to apply bulk promotion to product: {}, Error: {}", product.getId(), e.getMessage(), e);
                failedProductIds.add(product.getId());
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("Bulk promotion creation completed in {}ms - Success: {}, Failed: {}, Total: {}",
            duration, successCount, failedProductIds.size(), request.getProductIds().size());

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
        log.debug("Starting product creation with name: '{}', has sizes: {}", request.getName(), request.getSizes() != null && !request.getSizes().isEmpty());
        long startTime = System.currentTimeMillis();

        try {
            User currentUser = securityUtils.getCurrentUser();
            log.debug("Current user: {}, Business: {}", currentUser.getUserIdentifier(), currentUser.getBusinessId());
            validateUserBusinessAssociation(currentUser);

            Product product = productMapper.toEntity(request);
            productMapper.setBusinessFields(product, currentUser.getBusinessId());
            product.initializeDisplayFields();
            syncDenormalizedNames(product);
            log.debug("Product entity mapped and initialized: {}", product.getName());

            Product savedProduct = productRepository.save(product);
            log.info("Product created successfully: ID={}, Name='{}', Business={}", savedProduct.getId(), savedProduct.getName(), savedProduct.getBusinessId());

            handleProductImages(savedProduct, request.getImages());
            log.debug("Product images handled: {} images", request.getImages() != null ? request.getImages().size() : 0);

            if (request.getSizes() != null && !request.getSizes().isEmpty()) {
                log.debug("Handling product sizes: {} sizes", request.getSizes().size());
                handleProductSizes(savedProduct, request.getSizes());

                List<ProductSize> sizes = productSizeRepository.findByProductId(savedProduct.getId());
                savedProduct.setSizes(sizes);
                savedProduct.syncDisplayFieldsFromSizes();
                savedProduct = productRepository.save(savedProduct);
                log.debug("Product with {} sizes saved successfully", sizes.size());
            }

            long duration = System.currentTimeMillis() - startTime;
            log.info("Product creation completed successfully in {}ms: {}", duration, savedProduct.getId());
            return getProductById(savedProduct.getId());
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Product creation failed after {}ms - Name: '{}', Error: {}", duration, request.getName(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public ProductDetailDto updateProduct(UUID id, ProductUpdateDto request) {
        log.debug("Starting product update: ID={}", id);
        long startTime = System.currentTimeMillis();

        try {
            Product product = productRepository.findByIdAndIsDeletedFalse(id)
                    .orElseThrow(() -> new NotFoundException("Product not found: " + id));
            log.debug("Product found: Name='{}', Current business={}", product.getName(), product.getBusinessId());

            User currentUser = securityUtils.getCurrentUser();
            validateBusinessOwnership(product, currentUser);

            productMapper.updateEntity(request, product);
            log.debug("Product entity updated with request data");

            if (!product.getHasSizes()) {
                product.initializeDisplayFields();
                log.debug("Display fields initialized for product without sizes");
            }

            // Sync denormalized names in case category/brand changed
            syncDenormalizedNames(product);

            Product updatedProduct = productRepository.save(product);
            log.info("Product saved: ID={}, Name='{}'", updatedProduct.getId(), updatedProduct.getName());

            updateProductImages(updatedProduct, request.getImages());
            log.debug("Product images updated: {} images", request.getImages() != null ? request.getImages().size() : 0);

            boolean sizesChanged = updateProductSizes(updatedProduct, request.getSizes());
            log.debug("Product sizes update check completed, changed: {}", sizesChanged);

            if (sizesChanged) {
                List<ProductSize> sizes = productSizeRepository.findByProductId(updatedProduct.getId());
                updatedProduct.setSizes(sizes);
                updatedProduct.syncDisplayFieldsFromSizes();
                updatedProduct = productRepository.save(updatedProduct);
                log.debug("Product with {} sizes saved after size changes", sizes.size());
            }

            long duration = System.currentTimeMillis() - startTime;
            log.info("Product updated successfully in {}ms: ID={}", duration, id);
            return getProductById(updatedProduct.getId());
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Product update failed after {}ms - ID: {}, Error: {}", duration, id, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public ProductDetailDto deleteProduct(UUID id) {
        log.debug("Starting product deletion: ID={}", id);

        try {
            Product product = productRepository.findByIdAndIsDeletedFalse(id)
                    .orElseThrow(() -> new NotFoundException("Product not found: " + id));
            log.debug("Product found for deletion: Name='{}', Business={}", product.getName(), product.getBusinessId());

            User currentUser = securityUtils.getCurrentUser();
            validateBusinessOwnership(product, currentUser);
            log.debug("Business ownership validation passed for user: {}", currentUser.getUserIdentifier());

            product.softDelete();
            log.debug("Product marked for soft delete: {}", id);

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
                .filter(imageDto -> productUtils.isValidImageUrl(imageDto.getImageUrl()))
                .map(imageDto -> {
                    ProductImage image = productImageMapper.toEntity(imageDto);
                    image.setProductId(product.getId());
                    return image;
                })
                .toList();

        if (!images.isEmpty()) {
            productImageRepository.saveAll(images);
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

    private void enrichTotalStock(List<ProductListDto> dtoList, List<Product> products) {
        List<UUID> productIds = products.stream().map(Product::getId).toList();
        if (productIds.isEmpty()) return;

        Map<UUID, Integer> stockMap = new HashMap<>();
        productStockRepository.sumOnHandQuantityByProductIds(productIds)
                .forEach(row -> stockMap.put((UUID) row[0], ((Number) row[1]).intValue()));

        dtoList.forEach(dto -> dto.setTotalStock(stockMap.getOrDefault(dto.getId(), 0)));
    }

    private void enrichTotalStockForDetail(ProductDetailDto dto, UUID productId) {
        List<Object[]> results = productStockRepository.sumOnHandQuantityByProductIds(List.of(productId));
        if (!results.isEmpty()) {
            dto.setTotalStock(((Number) results.get(0)[1]).intValue());
        } else {
            dto.setTotalStock(0);
        }
    }

    private void enrichTotalStockForDetails(List<ProductDetailDto> dtoList, List<Product> products) {
        List<UUID> productIds = products.stream().map(Product::getId).toList();
        if (productIds.isEmpty()) return;

        Map<UUID, Integer> stockMap = new HashMap<>();
        productStockRepository.sumOnHandQuantityByProductIds(productIds)
                .forEach(row -> stockMap.put((UUID) row[0], ((Number) row[1]).intValue()));

        dtoList.forEach(dto -> dto.setTotalStock(stockMap.getOrDefault(dto.getId(), 0)));
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
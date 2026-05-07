package com.emenu.features.order.service.impl;

import com.emenu.exception.custom.NotFoundException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.models.User;
import com.emenu.features.order.dto.request.CartItemCreateRequest;
import com.emenu.features.order.dto.response.CartSummaryResponse;
import com.emenu.features.order.mapper.CartMapper;
import com.emenu.features.order.models.Cart;
import com.emenu.features.order.models.CartItem;
import com.emenu.features.order.models.CartItemCustomization;
import com.emenu.features.order.repository.CartItemCustomizationRepository;
import com.emenu.features.order.repository.CartItemRepository;
import com.emenu.features.order.repository.CartRepository;
import com.emenu.features.order.service.CartService;
import com.emenu.features.main.models.Product;
import com.emenu.features.main.models.ProductCustomization;
import com.emenu.features.main.models.ProductSize;
import com.emenu.features.main.repository.ProductCustomizationRepository;
import com.emenu.features.main.repository.ProductRepository;
import com.emenu.features.main.repository.ProductSizeRepository;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.retry.RetryOnOptimisticLock;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CartItemCustomizationRepository cartItemCustomizationRepository;
    private final ProductRepository productRepository;
    private final ProductSizeRepository productSizeRepository;
    private final ProductCustomizationRepository productCustomizationRepository;
    private final CartMapper cartMapper;
    private final SecurityUtils securityUtils;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @RetryOnOptimisticLock
    public CartSummaryResponse submitCartItem(CartItemCreateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        UUID userId = currentUser.getId();

        log.info("Submit cart item - User: {}, Product: {}, Size: {}, Quantity: {}, Customizations: {}",
                userId, request.getProductId(), request.getProductSizeId(),
                request.getQuantity(), request.getCustomizationIds() != null ? request.getCustomizationIds().size() : 0);

        // Validate product and derive businessId
        UUID businessId = validateProductAndGetBusinessId(request.getProductId(), request.getProductSizeId());

        // Get or create cart
        Cart cart = getOrCreateCart(userId, businessId);

        // Check if item already exists in cart (with pessimistic lock to prevent
        // OptimisticLockException when users rapidly update quantities)
        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductIdAndSizeIdForUpdate(
                cart.getId(), request.getProductId(), request.getProductSizeId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();

            if (request.getQuantity() == 0) {
                cartItemRepository.delete(item);
                log.info("Removed cart item: {} for user: {}", item.getId(), userId);
            } else {
                item.setQuantity(request.getQuantity());
                cartItemRepository.save(item);

                // MUST flush before updating customizations to ensure cart item exists in DB
                entityManager.flush();

                updateCartItemCustomizations(item, request.getCustomizationIds());
                log.info("Updated cart item quantity to: {} for user: {}", request.getQuantity(), userId);
            }
        } else {
            if (request.getQuantity() > 0) {
                CartItem newItem = new CartItem(
                        cart.getId(),
                        request.getProductId(),
                        request.getProductSizeId(),
                        request.getQuantity()
                );
                CartItem savedItem = cartItemRepository.save(newItem);

                // MUST flush before updating customizations to ensure cart item exists in DB
                entityManager.flush();

                updateCartItemCustomizations(savedItem, request.getCustomizationIds());
                log.info("Added new item to cart with quantity: {} for user: {}", request.getQuantity(), userId);
            }
        }

        // Final flush to ensure all changes are persisted
        entityManager.flush();

        // Clear the persistence context so the reload query populates all lazy relations
        // (product, productSize) from the database instead of returning cached entities with null associations.
        entityManager.clear();

        // Reload cart with items for response (deduplication happens during load)
        return loadCartSummary(userId, businessId);
    }

    @Override
    @Transactional(readOnly = true)
    public CartSummaryResponse getCart(UUID businessId) {
        UUID userId = securityUtils.getCurrentUserId();
        log.info("Getting cart for user: {} and business: {}", userId, businessId);

        return loadCartSummary(userId, businessId);
    }

    @Override
    @Transactional(readOnly = true)
    public CartSummaryResponse getCartPaginated(UUID businessId, int pageNo, int pageSize) {
        UUID userId = securityUtils.getCurrentUserId();
        log.info("Getting paginated cart for user: {}, business: {}, page: {}, size: {}",
                userId, businessId, pageNo, pageSize);

        Optional<Cart> cartOpt = cartRepository.findByUserIdAndBusinessIdWithItems(userId, businessId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();

            // Deduplicate items first (handles race conditions)
            deduplicateCartItems(cart);

            // Filter unavailable items
            filterUnavailableItems(cart);

            // Store total item count BEFORE pagination (for response)
            int totalItemCount = cart.getItems() == null ? 0 : cart.getItems().size();

            // Apply pagination to items
            if (cart.getItems() != null && !cart.getItems().isEmpty()) {
                int start = (pageNo - 1) * pageSize;
                int end = Math.min(start + pageSize, cart.getItems().size());

                // Create a new list with only the paginated items
                List<CartItem> paginatedItems = cart.getItems().subList(start, end);
                cart.setItems(paginatedItems);
            }

            CartSummaryResponse response = cartMapper.toSummaryResponse(cart);
            // Override totalItems to be item count (for pagination), not sum of quantities
            response.setTotalItems(totalItemCount);
            return response;
        }
        return emptyCartSummary();
    }

    @Override
    public CartSummaryResponse clearCart(UUID businessId) {
        UUID userId = securityUtils.getCurrentUserId();
        log.info("Clearing cart for user: {} and business: {}", userId, businessId);

        Optional<Cart> cartOpt = cartRepository.findByUserIdAndBusinessIdWithItems(userId, businessId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            if (cart.getItems() != null && !cart.getItems().isEmpty()) {
                int count = cart.getItems().size();
                cartItemRepository.deleteAll(cart.getItems());
                cart.getItems().clear();
                log.info("Cleared {} items from cart: {}", count, cart.getId());
            }
        }

        return emptyCartSummary();
    }

    // ===== PRIVATE HELPER METHODS =====

    private CartSummaryResponse loadCartSummary(UUID userId, UUID businessId) {
        Optional<Cart> cartOpt = cartRepository.findByUserIdAndBusinessIdWithItems(userId, businessId);
        if (cartOpt.isPresent()) {
            Cart loaded = cartOpt.get();
            deduplicateCartItems(loaded);
            filterUnavailableItems(loaded);
            return cartMapper.toSummaryResponse(loaded);
        }
        return emptyCartSummary();
    }

    private CartSummaryResponse emptyCartSummary() {
        CartSummaryResponse empty = new CartSummaryResponse();
        empty.setTotalItems(0);
        return empty;
    }

    private Cart getOrCreateCart(UUID userId, UUID businessId) {
        Optional<Cart> existingCart = cartRepository.findByUserIdAndBusinessIdAndIsDeletedFalse(userId, businessId);

        if (existingCart.isPresent()) {
            return existingCart.get();
        }

        com.emenu.features.order.dto.helper.CartCreateHelper helper =
            new com.emenu.features.order.dto.helper.CartCreateHelper(userId, businessId);
        Cart newCart = cartMapper.createFromHelper(helper);
        Cart savedCart = cartRepository.save(newCart);

        log.info("Created new cart for user: {} and business: {}", userId, businessId);
        return savedCart;
    }

    private UUID validateProductAndGetBusinessId(UUID productId, UUID productSizeId) {
        if (productSizeId != null) {
            ProductSize productSize = productSizeRepository.findById(productSizeId)
                    .orElseThrow(() -> new NotFoundException("Product size not found"));

            Product product = productSize.getProduct();
            validateProductAvailability(product);
            return product.getBusinessId();
        } else {
            Product product = productRepository.findByIdAndIsDeletedFalse(productId)
                    .orElseThrow(() -> new NotFoundException("Product not found"));

            validateProductAvailability(product);
            return product.getBusinessId();
        }
    }

    private void validateProductAvailability(Product product) {
        if (product == null) {
            throw new ValidationException("Product not found");
        }
        if (product.getIsDeleted()) {
            throw new ValidationException("Product has been removed");
        }
        if (!product.isActive()) {
            throw new ValidationException("Product is no longer available");
        }
    }

    private void deduplicateCartItems(Cart cart) {
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            return;
        }

        // Keep track of (productId, productSizeId) pairs and their IDs
        java.util.Map<String, java.util.UUID> latestByKey = new java.util.LinkedHashMap<>();
        java.util.Map<String, java.time.LocalDateTime> latestTimeByKey = new java.util.LinkedHashMap<>();
        java.util.List<java.util.UUID> duplicateIds = new java.util.ArrayList<>();

        for (CartItem item : cart.getItems()) {
            String key = item.getProductId() + "|" + item.getProductSizeId();
            java.time.LocalDateTime itemTime = item.getCreatedAt();

            if (latestByKey.containsKey(key)) {
                // Check which one is newer
                java.time.LocalDateTime existingTime = latestTimeByKey.get(key);
                if (itemTime != null && existingTime != null && itemTime.isAfter(existingTime)) {
                    // Current item is newer, mark old one as duplicate
                    duplicateIds.add(latestByKey.get(key));
                    latestByKey.put(key, item.getId());
                    latestTimeByKey.put(key, itemTime);
                } else {
                    // Existing item is newer, mark current as duplicate
                    duplicateIds.add(item.getId());
                }
            } else {
                latestByKey.put(key, item.getId());
                latestTimeByKey.put(key, itemTime);
            }
        }

        // Remove duplicates from cart collection
        if (!duplicateIds.isEmpty()) {
            cart.getItems().removeIf(item -> duplicateIds.contains(item.getId()));
            log.warn("Removed {} duplicate cart items from collection", duplicateIds.size());
        }
    }

    private void filterUnavailableItems(Cart cart) {
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            return;
        }

        var unavailableItems = cart.getItems().stream()
                .filter(item -> !isCartItemAvailable(item))
                .toList();

        if (!unavailableItems.isEmpty()) {
            cartItemRepository.deleteAll(unavailableItems);
            log.info("Deleted {} unavailable cart items from cart: {}",
                    unavailableItems.size(), cart.getId());
        }

        cart.getItems().removeIf(item -> !isCartItemAvailable(item));
    }

    private boolean isCartItemAvailable(CartItem cartItem) {
        try {
            Product product = cartItem.getProduct();
            if (product == null) {
                Optional<Product> productOpt = productRepository.findByIdAndIsDeletedFalse(cartItem.getProductId());
                if (productOpt.isEmpty()) {
                    return false;
                }
                product = productOpt.get();
            }

            if (product.getIsDeleted() || !product.isActive()) {
                return false;
            }

            if (cartItem.getProductSizeId() != null) {
                ProductSize productSize = cartItem.getProductSize();
                if (productSize == null) {
                    Optional<ProductSize> sizeOpt = productSizeRepository.findById(cartItem.getProductSizeId());
                    if (sizeOpt.isEmpty()) {
                        return false;
                    }
                    productSize = sizeOpt.get();
                }
                return !productSize.getIsDeleted();
            }

            return true;
        } catch (Exception e) {
            log.error("Error checking cart item availability for item {}: {}", cartItem.getId(), e.getMessage());
            return false;
        }
    }

    private void updateCartItemCustomizations(CartItem cartItem, List<UUID> customizationIds) {
        log.info("=== CUSTOMIZATION UPDATE START === cartItemId: {}, incoming customizations: {}",
                cartItem.getId(), customizationIds != null ? customizationIds.size() : 0);

        // Validate input - MUST deduplicate before processing
        if (customizationIds != null && !customizationIds.isEmpty()) {
            // Check for duplicates in the request
            var uniqueIds = new java.util.LinkedHashSet<>(customizationIds);
            if (uniqueIds.size() != customizationIds.size()) {
                log.warn("DUPLICATE customization IDs detected: {} -> {} unique",
                        customizationIds.size(), uniqueIds.size());
                customizationIds = new java.util.ArrayList<>(uniqueIds);
            }
        }

        // Step 1: Delete ALL old customizations from database
        log.info("STEP 1: Deleting old customizations for cart item: {}", cartItem.getId());
        int deletedCount = entityManager.createNativeQuery(
                "DELETE FROM cart_item_customizations WHERE cart_item_id = :cartItemId")
                .setParameter("cartItemId", cartItem.getId())
                .executeUpdate();
        log.info("STEP 1 RESULT: Deleted {} customizations from database", deletedCount);

        // Step 2: Flush DELETE to database immediately
        log.info("STEP 2: Flushing DELETE operation to database");
        entityManager.flush();
        log.info("STEP 2 RESULT: DELETE flushed successfully");

        // Step 3: Detach and clear all customizations from the entity
        log.info("STEP 3: Clearing customizations from entity and session");
        for (CartItemCustomization custom : cartItem.getCustomizations()) {
            entityManager.detach(custom);
        }
        cartItem.getCustomizations().clear();
        log.info("STEP 3 RESULT: Entity customizations cleared");

        // Step 4: Refresh cart item from database to ensure Hibernate knows what's in DB
        log.info("STEP 4: Refreshing CartItem from database to sync Hibernate cache");
        entityManager.refresh(cartItem);
        log.info("STEP 4 RESULT: CartItem refreshed - customizations in memory: {}",
                cartItem.getCustomizations().size());

        // If no customizations provided, we're done
        if (customizationIds == null || customizationIds.isEmpty()) {
            log.info("=== CUSTOMIZATION UPDATE COMPLETE === No customizations to insert");
            return;
        }

        // Step 5: Insert new customizations from request
        log.info("STEP 5: Creating {} new customization entities", customizationIds.size());
        java.util.List<CartItemCustomization> newCustomizations = new java.util.ArrayList<>();
        java.util.Set<UUID> processedIds = new java.util.HashSet<>();

        for (UUID customizationId : customizationIds) {
            if (processedIds.contains(customizationId)) {
                log.warn("Skipping duplicate customization: {}", customizationId);
                continue;
            }
            processedIds.add(customizationId);

            ProductCustomization productCustom = productCustomizationRepository.findById(customizationId)
                    .orElseThrow(() -> new NotFoundException("Customization not found: " + customizationId));

            CartItemCustomization cartItemCustom = new CartItemCustomization(
                    cartItem.getId(),
                    customizationId,
                    productCustom.getName(),
                    productCustom.getPriceAdjustment()
            );
            newCustomizations.add(cartItemCustom);
            log.debug("Created CartItemCustomization entity: {}", customizationId);
        }
        log.info("STEP 5 RESULT: Created {} new customization entities", newCustomizations.size());

        // Step 6: Save all new customizations to database
        log.info("STEP 6: Saving {} customizations to database", newCustomizations.size());
        cartItemCustomizationRepository.saveAll(newCustomizations);
        log.info("STEP 6 RESULT: Customizations saved to repository");

        // Step 7: Flush INSERT operations to database immediately
        log.info("STEP 7: Flushing INSERT operations to database");
        entityManager.flush();
        log.info("STEP 7 RESULT: INSERT flushed successfully");

        // Step 8: Detach new customizations to prevent Hibernate from re-inserting on final flush
        log.info("STEP 8: Detaching new customizations to prevent re-insertion");
        for (CartItemCustomization custom : newCustomizations) {
            entityManager.detach(custom);
        }
        log.info("STEP 8 RESULT: New customizations detached successfully");

        log.info("=== CUSTOMIZATION UPDATE COMPLETE === Successfully processed {} customizations",
                newCustomizations.size());
    }
}

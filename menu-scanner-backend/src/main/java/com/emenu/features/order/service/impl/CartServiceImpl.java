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

        log.info("## BACKEND SUBMIT CART ITEM START - User: {}, Product: {}, Size: {}, Quantity: {}, CustomizationCount: {}",
                userId, request.getProductId(), request.getProductSizeId(),
                request.getQuantity(), request.getCustomizationIds() != null ? request.getCustomizationIds().size() : 0);

        if (request.getCustomizationIds() != null && !request.getCustomizationIds().isEmpty()) {
            log.info("## CUSTOMIZATION IDS: {}", request.getCustomizationIds());
        }

        // Validate product and derive businessId
        UUID businessId = validateProductAndGetBusinessId(request.getProductId(), request.getProductSizeId());
        log.info("## Derived businessId: {}", businessId);

        // Get or create cart
        Cart cart = getOrCreateCart(userId, businessId);
        log.info("## Cart ID: {}", cart.getId());

        // Reload cart with items to ensure we have all current cart items
        Optional<Cart> cartWithItems = cartRepository.findByUserIdAndBusinessIdWithItems(userId, businessId);
        cart = cartWithItems.orElse(cart);
        log.info("## Cart has {} items before processing", cart.getItems() != null ? cart.getItems().size() : 0);

        // Deduplicate customization IDs
        List<UUID> deduplicatedCustomizations = request.getCustomizationIds() != null && !request.getCustomizationIds().isEmpty()
                ? new java.util.ArrayList<>(new java.util.LinkedHashSet<>(request.getCustomizationIds()))
                : new java.util.ArrayList<>();
        log.info("## Deduplicated customizations count: {}", deduplicatedCustomizations.size());

        // Find matching cart item (product + size + customizations must match)
        log.info("## SEARCHING for matching item: productId={}, sizeId={}, customizations={}",
                request.getProductId(), request.getProductSizeId(), deduplicatedCustomizations);

        Optional<CartItem> matchingItem = findCartItemByProductSizeAndCustomizations(
                cart, request.getProductId(), request.getProductSizeId(), deduplicatedCustomizations);

        if (matchingItem.isPresent()) {
            // Found exact match - update quantity
            CartItem item = matchingItem.get();
            log.info("## FOUND matching item: {}", item.getId());
            log.info("## Item details - ProductId: {}, SizeId: {}, CurrentQty: {}, CustomizationCount: {}",
                    item.getProductId(), item.getProductSizeId(), item.getQuantity(),
                    item.getCustomizations() != null ? item.getCustomizations().size() : 0);

            if (request.getQuantity() == 0) {
                log.info("## DELETING item: {} (qty=0)", item.getId());

                // First, delete customizations (foreign key constraint)
                int customDeleted = entityManager.createNativeQuery(
                        "DELETE FROM cart_item_customizations WHERE cart_item_id = :itemId")
                        .setParameter("itemId", item.getId())
                        .executeUpdate();
                log.info("## Deleted {} customization rows", customDeleted);

                // Then delete the cart item
                int deletedCount = entityManager.createNativeQuery(
                        "DELETE FROM cart_items WHERE id = :itemId")
                        .setParameter("itemId", item.getId())
                        .executeUpdate();

                entityManager.flush();

                log.info("## ✓ DELETED {} cart item row(s) for item: {}", deletedCount, item.getId());

                if (deletedCount == 0) {
                    log.warn("## ⚠️ DELETE returned 0 rows! Item might not have been in DB");
                } else {
                    log.info("## ✓ REMOVED cart item: {} for user: {}", item.getId(), userId);
                }
            } else {
                log.info("## UPDATING item quantity from {} to {}", item.getQuantity(), request.getQuantity());
                item.setQuantity(request.getQuantity());
                cartItemRepository.save(item);
                entityManager.flush();
                log.info("## ✓ UPDATED cart item quantity to: {} for user: {}", request.getQuantity(), userId);
            }
        } else {
            // No exact match - create new item if quantity > 0
            log.info("## NO matching item found. Quantity: {}", request.getQuantity());
            if (request.getQuantity() > 0) {
                log.info("## CREATING new item (qty > 0)");
                CartItem newItem = new CartItem(
                        cart.getId(),
                        request.getProductId(),
                        request.getProductSizeId(),
                        request.getQuantity()
                );
                CartItem savedItem = cartItemRepository.save(newItem);
                entityManager.flush();

                updateCartItemCustomizations(savedItem, deduplicatedCustomizations);
                log.info("## ✓ ADDED new item to cart with quantity: {} and {} customizations for user: {}",
                        request.getQuantity(), deduplicatedCustomizations.size(), userId);
            } else {
                log.info("## SKIPPING - no match found and qty=0 (nothing to remove)");
            }
        }

        // Final flush to ensure all changes are persisted
        entityManager.flush();

        // Clear the persistence context so the reload query populates all lazy relations
        // (product, productSize) from the database instead of returning cached entities with null associations.
        entityManager.clear();

        // Reload cart with items for response (deduplication happens during load)
        CartSummaryResponse response = loadCartSummary(userId, businessId);
        log.info("## FINAL CART STATE - Items: {}, Total: {}, FinalTotal: {}",
                response.getTotalItems(), response.getTotalQuantity(), response.getFinalTotal());
        log.info("## BACKEND SUBMIT CART ITEM END");

        return response;
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

    private Optional<CartItem> findCartItemByProductSizeAndCustomizations(
            Cart cart, UUID productId, UUID productSizeId, List<UUID> customizationIds) {

        log.info("## SEARCH: Looking for item - productId: {}, sizeId: {}, customizations: {}",
                productId, productSizeId, customizationIds);

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            log.info("## SEARCH: Cart has no items");
            return Optional.empty();
        }

        log.info("## SEARCH: Cart has {} items, checking each...", cart.getItems().size());

        // Find item matching product, size, AND customizations
        for (CartItem item : cart.getItems()) {
            log.info("## SEARCH:   Checking item: {} - productId: {}, sizeId: {}, customCount: {}",
                    item.getId(), item.getProductId(), item.getProductSizeId(),
                    item.getCustomizations() != null ? item.getCustomizations().size() : 0);

            if (!item.getProductId().equals(productId)) {
                log.info("##   ✗ Product mismatch: {} != {}", item.getProductId(), productId);
                continue;
            }

            if (productSizeId != null ? !productSizeId.equals(item.getProductSizeId()) : item.getProductSizeId() != null) {
                log.info("##   ✗ Size mismatch: {} != {}", item.getProductSizeId(), productSizeId);
                continue;
            }

            // Check if customizations match exactly
            List<UUID> itemCustomizationIds = item.getCustomizations() == null
                    ? new java.util.ArrayList<>()
                    : item.getCustomizations().stream()
                        .map(CartItemCustomization::getProductCustomizationId)
                        .sorted()
                        .toList();

            List<UUID> requestCustomizationIds = customizationIds == null
                    ? new java.util.ArrayList<>()
                    : new java.util.ArrayList<>(customizationIds);
            requestCustomizationIds.sort(null);

            log.info("##   Customizations - Item: {}, Request: {}", itemCustomizationIds, requestCustomizationIds);

            if (itemCustomizationIds.equals(requestCustomizationIds)) {
                log.info("## ✓ FOUND MATCH: {}", item.getId());
                return Optional.of(item);
            } else {
                log.info("##   ✗ Customizations don't match");
            }
        }

        log.info("## SEARCH: NO MATCH FOUND");
        return Optional.empty();
    }

    private CartSummaryResponse loadCartSummary(UUID userId, UUID businessId) {
        log.info("## LOAD CART SUMMARY START - userId: {}, businessId: {}", userId, businessId);

        Optional<Cart> cartOpt = cartRepository.findByUserIdAndBusinessIdWithItems(userId, businessId);
        if (cartOpt.isPresent()) {
            Cart loaded = cartOpt.get();
            log.info("## LOAD: Cart found with {} items", loaded.getItems() != null ? loaded.getItems().size() : 0);

            if (loaded.getItems() != null && !loaded.getItems().isEmpty()) {
                for (CartItem item : loaded.getItems()) {
                    log.info("##   Item: {} - ProductId: {}, SizeId: {}, Qty: {}, CustomCount: {}",
                            item.getId(), item.getProductId(), item.getProductSizeId(), item.getQuantity(),
                            item.getCustomizations() != null ? item.getCustomizations().size() : 0);
                }
            }

            deduplicateCartItems(loaded);
            log.info("## LOAD: After dedup, cart has {} items", loaded.getItems() != null ? loaded.getItems().size() : 0);

            filterUnavailableItems(loaded);
            log.info("## LOAD: After filter, cart has {} items", loaded.getItems() != null ? loaded.getItems().size() : 0);

            CartSummaryResponse response = cartMapper.toSummaryResponse(loaded);
            log.info("## LOAD CART SUMMARY END - Returning {} items, totalItems: {}",
                    response.getItems() != null ? response.getItems().size() : 0,
                    response.getTotalItems());
            return response;
        }
        log.info("## LOAD: Cart not found, returning empty");
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

        // Keep track of (productId, productSizeId, customizations) and their IDs
        java.util.Map<String, java.util.UUID> latestByKey = new java.util.LinkedHashMap<>();
        java.util.Map<String, java.time.LocalDateTime> latestTimeByKey = new java.util.LinkedHashMap<>();
        java.util.List<java.util.UUID> duplicateIds = new java.util.ArrayList<>();

        for (CartItem item : cart.getItems()) {
            // Create key including customizations to distinguish items with different customization sets
            List<UUID> customizationIds = item.getCustomizations() == null
                    ? new java.util.ArrayList<>()
                    : item.getCustomizations().stream()
                        .map(CartItemCustomization::getProductCustomizationId)
                        .sorted()
                        .toList();
            String customizationKey = customizationIds.isEmpty() ? "none" : String.join(",", customizationIds.stream().map(UUID::toString).toList());
            String key = item.getProductId() + "|" + item.getProductSizeId() + "|" + customizationKey;
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
        log.info("Updating customizations for cartItem: {}", cartItem.getId());

        // Deduplicate request IDs
        if (customizationIds != null && !customizationIds.isEmpty()) {
            customizationIds = new java.util.ArrayList<>(new java.util.LinkedHashSet<>(customizationIds));
        }

        // Delete old customizations using native query and flush immediately
        int deletedCount = entityManager.createNativeQuery(
                "DELETE FROM cart_item_customizations WHERE cart_item_id = :cartItemId")
                .setParameter("cartItemId", cartItem.getId())
                .executeUpdate();
        entityManager.flush();
        log.info("Deleted {} old customizations from database", deletedCount);

        // Clear the entity's collection to avoid Hibernate tracking issues
        cartItem.getCustomizations().clear();

        // Exit early if no customizations to add
        if (customizationIds == null || customizationIds.isEmpty()) {
            log.info("No customizations to add for cartItem: {}", cartItem.getId());
            return;
        }

        // Create and save new customizations
        java.util.List<CartItemCustomization> newCustomizations = new java.util.ArrayList<>();
        java.util.Set<UUID> seenIds = new java.util.HashSet<>();

        for (UUID customizationId : customizationIds) {
            if (!seenIds.add(customizationId)) {
                continue; // Skip duplicates
            }

            ProductCustomization productCustom = productCustomizationRepository.findById(customizationId)
                    .orElseThrow(() -> new NotFoundException("Customization not found: " + customizationId));

            CartItemCustomization cartItemCustom = new CartItemCustomization(
                    cartItem.getId(),
                    customizationId,
                    productCustom.getName(),
                    productCustom.getPriceAdjustment()
            );
            newCustomizations.add(cartItemCustom);
        }

        // Save all at once and flush immediately
        if (!newCustomizations.isEmpty()) {
            cartItemCustomizationRepository.saveAll(newCustomizations);
            entityManager.flush();
            log.info("Added {} customizations to cartItem: {}", newCustomizations.size(), cartItem.getId());
        }
    }
}

package com.emenu.features.order.service.impl;

import com.emenu.exception.custom.NotFoundException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.models.User;
import com.emenu.features.order.dto.request.CartItemCreateRequest;
import com.emenu.features.order.dto.response.CartSummaryResponse;
import com.emenu.features.order.mapper.CartMapper;
import com.emenu.features.order.models.Cart;
import com.emenu.features.order.models.CartItem;
import com.emenu.features.order.repository.CartItemRepository;
import com.emenu.features.order.repository.CartRepository;
import com.emenu.features.order.service.CartService;
import com.emenu.features.main.models.Product;
import com.emenu.features.main.models.ProductSize;
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
    private final ProductRepository productRepository;
    private final ProductSizeRepository productSizeRepository;
    private final CartMapper cartMapper;
    private final SecurityUtils securityUtils;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @RetryOnOptimisticLock
    public CartSummaryResponse submitCartItem(CartItemCreateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        UUID userId = currentUser.getId();

        log.info("Submit cart item - User: {}, Product: {}, Quantity: {}",
                userId, request.getProductId(), request.getQuantity());

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
                cartItemRepository.save(newItem);
                log.info("Added new item to cart with quantity: {} for user: {}", request.getQuantity(), userId);
            }
        }

        // Flush pending changes and clear the persistence context so the reload
        // query populates all lazy relations (product, productSize) from the database
        // instead of returning cached entities with null associations.
        entityManager.flush();
        entityManager.clear();

        // Deduplicate after any add/update operations to prevent race condition duplicates
        deduplicateAfterSubmit(userId, businessId);

        // Reload cart with items for response
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

            // Apply pagination to items
            if (cart.getItems() != null && !cart.getItems().isEmpty()) {
                int start = (pageNo - 1) * pageSize;
                int end = Math.min(start + pageSize, cart.getItems().size());

                // Create a new list with only the paginated items
                List<CartItem> paginatedItems = cart.getItems().subList(start, end);
                cart.setItems(paginatedItems);
            }

            return cartMapper.toSummaryResponse(cart);
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

    private void deduplicateAfterSubmit(UUID userId, UUID businessId) {
        try {
            Optional<Cart> cartOpt = cartRepository.findByUserIdAndBusinessIdWithItems(userId, businessId);
            if (cartOpt.isPresent()) {
                Cart cart = cartOpt.get();
                deduplicateCartItems(cart);
            }
        } catch (Exception e) {
            log.error("Error deduplicating cart after submit: {}", e.getMessage());
            // Don't fail the request if deduplication fails
        }
    }

    private void deduplicateCartItems(Cart cart) {
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            return;
        }

        // Keep track of (productId, productSizeId) pairs we've seen
        // Store the newest item for each pair
        java.util.Map<String, CartItem> seenItems = new java.util.LinkedHashMap<>();
        java.util.List<CartItem> duplicates = new java.util.ArrayList<>();

        for (CartItem item : cart.getItems()) {
            String key = item.getProductId() + "|" + item.getProductSizeId();
            if (seenItems.containsKey(key)) {
                // Compare by createdAt, keep the newer one
                CartItem existing = seenItems.get(key);
                if (item.getCreatedAt().isAfter(existing.getCreatedAt())) {
                    duplicates.add(existing);
                    seenItems.put(key, item);
                } else {
                    duplicates.add(item);
                }
            } else {
                seenItems.put(key, item);
            }
        }

        // Delete duplicates from database
        if (!duplicates.isEmpty()) {
            cartItemRepository.deleteAll(duplicates);
            log.warn("Removed {} duplicate cart items", duplicates.size());
        }

        // Update cart with deduplicated items
        cart.setItems(new java.util.ArrayList<>(seenItems.values()));
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
}

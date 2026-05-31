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

        UUID businessId = validateProductAndGetBusinessId(request.getProductId(), request.getProductSizeId());

        Cart cart = getOrCreateCart(userId, businessId);

        Optional<Cart> cartWithItems = cartRepository.findByUserIdAndBusinessIdWithItems(userId, businessId);
        cart = cartWithItems.orElse(cart);

        List<UUID> deduplicatedCustomizations = request.getCustomizationIds() != null && !request.getCustomizationIds().isEmpty()
                ? new java.util.ArrayList<>(new java.util.LinkedHashSet<>(request.getCustomizationIds()))
                : new java.util.ArrayList<>();

        Optional<CartItem> matchingItem = findCartItemByProductSizeAndCustomizations(
                cart, request.getProductId(), request.getProductSizeId(), deduplicatedCustomizations);

        if (matchingItem.isPresent()) {
            CartItem item = matchingItem.get();

            if (request.getQuantity() == 0) {
                int customDeleted = entityManager.createNativeQuery(
                        "DELETE FROM cart_item_customizations WHERE cart_item_id = :itemId")
                        .setParameter("itemId", item.getId())
                        .executeUpdate();

                entityManager.createNativeQuery(
                        "DELETE FROM cart_items WHERE id = :itemId")
                        .setParameter("itemId", item.getId())
                        .executeUpdate();

                entityManager.flush();
            } else {
                item.setQuantity(request.getQuantity());
                cartItemRepository.save(item);
                entityManager.flush();
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
                entityManager.flush();
                updateCartItemCustomizations(savedItem, deduplicatedCustomizations);
            }
        }

        entityManager.flush();
        entityManager.clear();

        return loadCartSummary(userId, businessId);
    }

    @Override
    @Transactional(readOnly = true)
    public CartSummaryResponse getCart(UUID businessId) {
        UUID userId = securityUtils.getCurrentUserId();
        return loadCartSummary(userId, businessId);
    }

    @Override
    @Transactional(readOnly = true)
    public CartSummaryResponse getCartPaginated(UUID businessId, int pageNo, int pageSize) {
        UUID userId = securityUtils.getCurrentUserId();

        Optional<Cart> cartOpt = cartRepository.findByUserIdAndBusinessIdWithItems(userId, businessId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();

            deduplicateCartItems(cart);
            filterUnavailableItems(cart);

            int totalItemCount = cart.getItems() == null ? 0 : cart.getItems().size();

            if (cart.getItems() != null && !cart.getItems().isEmpty()) {
                int start = (pageNo - 1) * pageSize;
                int end = Math.min(start + pageSize, cart.getItems().size());
                List<CartItem> paginatedItems = cart.getItems().subList(start, end);
                cart.setItems(paginatedItems);
            }

            CartSummaryResponse response = cartMapper.toSummaryResponse(cart);
            response.setTotalItems(totalItemCount);
            return response;
        }
        return emptyCartSummary();
    }

    @Override
    public CartSummaryResponse clearCart(UUID businessId) {
        UUID userId = securityUtils.getCurrentUserId();

        Optional<Cart> cartOpt = cartRepository.findByUserIdAndBusinessIdWithItems(userId, businessId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            if (cart.getItems() != null && !cart.getItems().isEmpty()) {
                cartItemRepository.deleteAll(cart.getItems());
                cart.getItems().clear();
            }
        }

        return emptyCartSummary();
    }

    // ===== PRIVATE HELPER METHODS =====

    private Optional<CartItem> findCartItemByProductSizeAndCustomizations(
            Cart cart, UUID productId, UUID productSizeId, List<UUID> customizationIds) {

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            return Optional.empty();
        }

        for (CartItem item : cart.getItems()) {
            if (!item.getProductId().equals(productId)) continue;

            if (productSizeId != null ? !productSizeId.equals(item.getProductSizeId()) : item.getProductSizeId() != null) continue;

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

            if (itemCustomizationIds.equals(requestCustomizationIds)) {
                return Optional.of(item);
            }
        }

        return Optional.empty();
    }

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
        return cartRepository.save(newCart);
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
        if (product == null) throw new ValidationException("Product not found");
        if (product.getIsDeleted()) throw new ValidationException("Product has been removed");
        if (!product.isActive()) throw new ValidationException("Product is no longer available");
    }

    private void deduplicateCartItems(Cart cart) {
        if (cart.getItems() == null || cart.getItems().isEmpty()) return;

        java.util.Map<String, java.util.UUID> latestByKey = new java.util.LinkedHashMap<>();
        java.util.Map<String, java.time.LocalDateTime> latestTimeByKey = new java.util.LinkedHashMap<>();
        java.util.List<java.util.UUID> duplicateIds = new java.util.ArrayList<>();

        for (CartItem item : cart.getItems()) {
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
                java.time.LocalDateTime existingTime = latestTimeByKey.get(key);
                if (itemTime != null && existingTime != null && itemTime.isAfter(existingTime)) {
                    duplicateIds.add(latestByKey.get(key));
                    latestByKey.put(key, item.getId());
                    latestTimeByKey.put(key, itemTime);
                } else {
                    duplicateIds.add(item.getId());
                }
            } else {
                latestByKey.put(key, item.getId());
                latestTimeByKey.put(key, itemTime);
            }
        }

        if (!duplicateIds.isEmpty()) {
            cart.getItems().removeIf(item -> duplicateIds.contains(item.getId()));
            log.warn("Removed {} duplicate cart items", duplicateIds.size());
        }
    }

    private void filterUnavailableItems(Cart cart) {
        if (cart.getItems() == null || cart.getItems().isEmpty()) return;

        var unavailableItems = cart.getItems().stream()
                .filter(item -> !isCartItemAvailable(item))
                .toList();

        if (!unavailableItems.isEmpty()) {
            cartItemRepository.deleteAll(unavailableItems);
        }

        cart.getItems().removeIf(item -> !isCartItemAvailable(item));
    }

    private boolean isCartItemAvailable(CartItem cartItem) {
        try {
            Product product = cartItem.getProduct();
            if (product == null) {
                Optional<Product> productOpt = productRepository.findByIdAndIsDeletedFalse(cartItem.getProductId());
                if (productOpt.isEmpty()) return false;
                product = productOpt.get();
            }

            if (product.getIsDeleted() || !product.isActive()) return false;

            if (cartItem.getProductSizeId() != null) {
                ProductSize productSize = cartItem.getProductSize();
                if (productSize == null) {
                    Optional<ProductSize> sizeOpt = productSizeRepository.findById(cartItem.getProductSizeId());
                    if (sizeOpt.isEmpty()) return false;
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
        if (customizationIds != null && !customizationIds.isEmpty()) {
            customizationIds = new java.util.ArrayList<>(new java.util.LinkedHashSet<>(customizationIds));
        }

        entityManager.createNativeQuery(
                "DELETE FROM cart_item_customizations WHERE cart_item_id = :cartItemId")
                .setParameter("cartItemId", cartItem.getId())
                .executeUpdate();
        entityManager.flush();

        cartItem.getCustomizations().clear();

        if (customizationIds == null || customizationIds.isEmpty()) return;

        java.util.List<CartItemCustomization> newCustomizations = new java.util.ArrayList<>();
        java.util.Set<UUID> seenIds = new java.util.HashSet<>();

        for (UUID customizationId : customizationIds) {
            if (!seenIds.add(customizationId)) continue;

            ProductCustomization productCustom = productCustomizationRepository.findById(customizationId)
                    .orElseThrow(() -> new NotFoundException("Customization not found: " + customizationId));

            newCustomizations.add(new CartItemCustomization(
                    cartItem.getId(),
                    customizationId,
                    productCustom.getName(),
                    productCustom.getPriceAdjustment()
            ));
        }

        if (!newCustomizations.isEmpty()) {
            cartItemCustomizationRepository.saveAll(newCustomizations);
            entityManager.flush();
        }
    }
}

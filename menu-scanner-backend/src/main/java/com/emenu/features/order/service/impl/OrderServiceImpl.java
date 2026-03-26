package com.emenu.features.order.service.impl;

import com.emenu.enums.order.OrderStatus;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.exception.custom.NotFoundException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.models.User;
import com.emenu.features.order.dto.filter.OrderFilterRequest;
import com.emenu.features.order.dto.helper.OrderPaymentCreateHelper;
import com.emenu.features.order.dto.helper.OrderCreateHelper;
import com.emenu.features.order.dto.helper.OrderItemCreateHelper;
import com.emenu.features.order.dto.request.OrderCreateRequest;
import com.emenu.features.order.dto.request.POSCheckoutRequest;
import com.emenu.features.order.dto.request.POSCheckoutItemRequest;
import com.emenu.features.order.dto.response.OrderResponse;
import com.emenu.features.order.dto.response.POSCheckoutResponse;
import com.emenu.features.order.dto.update.OrderUpdateRequest;
import com.emenu.enums.payment.PaymentMethod;
import com.emenu.features.order.models.DeliveryOption;
import com.emenu.features.order.repository.DeliveryOptionRepository;
import com.emenu.features.main.models.Product;
import com.emenu.features.main.repository.ProductRepository;
import com.emenu.features.order.mapper.OrderPaymentMapper;
import com.emenu.features.order.mapper.OrderMapper;
import com.emenu.features.order.models.OrderPayment;
import com.emenu.features.order.models.Cart;
import com.emenu.features.order.models.Order;
import com.emenu.features.order.models.OrderItem;
import com.emenu.features.order.repository.OrderPaymentRepository;
import com.emenu.features.order.repository.CartRepository;
import com.emenu.features.order.repository.OrderRepository;
import com.emenu.features.order.repository.OrderStatusHistoryRepository;
import com.emenu.features.order.models.OrderStatusHistory;
import com.emenu.features.order.service.OrderService;
import com.emenu.features.stock.service.impl.StockServiceImpl;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.generate.ReferenceNumberGenerator;
import com.emenu.shared.generate.PaymentReferenceGenerator;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final OrderPaymentRepository paymentRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final DeliveryOptionRepository deliveryOptionRepository;
    private final ProductRepository productRepository;
    private final OrderMapper orderMapper;
    private final OrderPaymentMapper paymentMapper;
    private final SecurityUtils securityUtils;
    private final ReferenceNumberGenerator referenceNumberGenerator;
    private final PaymentReferenceGenerator paymentReferenceGenerator;
    private final PaginationMapper paginationMapper;
    private final StockServiceImpl stockService;
    private final ObjectMapper objectMapper;

    @Override
    public OrderResponse createOrderFromCart(OrderCreateRequest request) {
        log.info("🛍️  [CHECKOUT START] Creating order from cart - Business: {}, Customer: {}",
            request.getBusinessId(), securityUtils.getCurrentUser().getId());

        User currentUser = securityUtils.getCurrentUser();

        try {
            log.debug("📋 [STEP 1/6] Creating base order...");
            Order order = createBaseOrder(request, currentUser.getId());

            // Set order status - default to PENDING if not specified
            OrderStatus status = request.getOrderStatus() != null ? request.getOrderStatus() : OrderStatus.PENDING;
            log.debug("📋 [STEP 2/6] Setting order status: {}", status);
            order.setOrderStatus(status);

            log.debug("📋 [STEP 3/6] Saving base order...");
            Order savedOrder = orderRepository.save(order);
            log.info("✅ [ORDER CREATED] Order #{} saved with ID: {}", savedOrder.getOrderNumber(), savedOrder.getId());

            // Create initial order status history to track when order was created
            log.debug("📋 [STEP 3.5/6] Creating initial status history...");
            createInitialOrderStatusHistory(savedOrder, currentUser.getId());

            // Create order items from cart summary (frontend) or database cart
            if (request.getCart() != null && request.getCart().getItems() != null && !request.getCart().getItems().isEmpty()) {
                log.info("📋 [STEP 4/7] Processing {} items from frontend cart summary", request.getCart().getItems().size());
                // Only POSCheckoutRequest has pricing info, OrderCreateRequest doesn't
                createOrderItemsFromCartSummary(savedOrder.getId(), request.getCart(), null);
            } else {
                log.info("📋 [STEP 4/7] Processing items from database cart");
                Cart cart = cartRepository.findByUserIdAndBusinessIdWithItems(currentUser.getId(), request.getBusinessId())
                        .orElseThrow(() -> new ValidationException("Cart is empty or not found"));

                if (cart.getItems() == null || cart.getItems().isEmpty()) {
                    throw new ValidationException("Cannot create order from empty cart");
                }

                createOrderItemsFromCart(savedOrder.getId(), cart);
            }

            log.debug("📋 [STEP 5/7] Creating payment record...");
            createPaymentRecord(savedOrder);

            log.debug("📋 [STEP 6/7] Clearing cart...");
            clearCartAfterOrder(currentUser.getId(), request.getBusinessId());

            log.info("✅ [CHECKOUT SUCCESS] Order created successfully: {} - Fetching full response...", savedOrder.getOrderNumber());
            OrderResponse response = getOrderById(savedOrder.getId());
            log.info("🎉 [CHECKOUT COMPLETE] Order #{} - Total: {}, Items: {}",
                response.getOrderNumber(),
                response.getPricing() != null && response.getPricing().getAfter() != null ?
                    response.getPricing().getAfter().getFinalTotal() : "N/A",
                response.getItems().size());
            return response;
        } catch (Exception e) {
            log.error("❌ [CHECKOUT ERROR] Failed to create order: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<OrderResponse> getCustomerOrderHistory(OrderFilterRequest filter) {
        long startTime = System.currentTimeMillis();
        User currentUser = securityUtils.getCurrentUser();
        filter.setBusinessId(null);  // Clear any business filter for customer orders

        log.info("📋 [CUSTOMER ORDER HISTORY] Fetching orders for customer: {} | Page: {}, Size: {}",
                currentUser.getId(), filter.getPageNo(), filter.getPageSize());

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        log.debug("🔍 [DB QUERY] Executing paginated query with eager loading of business and customer...");
        Page<Order> page = orderRepository.findByCustomerIdAndIsDeletedFalseOrderByCreatedAtDesc(currentUser.getId(), pageable);
        log.debug("✅ [DB QUERY COMPLETE] Retrieved {} orders from database", page.getNumberOfElements());

        // Eagerly load statusHistory for all orders to prevent lazy loading during mapping
        log.debug("📌 [LOADING STATUS HISTORY] Loading status history for {} orders...", page.getNumberOfElements());
        page.getContent().forEach(order -> {
            List<OrderStatusHistory> statusHistory = orderRepository.findStatusHistoryByOrderId(order.getId());
            order.setStatusHistory(statusHistory);
            log.debug("   - Order {}: {} status history records", order.getOrderNumber(), statusHistory.size());
        });

        log.debug("🔄 [MAPPING] Converting {} orders to response DTOs...", page.getNumberOfElements());
        PaginationResponse<OrderResponse> response = orderMapper.toPaginationResponse(page, paginationMapper);

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ [CUSTOMER ORDER HISTORY COMPLETE] Retrieved {} orders in {} ms | Total: {} | Page: {}/{}",
                page.getNumberOfElements(), duration, page.getTotalElements(),
                page.getNumber() + 1, page.getTotalPages());

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        // Load statusHistory separately to avoid MultipleBagFetchException
        // This ensures changedByUser is eagerly loaded
        List<OrderStatusHistory> statusHistory = orderRepository.findStatusHistoryByOrderId(orderId);
        order.setStatusHistory(statusHistory);

        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<OrderResponse> getAllOrders(OrderFilterRequest filter) {
        long startTime = System.currentTimeMillis();
        User currentUser = securityUtils.getCurrentUser();

        log.info("📊 [GET ALL ORDERS] Starting retrieval | User: {}",
                currentUser.getId());

        // If user is a business user and no businessId filter is provided, restrict to their business
        if (currentUser.isBusinessUser() && filter.getBusinessId() == null) {
            filter.setBusinessId(currentUser.getBusinessId());
            log.debug("🔐 [AUTO-FILTER] Business user detected - auto-filtering to business: {}", currentUser.getBusinessId());
        }

        log.debug("🔍 [FILTER PARAMETERS] BusinessId: {}, OrderStatus: {}, PaymentMethod: {}, PaymentStatus: {}",
                filter.getBusinessId(), filter.getOrderStatus(), filter.getPaymentMethod(), filter.getPaymentStatus());

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );
        log.debug("📑 [PAGINATION] PageNo: {}, PageSize: {}, SortBy: {}, Direction: {}",
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection());

        // Apply filters: businessId, orderStatus, paymentMethod, paymentStatus
        log.debug("🗄️  [DB QUERY START] Executing filtered query with eager loading...");
        long queryStartTime = System.currentTimeMillis();
        Page<Order> page = orderRepository.findAllWithFilters(
                filter.getBusinessId(),
                filter.getOrderStatus(),
                filter.getPaymentMethod(),
                filter.getPaymentStatus(),
                pageable
        );
        long queryDuration = System.currentTimeMillis() - queryStartTime;
        log.info("✅ [DB QUERY COMPLETE] Retrieved {} orders (query took {} ms) | Total: {} | Pages: {}",
                page.getNumberOfElements(), queryDuration, page.getTotalElements(), page.getTotalPages());

        // Eagerly load statusHistory for all orders to prevent lazy loading during mapping
        log.debug("📌 [LOADING STATUS HISTORY] Loading status history for {} orders...", page.getNumberOfElements());
        int historyCount = 0;
        for (Order order : page.getContent()) {
            List<OrderStatusHistory> statusHistory = orderRepository.findStatusHistoryByOrderId(order.getId());
            order.setStatusHistory(statusHistory);
            historyCount += statusHistory.size();
            log.debug("   - Order {}: {} status history records", order.getOrderNumber(), statusHistory.size());
        }
        log.debug("✅ [STATUS HISTORY LOADED] Total history records: {}", historyCount);

        log.debug("🔄 [MAPPING] Converting {} orders to response DTOs...", page.getNumberOfElements());
        long mappingStartTime = System.currentTimeMillis();
        PaginationResponse<OrderResponse> response = orderMapper.toPaginationResponse(page, paginationMapper);
        long mappingDuration = System.currentTimeMillis() - mappingStartTime;
        log.debug("✅ [MAPPING COMPLETE] Conversion took {} ms", mappingDuration);

        long totalDuration = System.currentTimeMillis() - startTime;
        log.info("✅ [GET ALL ORDERS COMPLETE] Total time: {} ms | Orders: {} | Total records: {} | Pages: {}/{}",
                totalDuration, page.getNumberOfElements(), page.getTotalElements(),
                page.getNumber() + 1, page.getTotalPages());

        return response;
    }

    @Override
    public OrderResponse updateOrder(UUID orderId, OrderUpdateRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (!currentUser.getBusinessId().equals(order.getBusinessId())) {
            throw new ValidationException("You can only update orders for your business");
        }

        if (request.getOrderStatus() != null) {
            OrderStatus previousStatus = order.getOrderStatus();
            order.updateStatus(request.getOrderStatus());

            // Deduct stock via FIFO when order moves to CONFIRMED
            if (request.getOrderStatus() == OrderStatus.CONFIRMED && previousStatus != OrderStatus.CONFIRMED) {
                deductStockForOrder(order);
            }
        }

        ObjectMapper objectMapper = new ObjectMapper();

        // Update delivery address snapshot if provided
        if (request.getDeliveryAddress() != null) {
            try {
                order.setDeliveryAddressSnapshot(objectMapper.writeValueAsString(request.getDeliveryAddress()));
            } catch (Exception e) {
                log.warn("Failed to serialize delivery address snapshot", e);
            }
        }

        // Update delivery option snapshot if provided
        if (request.getDeliveryOption() != null) {
            try {
                order.setDeliveryOptionSnapshot(objectMapper.writeValueAsString(request.getDeliveryOption()));
            } catch (Exception e) {
                log.warn("Failed to serialize delivery option snapshot", e);
            }
            order.setDeliveryFee(request.getDeliveryOption().getPrice());

            // Recalculate total with new delivery fee
            order.setTotalAmount(order.getSubtotal().add(request.getDeliveryOption().getPrice()));
        }

        if (request.getPaymentMethod() != null) {
            order.setPaymentMethod(request.getPaymentMethod());
        }
        if (request.getPaymentStatus() != null) {
            order.setPaymentStatus(request.getPaymentStatus());
        }
        if (request.getCustomerNote() != null) {
            order.setCustomerNote(request.getCustomerNote());
        }
        if (request.getBusinessNote() != null) {
            order.setBusinessNote(request.getBusinessNote());
        }

        // Update order items if provided
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            log.info("Updating order items for order: {}", orderId);
            // Clear existing items - cascade delete will handle cleanup
            order.getItems().clear();

            // Create new items from the request
            for (com.emenu.features.order.dto.request.OrderItemUpdateRequest itemRequest : request.getItems()) {
                OrderItem item = new OrderItem();
                item.setOrderId(orderId);
                item.setProductId(itemRequest.getProductId());
                item.setProductSizeId(itemRequest.getProductSizeId());
                item.setProductName(itemRequest.getProductName());
                item.setProductImageUrl(itemRequest.getProductImageUrl());
                item.setSizeName(itemRequest.getSizeName());
                item.setCurrentPrice(itemRequest.getCurrentPrice());
                item.setFinalPrice(itemRequest.getFinalPrice());
                item.setUnitPrice(itemRequest.getUnitPrice());
                item.setQuantity(itemRequest.getQuantity());
                item.setTotalPrice(itemRequest.getFinalPrice().multiply(new BigDecimal(itemRequest.getQuantity())));
                item.setHasPromotion(itemRequest.getHasPromotion());
                item.setPromotionType(itemRequest.getPromotionType());
                item.setPromotionValue(itemRequest.getPromotionValue());
                item.setPromotionFromDate(itemRequest.getPromotionFromDate());
                item.setPromotionToDate(itemRequest.getPromotionToDate());
                item.setOrder(order);

                order.getItems().add(item);
            }

            // Recalculate subtotal from items
            BigDecimal newSubtotal = order.getItems().stream()
                    .map(OrderItem::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            order.setSubtotal(newSubtotal);
        }

        // Full update fields
        if (request.getDiscountAmount() != null) {
            order.setDiscountAmount(request.getDiscountAmount());
        }
        if (request.getTaxAmount() != null) {
            order.setTaxAmount(request.getTaxAmount());
        }
        if (request.getDeliveryFee() != null && request.getDeliveryOption() == null) {
            // Only update delivery fee directly if delivery option is not provided
            order.setDeliveryFee(request.getDeliveryFee());
        }

        // Recalculate total amount if any pricing fields are updated or items changed
        if (request.getItems() != null || request.getDiscountAmount() != null || request.getTaxAmount() != null ||
            (request.getDeliveryFee() != null && request.getDeliveryOption() == null)) {
            BigDecimal subtotal = order.getSubtotal() != null ? order.getSubtotal() : BigDecimal.ZERO;
            BigDecimal discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
            BigDecimal delivery = order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO;
            BigDecimal tax = order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO;
            order.setTotalAmount(subtotal.subtract(discount).add(delivery).add(tax));
        }

        Order updatedOrder = orderRepository.save(order);

        log.info("Order updated: {}", orderId);
        return orderMapper.toResponse(updatedOrder);
    }

    @Override
    public OrderResponse deleteOrder(UUID orderId) {
        User currentUser = securityUtils.getCurrentUser();

        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (!currentUser.getBusinessId().equals(order.getBusinessId())) {
            throw new ValidationException("You can only delete orders for your business");
        }

        order.setIsDeleted(true);
        order = orderRepository.save(order);

        log.info("Order deleted: {}", orderId);

        return orderMapper.toResponse(order);
    }

    private Order createBaseOrder(OrderCreateRequest request, UUID customerId) {
        OrderCreateHelper helper = orderMapper.buildOrderHelper(request, customerId, generateOrderNumber());
        return orderMapper.createFromHelper(helper);
    }

    private void createOrderItemsFromCart(UUID orderId, Cart cart) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal discountAmount = BigDecimal.ZERO;

        for (var cartItem : cart.getItems()) {
            OrderItemCreateHelper helper = orderMapper.buildOrderItemHelperFromCartItem(cartItem, orderId);
            OrderItem orderItem = orderMapper.createOrderItemFromHelper(helper);
            orderItem.calculateTotalPrice();

            // Set default audit trail values for cart items (no POS changes)
            orderItem.setHadChangeFromPOS(false);

            subtotal = subtotal.add(orderItem.getTotalPrice());
            // Accumulate discount = base price - final price per item * quantity
            BigDecimal itemDiscount = cartItem.getCurrentPrice().subtract(cartItem.getFinalPrice())
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            if (itemDiscount.compareTo(BigDecimal.ZERO) > 0) {
                discountAmount = discountAmount.add(itemDiscount);
            }
        }

        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);

        // Set default audit trail values for cart orders (no POS changes)
        order.setHadOrderLevelChangeFromPOS(false);
        order.setOrderLevelChangeReason("No order-level changes - regular cart order");

        BigDecimal deliveryFee = order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO;
        BigDecimal taxAmount = order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO;
        order.setTotalAmount(subtotal.subtract(discountAmount).add(deliveryFee).add(taxAmount));
        orderRepository.save(order);
    }

    private void createOrderItemsFromCartSummary(UUID orderId, Object cartSummary,
                                                  POSCheckoutRequest.PricingInfo pricingInfo) {
        // Handle both CartSummaryResponse and POSCheckoutRequest.CartSummary
        if (!(cartSummary instanceof com.emenu.features.order.dto.response.CartSummaryResponse)) {
            log.warn("Invalid cart summary type: {}", cartSummary.getClass().getName());
            return;
        }

        com.emenu.features.order.dto.response.CartSummaryResponse cartResponse =
                (com.emenu.features.order.dto.response.CartSummaryResponse) cartSummary;

        log.debug("🛒 [CART SUMMARY] Processing {} items for order: {}", cartResponse.getItems().size(), orderId);

        BigDecimal subtotal = cartResponse.getSubtotal() != null ? cartResponse.getSubtotal() : BigDecimal.ZERO;
        BigDecimal discountAmount = cartResponse.getTotalDiscount() != null ? cartResponse.getTotalDiscount() : BigDecimal.ZERO;

        log.debug("💰 [PRICING] Subtotal: {}, Discount: {}", subtotal, discountAmount);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    log.error("❌ [ERROR] Order not found: {}", orderId);
                    return new NotFoundException("Order not found: " + orderId);
                });

        log.debug("✅ [ORDER LOADED] Order ID: {}, Items List: {}", orderId, order.getItems() != null ? "initialized" : "null");

        int itemCount = 0;
        for (var item : cartResponse.getItems()) {
            itemCount++;

            // Use after snapshot for final pricing if available (new audit trail structure)
            BigDecimal finalPrice = item.getAfter() != null ? item.getAfter().getFinalPrice() : item.getFinalPrice();

            log.debug("📦 [ITEM {}] Product: {} (ID: {}), Qty: {}, Price: {}, HasChangeFromPOS: {}",
                itemCount, item.getProductName(), item.getProductId(), item.getQuantity(), finalPrice, item.getHadChangeFromPOS());

            OrderItemCreateHelper helper = OrderItemCreateHelper.builder()
                    .orderId(orderId)
                    .productId(item.getProductId())
                    .productSizeId(item.getProductSizeId())
                    .productName(item.getProductName())
                    .productImageUrl(item.getProductImageUrl())
                    .sizeName(item.getSizeName())
                    // Use before snapshot for current price if available
                    .currentPrice(item.getBefore() != null ? item.getBefore().getCurrentPrice() : item.getCurrentPrice())
                    .finalPrice(finalPrice)
                    .unitPrice(finalPrice)
                    .hasPromotion(item.getAfter() != null ? item.getAfter().getHasActivePromotion() : item.getHasActivePromotion())
                    .promotionType(item.getAfter() != null && item.getAfter().getPromotionType() != null ?
                            item.getAfter().getPromotionType() : item.getPromotionType())
                    .promotionValue(item.getAfter() != null ? item.getAfter().getPromotionValue() : item.getPromotionValue())
                    .promotionFromDate(item.getAfter() != null ? item.getAfter().getPromotionFromDate() : null)
                    .promotionToDate(item.getAfter() != null ? item.getAfter().getPromotionToDate() : null)
                    .quantity(item.getQuantity())
                    .build();

            OrderItem orderItem = orderMapper.createOrderItemFromHelper(helper);
            orderItem.setTotalPrice(item.getTotalPrice() != null ? item.getTotalPrice() :
                    finalPrice.multiply(new BigDecimal(item.getQuantity())));

            // Store audit trail - always set hadChangeFromPOS (true/false, never null)
            orderItem.setHadChangeFromPOS(item.getHadChangeFromPOS() != null && item.getHadChangeFromPOS());

            if (item.getHadChangeFromPOS() != null && item.getHadChangeFromPOS()) {
                try {
                    if (item.getBefore() != null) {
                        orderItem.setBeforeSnapshot(objectMapper.writeValueAsString(item.getBefore()));
                    }
                    if (item.getAfter() != null) {
                        orderItem.setAfterSnapshot(objectMapper.writeValueAsString(item.getAfter()));
                    }
                    if (item.getAuditMetadata() != null) {
                        orderItem.setAuditMetadata(objectMapper.writeValueAsString(item.getAuditMetadata()));
                    }
                } catch (Exception e) {
                    log.warn("Failed to serialize audit trail for item {}: {}", item.getProductName(), e.getMessage());
                }
            } else {
                // No changes from POS - set before/after as same snapshot if available
                try {
                    if (item.getBefore() != null) {
                        orderItem.setBeforeSnapshot(objectMapper.writeValueAsString(item.getBefore()));
                        orderItem.setAfterSnapshot(objectMapper.writeValueAsString(item.getBefore()));
                    }
                } catch (Exception e) {
                    log.warn("Failed to serialize no-change audit trail for item {}: {}", item.getProductName(), e.getMessage());
                }
            }

            orderItem.setOrder(order);
            order.getItems().add(orderItem);
            log.debug("✅ [ITEM ADDED] Item {} added to order, total items now: {}", itemCount, order.getItems().size());
        }

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);

        BigDecimal deliveryFee = order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO;
        BigDecimal taxAmount = order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.subtract(discountAmount).add(deliveryFee).add(taxAmount);
        order.setTotalAmount(totalAmount);

        // Store order-level pricing audit trail if provided
        if (pricingInfo != null) {
            try {
                if (pricingInfo.getBefore() != null) {
                    order.setPricingBeforeSnapshot(objectMapper.writeValueAsString(pricingInfo.getBefore()));
                }
                // Always set hadOrderLevelChangeFromPOS (true/false, never null)
                order.setHadOrderLevelChangeFromPOS(pricingInfo.getHadOrderLevelChangeFromPOS() != null && pricingInfo.getHadOrderLevelChangeFromPOS());
                if (pricingInfo.getAfter() != null) {
                    order.setPricingAfterSnapshot(objectMapper.writeValueAsString(pricingInfo.getAfter()));
                }
                if (pricingInfo.getDiscountMetadata() != null) {
                    order.setOrderDiscountMetadata(objectMapper.writeValueAsString(pricingInfo.getDiscountMetadata()));
                }
                if (pricingInfo.getOrderLevelChangeReason() != null && !pricingInfo.getOrderLevelChangeReason().isEmpty()) {
                    order.setOrderLevelChangeReason(pricingInfo.getOrderLevelChangeReason());
                } else if (!order.getHadOrderLevelChangeFromPOS()) {
                    // Set default reason if no change occurred
                    order.setOrderLevelChangeReason("No order-level changes from POS");
                }
            } catch (Exception e) {
                log.warn("Failed to serialize order-level pricing audit trail: {}", e.getMessage());
            }
        }

        log.info("💾 [SAVING ORDER] Order ID: {}, Items: {}, Total: {} (Subtotal: {}, Discount: {}, Delivery: {}, Tax: {})",
            orderId, order.getItems().size(), totalAmount, subtotal, discountAmount, deliveryFee, taxAmount);

        orderRepository.save(order);
        log.info("✅ [ORDER ITEMS SAVED] Successfully saved {} items for order: {}", order.getItems().size(), orderId);
    }

    private void createPaymentRecord(Order order) {
        BigDecimal subtotal = order.getSubtotal() != null ? order.getSubtotal() : BigDecimal.ZERO;
        BigDecimal discountAmount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal deliveryFee = order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO;
        BigDecimal taxAmount = order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO;

        OrderPaymentCreateHelper helper = OrderPaymentCreateHelper.builder()
                .businessId(order.getBusinessId())
                .orderId(order.getId())
                .referenceNumber(paymentReferenceGenerator.generateUniqueReference())
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .deliveryFee(deliveryFee)
                .taxAmount(taxAmount)
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .customerPaymentMethod(null)
                .build();
        OrderPayment payment = paymentMapper.createFromHelper(helper);
        paymentRepository.save(payment);
    }

    private void clearCartAfterOrder(UUID customerId, UUID businessId) {
        cartRepository.findByUserIdAndBusinessIdAndIsDeletedFalse(customerId, businessId)
                .ifPresent(cart -> {
                    if (cart.getItems() != null) {
                        cart.getItems().clear();
                    }
                    log.info("Cart cleared after order for customer: {} and business: {}", customerId, businessId);
                });
    }

    private void createInitialOrderStatusHistory(Order order, UUID userId) {
        try {
            // Create initial status history entry to track order creation
            User user = securityUtils.getCurrentUser();
            String changedByName = user != null ? user.getFullName() : "System";

            OrderStatusHistory history = new OrderStatusHistory();
            history.setOrderId(order.getId());
            history.setOrderStatus(order.getOrderStatus());
            history.setChangedByUserId(userId);
            history.setChangedByName(changedByName);  // Snapshot of user's name at time of change
            history.setNote("Order created from checkout");

            orderStatusHistoryRepository.save(history);
            log.debug("✅ [STATUS HISTORY] Created initial status history for order: {} with status: {} by user: {}",
                order.getOrderNumber(), order.getOrderStatus(), changedByName);
        } catch (Exception e) {
            log.warn("⚠️  [STATUS HISTORY] Failed to create initial status history: {}", e.getMessage());
            // Don't throw exception - order creation should not fail if history creation fails
        }
    }

    private String generateOrderNumber() {
        return referenceNumberGenerator.generateOrderNumber();
    }

    @Override
    public POSCheckoutResponse createPOSCheckoutOrder(POSCheckoutRequest request) {
        log.info("🎯 [POS CHECKOUT START] Creating POS order - Business: {}, Items: {}",
            request.getBusinessId(), request.getCart().getItems().size());

        User currentUser = securityUtils.getCurrentUser();
        String createdBy = currentUser != null ? currentUser.getFullName() : "System";

        try {
            // Validate input
            if (request.getCart() == null || request.getCart().getItems() == null || request.getCart().getItems().isEmpty()) {
                throw new ValidationException("Order must contain at least one item");
            }

            log.debug("🔍 [STEP 1/6] Validating delivery option...");
            // Delivery option is passed as full object, not ID
            BigDecimal deliveryPrice = request.getDeliveryOption() != null ?
                request.getDeliveryOption().getPrice() : BigDecimal.ZERO;

            // Create order
            log.debug("📝 [STEP 2/6] Creating order entity...");
            Order order = new Order();
            order.setBusinessId(request.getBusinessId());
            order.setCustomerId(request.getCustomerId());
            order.setOrderNumber(generateOrderNumber());
            order.setOrderStatus(OrderStatus.COMPLETED); // POS orders are always completed
            order.setSource("POS"); // Mark as POS order
            order.setPaymentMethod(PaymentMethod.CASH);
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setDeliveryFee(deliveryPrice);
            order.setCustomerNote(request.getCustomerNote());
            order.setBusinessNote(request.getBusinessNote());

            // Set delivery address as JSON snapshot
            try {
                String deliveryAddressJson = objectMapper.writeValueAsString(request.getDeliveryAddress());
                order.setDeliveryAddressSnapshot(deliveryAddressJson);
            } catch (Exception e) {
                log.warn("Failed to serialize delivery address: {}", e.getMessage());
                order.setDeliveryAddressSnapshot("{}");
            }

            // Set delivery option as JSON snapshot
            try {
                String deliveryOptionJson = objectMapper.writeValueAsString(request.getDeliveryOption());
                order.setDeliveryOptionSnapshot(deliveryOptionJson);
            } catch (Exception e) {
                log.warn("Failed to serialize delivery option: {}", e.getMessage());
                order.setDeliveryOptionSnapshot("{}");
            }

            log.debug("💾 [STEP 3/6] Saving order...");
            Order savedOrder = orderRepository.save(order);

            // Create order items and calculate totals
            log.debug("📦 [STEP 4/6] Creating order items ({} items)...", request.getCart().getItems().size());
            BigDecimal subtotal = BigDecimal.ZERO;
            BigDecimal totalDiscount = BigDecimal.ZERO;

            for (POSCheckoutItemRequest itemRequest : request.getCart().getItems()) {
                Product product = productRepository.findById(itemRequest.getProductId())
                        .orElseThrow(() -> new NotFoundException("Product not found: " + itemRequest.getProductId()));

                OrderItem orderItem = new OrderItem();
                orderItem.setOrderId(savedOrder.getId());
                orderItem.setProductId(product.getId());
                orderItem.setProductSizeId(itemRequest.getProductSizeId());
                orderItem.setProductName(itemRequest.getProductName() != null ? itemRequest.getProductName() : product.getName());
                orderItem.setProductImageUrl(itemRequest.getProductImageUrl() != null ? itemRequest.getProductImageUrl() : product.getMainImageUrl());
                orderItem.setSizeName(itemRequest.getSizeName());
                orderItem.setQuantity(itemRequest.getQuantity());

                // Determine current price
                BigDecimal currentPrice = itemRequest.getOverridePrice() != null ?
                    itemRequest.getOverridePrice() : product.getPrice();
                orderItem.setCurrentPrice(currentPrice);
                orderItem.setUnitPrice(currentPrice);

                // Apply promotion if specified
                BigDecimal finalPrice = currentPrice;
                if (itemRequest.getPromotionType() != null && itemRequest.getPromotionValue() != null) {
                    if ("PERCENTAGE".equals(itemRequest.getPromotionType())) {
                        BigDecimal discountPercent = itemRequest.getPromotionValue().divide(BigDecimal.valueOf(100));
                        finalPrice = currentPrice.multiply(BigDecimal.ONE.subtract(discountPercent));
                    } else if ("FIXED_AMOUNT".equals(itemRequest.getPromotionType())) {
                        finalPrice = currentPrice.subtract(itemRequest.getPromotionValue());
                    }
                    orderItem.setHasPromotion(true);
                }

                orderItem.setFinalPrice(finalPrice);
                orderItem.calculateTotalPrice();

                subtotal = subtotal.add(currentPrice.multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
                totalDiscount = totalDiscount.add(currentPrice.subtract(finalPrice).multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
            }

            // Update order totals
            log.debug("💰 [STEP 5/6] Calculating totals...");
            // Get discount from cart or use calculated item-level discount
            BigDecimal discountAmount = request.getCart().getTotalDiscount() != null ?
                request.getCart().getTotalDiscount() : totalDiscount;
            BigDecimal taxAmount = BigDecimal.ZERO; // Tax not used in POS, reserved for future
            BigDecimal deliveryFee = order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO;

            savedOrder.setSubtotal(subtotal);
            savedOrder.setDiscountAmount(discountAmount);
            savedOrder.setTaxAmount(taxAmount);
            savedOrder.setDeliveryFee(deliveryFee);
            savedOrder.setTotalAmount(subtotal.subtract(discountAmount).add(taxAmount).add(deliveryFee));

            Order updatedOrder = orderRepository.save(savedOrder);

            // Create order payment record
            log.debug("💳 [STEP 5.5/6] Creating payment record...");
            OrderPayment payment = new OrderPayment();
            payment.setOrderId(updatedOrder.getId());
            payment.setBusinessId(request.getBusinessId());
            payment.setPaymentMethod(PaymentMethod.valueOf(request.getPayment().getPaymentMethod()));
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaymentReference(paymentReferenceGenerator.generateUniqueReference());
            payment.setSubtotal(updatedOrder.getSubtotal());
            payment.setDiscountAmount(updatedOrder.getDiscountAmount());
            payment.setDeliveryFee(updatedOrder.getDeliveryFee());
            payment.setTaxAmount(updatedOrder.getTaxAmount());
            payment.setTotalAmount(updatedOrder.getTotalAmount());
            payment.setCustomerPaymentMethod("Cash");
            paymentRepository.save(payment);

            // Create initial status history
            log.debug("📋 [STEP 6/6] Creating status history...");
            createInitialOrderStatusHistory(updatedOrder, currentUser != null ? currentUser.getId() : UUID.randomUUID());

            log.info("✅ [POS ORDER CREATED] Order #{} completed with ID: {} - Total: {}",
                updatedOrder.getOrderNumber(), updatedOrder.getId(), updatedOrder.getTotalAmount());

            // Build response
            return POSCheckoutResponse.builder()
                    .id(updatedOrder.getId())
                    .orderNumber(updatedOrder.getOrderNumber())
                    .subtotal(updatedOrder.getSubtotal())
                    .discountAmount(updatedOrder.getDiscountAmount())
                    .deliveryFee(updatedOrder.getDeliveryFee())
                    .taxAmount(updatedOrder.getTaxAmount())
                    .totalAmount(updatedOrder.getTotalAmount())
                    .orderStatus("COMPLETED")
                    .source("POS")
                    .paymentMethod("CASH")
                    .paymentStatus("PAID")
                    .createdBy(createdBy)
                    .createdAt(updatedOrder.getCreatedAt())
                    .customerName(request.getCustomerName())
                    .customerPhone(request.getCustomerPhone())
                    .build();

        } catch (Exception e) {
            log.error("❌ [POS CHECKOUT ERROR] Failed to create POS order: {}", e.getMessage(), e);
            throw new ValidationException("Failed to create POS order: " + e.getMessage());
        }
    }

    /**
     * Deduct stock via FIFO for each item in the order.
     * Called when order status changes to CONFIRMED.
     */
    private void deductStockForOrder(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) return;

        for (OrderItem item : order.getItems()) {
            try {
                stockService.deductStockFIFO(
                    order.getBusinessId(),
                    item.getProductId(),
                    item.getProductSizeId(),
                    item.getQuantity(),
                    order.getId(),
                    "Order confirmed: " + order.getOrderNumber()
                );
            } catch (Exception e) {
                log.warn("Failed to deduct stock for product {} in order {}: {}",
                    item.getProductId(), order.getOrderNumber(), e.getMessage());
            }
        }

        log.info("Stock deducted via FIFO for confirmed order: {}", order.getOrderNumber());
    }
}

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
import com.emenu.features.order.models.OrderDeliveryAddress;
import com.emenu.features.order.models.OrderDeliveryOption;
import com.emenu.features.order.models.OrderItemPricingSnapshot;
import com.emenu.features.order.repository.OrderPaymentRepository;
import com.emenu.features.order.repository.CartRepository;
import com.emenu.features.order.repository.OrderRepository;
import com.emenu.features.order.repository.OrderStatusHistoryRepository;
import com.emenu.features.order.repository.OrderDeliveryAddressRepository;
import com.emenu.features.order.repository.OrderDeliveryOptionRepository;
import com.emenu.features.order.repository.OrderItemPricingSnapshotRepository;
import com.emenu.features.order.models.OrderStatusHistory;
import com.emenu.features.order.service.OrderService;
import com.emenu.features.stock.service.impl.StockServiceImpl;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.generate.ReferenceNumberGenerator;
import com.emenu.shared.generate.PaymentReferenceGenerator;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final OrderPaymentRepository paymentRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final DeliveryOptionRepository deliveryOptionRepository;
    private final ProductRepository productRepository;
    private final OrderDeliveryAddressRepository orderDeliveryAddressRepository;
    private final OrderDeliveryOptionRepository orderDeliveryOptionRepository;
    private final OrderItemPricingSnapshotRepository orderItemPricingSnapshotRepository;
    private final OrderMapper orderMapper;
    private final OrderPaymentMapper paymentMapper;
    private final SecurityUtils securityUtils;
    private final ReferenceNumberGenerator referenceNumberGenerator;
    private final PaymentReferenceGenerator paymentReferenceGenerator;
    private final PaginationMapper paginationMapper;
    private final StockServiceImpl stockService;

    @Override
    public OrderResponse createOrderFromCart(OrderCreateRequest request) {
            request.getBusinessId(), securityUtils.getCurrentUser().getId());

        User currentUser = securityUtils.getCurrentUser();

        try {
            Order order = createBaseOrder(request, currentUser.getId());

            // Set order status - default to PENDING if not specified
            OrderStatus status = request.getOrderStatus() != null ? request.getOrderStatus() : OrderStatus.PENDING;
            order.setOrderStatus(status);

            Order savedOrder = orderRepository.save(order);

            // Create delivery snapshots from request
            if (request.getDeliveryAddress() != null) {
                OrderDeliveryAddress deliveryAddress = new OrderDeliveryAddress();
                deliveryAddress.setOrderId(savedOrder.getId());
                deliveryAddress.setVillage(request.getDeliveryAddress().getVillage());
                deliveryAddress.setCommune(request.getDeliveryAddress().getCommune());
                deliveryAddress.setDistrict(request.getDeliveryAddress().getDistrict());
                deliveryAddress.setProvince(request.getDeliveryAddress().getProvince());
                deliveryAddress.setStreetNumber(request.getDeliveryAddress().getStreetNumber());
                deliveryAddress.setHouseNumber(request.getDeliveryAddress().getHouseNumber());
                deliveryAddress.setNote(request.getDeliveryAddress().getNote());
                deliveryAddress.setLatitude(request.getDeliveryAddress().getLatitude());
                deliveryAddress.setLongitude(request.getDeliveryAddress().getLongitude());
                orderDeliveryAddressRepository.save(deliveryAddress);
            }

            if (request.getDeliveryOption() != null) {
                OrderDeliveryOption deliveryOption = new OrderDeliveryOption();
                deliveryOption.setOrderId(savedOrder.getId());
                deliveryOption.setName(request.getDeliveryOption().getName());
                deliveryOption.setDescription(request.getDeliveryOption().getDescription());
                deliveryOption.setImageUrl(request.getDeliveryOption().getImageUrl());
                deliveryOption.setPrice(request.getDeliveryOption().getPrice());
                orderDeliveryOptionRepository.save(deliveryOption);

                // Update delivery fee in order
                savedOrder.setDeliveryFee(request.getDeliveryOption().getPrice());
            }

            // Create initial order status history to track when order was created
            createInitialOrderStatusHistory(savedOrder, currentUser.getId());

            // Create order items from cart summary (frontend) or database cart
            if (request.getCart() != null && request.getCart().getItems() != null && !request.getCart().getItems().isEmpty()) {
                // Only POSCheckoutRequest has pricing info, OrderCreateRequest doesn't
                createOrderItemsFromCartSummary(savedOrder.getId(), request.getCart(), null);
            } else {
                Cart cart = cartRepository.findByUserIdAndBusinessIdWithItems(currentUser.getId(), request.getBusinessId())
                        .orElseThrow(() -> new ValidationException("Cart is empty or not found"));

                if (cart.getItems() == null || cart.getItems().isEmpty()) {
                    throw new ValidationException("Cannot create order from empty cart");
                }

                createOrderItemsFromCart(savedOrder.getId(), cart);
            }

            createPaymentRecord(savedOrder);

            clearCartAfterOrder(currentUser.getId(), request.getBusinessId());

            OrderResponse response = getOrderById(savedOrder.getId());
                response.getOrderNumber(),
                response.getPricing() != null && response.getPricing().getAfter() != null ?
                    response.getPricing().getAfter().getFinalTotal() : "N/A",
                response.getItems().size());
            return response;
        } catch (Exception e) {
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<OrderResponse> getCustomerOrderHistory(OrderFilterRequest filter) {
        long startTime = System.currentTimeMillis();
        User currentUser = securityUtils.getCurrentUser();
        filter.setBusinessId(null);  // Clear any business filter for customer orders

                currentUser.getId(), filter.getPageNo(), filter.getPageSize());

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<Order> page = orderRepository.findByCustomerIdAndIsDeletedFalseOrderByCreatedAtDesc(currentUser.getId(), pageable);

        // Eagerly load statusHistory for all orders to prevent lazy loading during mapping
        page.getContent().forEach(order -> {
            List<OrderStatusHistory> statusHistory = orderRepository.findStatusHistoryByOrderId(order.getId());
            order.setStatusHistory(statusHistory);
        });

        PaginationResponse<OrderResponse> response = orderMapper.toPaginationResponse(page, paginationMapper);

        long duration = System.currentTimeMillis() - startTime;
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

                currentUser.getId());

        // If user is a business user and no businessId filter is provided, restrict to their business
        if (currentUser.isBusinessUser() && filter.getBusinessId() == null) {
            filter.setBusinessId(currentUser.getBusinessId());
        }

                filter.getBusinessId(), filter.getOrderStatus(), filter.getPaymentMethod(), filter.getPaymentStatus());

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection());

        // Apply filters: businessId, orderStatus, paymentMethod, paymentStatus
        long queryStartTime = System.currentTimeMillis();
        Page<Order> page = orderRepository.findAllWithFilters(
                filter.getBusinessId(),
                filter.getOrderStatus(),
                filter.getPaymentMethod(),
                filter.getPaymentStatus(),
                pageable
        );
        long queryDuration = System.currentTimeMillis() - queryStartTime;
                page.getNumberOfElements(), queryDuration, page.getTotalElements(), page.getTotalPages());

        // Eagerly load statusHistory for all orders to prevent lazy loading during mapping
        int historyCount = 0;
        for (Order order : page.getContent()) {
            List<OrderStatusHistory> statusHistory = orderRepository.findStatusHistoryByOrderId(order.getId());
            order.setStatusHistory(statusHistory);
            historyCount += statusHistory.size();
        }

        long mappingStartTime = System.currentTimeMillis();
        PaginationResponse<OrderResponse> response = orderMapper.toPaginationResponse(page, paginationMapper);
        long mappingDuration = System.currentTimeMillis() - mappingStartTime;

        long totalDuration = System.currentTimeMillis() - startTime;
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

        // Update delivery address snapshot if provided
        if (request.getDeliveryAddress() != null) {
            OrderDeliveryAddress deliveryAddress = orderDeliveryAddressRepository.findByOrderId(orderId)
                    .orElse(new OrderDeliveryAddress());
            deliveryAddress.setOrderId(orderId);
            deliveryAddress.setVillage(request.getDeliveryAddress().getVillage());
            deliveryAddress.setCommune(request.getDeliveryAddress().getCommune());
            deliveryAddress.setDistrict(request.getDeliveryAddress().getDistrict());
            deliveryAddress.setProvince(request.getDeliveryAddress().getProvince());
            deliveryAddress.setStreetNumber(request.getDeliveryAddress().getStreetNumber());
            deliveryAddress.setHouseNumber(request.getDeliveryAddress().getHouseNumber());
            deliveryAddress.setNote(request.getDeliveryAddress().getNote());
            deliveryAddress.setLatitude(request.getDeliveryAddress().getLatitude());
            deliveryAddress.setLongitude(request.getDeliveryAddress().getLongitude());
            orderDeliveryAddressRepository.save(deliveryAddress);
        }

        // Update delivery option snapshot if provided
        if (request.getDeliveryOption() != null) {
            OrderDeliveryOption deliveryOption = orderDeliveryOptionRepository.findByOrderId(orderId)
                    .orElse(new OrderDeliveryOption());
            deliveryOption.setOrderId(orderId);
            deliveryOption.setName(request.getDeliveryOption().getName());
            deliveryOption.setDescription(request.getDeliveryOption().getDescription());
            deliveryOption.setImageUrl(request.getDeliveryOption().getImageUrl());
            deliveryOption.setPrice(request.getDeliveryOption().getPrice());
            orderDeliveryOptionRepository.save(deliveryOption);

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
            return;
        }

        com.emenu.features.order.dto.response.CartSummaryResponse cartResponse =
                (com.emenu.features.order.dto.response.CartSummaryResponse) cartSummary;


        BigDecimal subtotal = cartResponse.getSubtotal() != null ? cartResponse.getSubtotal() : BigDecimal.ZERO;
        BigDecimal discountAmount = cartResponse.getTotalDiscount() != null ? cartResponse.getTotalDiscount() : BigDecimal.ZERO;


        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    return new NotFoundException("Order not found: " + orderId);
                });


        int itemCount = 0;
        for (var item : cartResponse.getItems()) {
            itemCount++;

            // Use after snapshot for final pricing if available (new audit trail structure)
            BigDecimal finalPrice = item.getAfter() != null ? item.getAfter().getFinalPrice() : item.getFinalPrice();

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

            orderItem.setOrder(order);
            order.getItems().add(orderItem);

            // Save the order item first to get its ID for creating the pricing snapshot
            orderRepository.save(order);

            // Create pricing snapshot with before/after snapshots
            OrderItemPricingSnapshot snapshot = new OrderItemPricingSnapshot();
            snapshot.setOrderItemId(orderItem.getId());

            // Store before snapshot fields
            if (item.getBefore() != null) {
                snapshot.setBeforeCurrentPrice(item.getBefore().getCurrentPrice());
                snapshot.setBeforeFinalPrice(item.getBefore().getFinalPrice());
                snapshot.setBeforeHasActivePromotion(item.getBefore().getHasActivePromotion());
                snapshot.setBeforeDiscountAmount(item.getBefore().getDiscountAmount());
                snapshot.setBeforeTotalPrice(item.getBefore().getTotalPrice());
                snapshot.setBeforePromotionType(item.getBefore().getPromotionType());
                snapshot.setBeforePromotionValue(item.getBefore().getPromotionValue());
                snapshot.setBeforePromotionFromDate(item.getBefore().getPromotionFromDate());
                snapshot.setBeforePromotionToDate(item.getBefore().getPromotionToDate());
            }

            // Store after snapshot fields
            if (item.getAfter() != null && item.getHadChangeFromPOS() != null && item.getHadChangeFromPOS()) {
                snapshot.setAfterCurrentPrice(item.getAfter().getCurrentPrice());
                snapshot.setAfterFinalPrice(item.getAfter().getFinalPrice());
                snapshot.setAfterHasActivePromotion(item.getAfter().getHasActivePromotion());
                snapshot.setAfterDiscountAmount(item.getAfter().getDiscountAmount());
                snapshot.setAfterTotalPrice(item.getAfter().getTotalPrice());
                snapshot.setAfterPromotionType(item.getAfter().getPromotionType());
                snapshot.setAfterPromotionValue(item.getAfter().getPromotionValue());
                snapshot.setAfterPromotionFromDate(item.getAfter().getPromotionFromDate());
                snapshot.setAfterPromotionToDate(item.getAfter().getPromotionToDate());
            }

            orderItemPricingSnapshotRepository.save(snapshot);
        }

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);

        BigDecimal deliveryFee = order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO;
        BigDecimal taxAmount = order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.subtract(discountAmount).add(deliveryFee).add(taxAmount);
        order.setTotalAmount(totalAmount);

        // Store order-level pricing audit trail if provided
        if (pricingInfo != null) {
            // Always set hadOrderLevelChangeFromPOS (true/false, never null)
            order.setHadOrderLevelChangeFromPOS(pricingInfo.getHadOrderLevelChangeFromPOS() != null && pricingInfo.getHadOrderLevelChangeFromPOS());

            // Store the reason for order-level changes
            if (pricingInfo.getOrderLevelChangeReason() != null && !pricingInfo.getOrderLevelChangeReason().isEmpty()) {
                order.setOrderLevelChangeReason(pricingInfo.getOrderLevelChangeReason());
            } else if (!order.getHadOrderLevelChangeFromPOS()) {
                // Set default reason if no change occurred
                order.setOrderLevelChangeReason("No order-level changes from POS");
            }
            // Note: Pricing snapshots are reconstructed from order fields (subtotal, discount, delivery, tax, total) when needed
        }

            orderId, order.getItems().size(), totalAmount, subtotal, discountAmount, deliveryFee, taxAmount);

        orderRepository.save(order);
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
                order.getOrderNumber(), order.getOrderStatus(), changedByName);
        } catch (Exception e) {
            // Don't throw exception - order creation should not fail if history creation fails
        }
    }

    private String generateOrderNumber() {
        return referenceNumberGenerator.generateOrderNumber();
    }

    @Override
    public POSCheckoutResponse createPOSCheckoutOrder(POSCheckoutRequest request) {
            request.getBusinessId(), request.getCart().getItems().size());

        User currentUser = securityUtils.getCurrentUser();
        String createdBy = currentUser != null ? currentUser.getFullName() : "System";

        try {
            // Validate input
            if (request.getCart() == null || request.getCart().getItems() == null || request.getCart().getItems().isEmpty()) {
                throw new ValidationException("Order must contain at least one item");
            }

            // Delivery option is passed as full object, not ID
            BigDecimal deliveryPrice = request.getDeliveryOption() != null ?
                request.getDeliveryOption().getPrice() : BigDecimal.ZERO;

            // Create order
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


            Order savedOrder = orderRepository.save(order);

            // Create delivery address snapshot
            if (request.getDeliveryAddress() != null) {
                OrderDeliveryAddress deliveryAddress = new OrderDeliveryAddress();
                deliveryAddress.setOrderId(savedOrder.getId());
                deliveryAddress.setVillage(request.getDeliveryAddress().getVillage());
                deliveryAddress.setCommune(request.getDeliveryAddress().getCommune());
                deliveryAddress.setDistrict(request.getDeliveryAddress().getDistrict());
                deliveryAddress.setProvince(request.getDeliveryAddress().getProvince());
                deliveryAddress.setStreetNumber(request.getDeliveryAddress().getStreetNumber());
                deliveryAddress.setHouseNumber(request.getDeliveryAddress().getHouseNumber());
                deliveryAddress.setNote(request.getDeliveryAddress().getNote());
                deliveryAddress.setLatitude(request.getDeliveryAddress().getLatitude());
                deliveryAddress.setLongitude(request.getDeliveryAddress().getLongitude());
                orderDeliveryAddressRepository.save(deliveryAddress);
            }

            // Create delivery option snapshot
            if (request.getDeliveryOption() != null) {
                OrderDeliveryOption deliveryOption = new OrderDeliveryOption();
                deliveryOption.setOrderId(savedOrder.getId());
                deliveryOption.setName(request.getDeliveryOption().getName());
                deliveryOption.setDescription(request.getDeliveryOption().getDescription());
                deliveryOption.setImageUrl(request.getDeliveryOption().getImageUrl());
                deliveryOption.setPrice(request.getDeliveryOption().getPrice());
                orderDeliveryOptionRepository.save(deliveryOption);
            }

            // Create order items and calculate totals
            BigDecimal subtotal = BigDecimal.ZERO;
            BigDecimal totalDiscount = BigDecimal.ZERO;
            List<OrderItem> createdItems = new java.util.ArrayList<>();

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
                orderItem.setHadChangeFromPOS(false); // No POS changes in regular POS checkout

                // Determine current price
                BigDecimal currentPrice = itemRequest.getOverridePrice() != null ?
                    itemRequest.getOverridePrice() : product.getPrice();
                orderItem.setCurrentPrice(currentPrice);
                orderItem.setUnitPrice(currentPrice);

                // Apply promotion if specified
                BigDecimal finalPrice = currentPrice;
                Boolean hasPromotion = false;
                String promotionType = null;
                BigDecimal promotionValue = null;
                LocalDateTime promotionFromDate = null;
                LocalDateTime promotionToDate = null;

                if (itemRequest.getPromotionType() != null && itemRequest.getPromotionValue() != null) {
                    if ("PERCENTAGE".equals(itemRequest.getPromotionType())) {
                        BigDecimal discountPercent = itemRequest.getPromotionValue().divide(BigDecimal.valueOf(100));
                        finalPrice = currentPrice.multiply(BigDecimal.ONE.subtract(discountPercent));
                    } else if ("FIXED_AMOUNT".equals(itemRequest.getPromotionType())) {
                        finalPrice = currentPrice.subtract(itemRequest.getPromotionValue());
                    }
                    hasPromotion = true;
                    promotionType = itemRequest.getPromotionType();
                    promotionValue = itemRequest.getPromotionValue();
                    // Promotion dates not available in POSCheckoutItemRequest
                    promotionFromDate = null;
                    promotionToDate = null;
                }

                orderItem.setHasPromotion(hasPromotion);
                orderItem.setPromotionType(promotionType);
                orderItem.setPromotionValue(promotionValue);
                orderItem.setPromotionFromDate(promotionFromDate);
                orderItem.setPromotionToDate(promotionToDate);
                orderItem.setFinalPrice(finalPrice);
                orderItem.calculateTotalPrice();

                savedOrder.getItems().add(orderItem);
                createdItems.add(orderItem);

                subtotal = subtotal.add(currentPrice.multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
                totalDiscount = totalDiscount.add(currentPrice.subtract(finalPrice).multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
            }

            // Save order with items
            orderRepository.save(savedOrder);

            // Create pricing snapshots for each item
            for (OrderItem item : createdItems) {
                OrderItemPricingSnapshot snapshot = new OrderItemPricingSnapshot();
                snapshot.setOrderItemId(item.getId());
                // Store current pricing as before snapshot (no previous state in POS)
                snapshot.setBeforeCurrentPrice(item.getCurrentPrice());
                snapshot.setBeforeFinalPrice(item.getFinalPrice());
                snapshot.setBeforeHasActivePromotion(item.getHasPromotion());
                snapshot.setBeforePromotionType(item.getPromotionType());
                snapshot.setBeforePromotionValue(item.getPromotionValue());
                snapshot.setBeforePromotionFromDate(item.getPromotionFromDate());
                snapshot.setBeforePromotionToDate(item.getPromotionToDate());

                BigDecimal discountAmount = item.getCurrentPrice().subtract(item.getFinalPrice()).multiply(BigDecimal.valueOf(item.getQuantity()));
                snapshot.setBeforeDiscountAmount(discountAmount);
                snapshot.setBeforeTotalPrice(item.getTotalPrice());

                orderItemPricingSnapshotRepository.save(snapshot);
            }

            // Update order totals
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
            createInitialOrderStatusHistory(updatedOrder, currentUser != null ? currentUser.getId() : UUID.randomUUID());

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
                    item.getProductId(), order.getOrderNumber(), e.getMessage());
            }
        }

    }
}

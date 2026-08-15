package com.emenu.features.order.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import com.emenu.enums.order.OrderStatus;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.exception.custom.NotFoundException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.enums.common.StockStatus;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.models.BusinessSetting;
import com.emenu.features.auth.models.User;
import com.emenu.features.notification.telegram.util.PdfReceiptGenerator;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.auth.repository.BusinessSettingRepository;
import com.emenu.features.order.dto.filter.OrderFilterRequest;
import com.emenu.features.order.dto.helper.OrderPaymentCreateHelper;
import com.emenu.features.order.dto.helper.OrderCreateHelper;
import com.emenu.features.order.dto.helper.OrderItemCreateHelper;
import com.emenu.features.order.dto.request.OrderCreateRequest;
import com.emenu.features.order.dto.request.POSCheckoutRequest;
import com.emenu.features.order.dto.request.POSCheckoutItemRequest;
import com.emenu.features.order.dto.request.CartSummaryRequest;
import com.emenu.features.order.dto.request.CartItemRequest;
import com.emenu.features.order.dto.response.OrderResponse;
import com.emenu.features.order.dto.response.POSCheckoutResponse;
import com.emenu.features.order.dto.response.CartSummaryResponse;
import com.emenu.features.order.dto.update.OrderUpdateRequest;
import com.emenu.features.location.models.Location;
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
import com.emenu.features.order.models.OrderItemCustomization;
import com.emenu.features.order.models.OrderDeliveryAddress;
import com.emenu.features.order.models.OrderDeliveryOption;
import com.emenu.features.order.repository.OrderPaymentRepository;
import com.emenu.features.order.repository.CartRepository;
import com.emenu.features.order.repository.OrderRepository;
import com.emenu.features.order.repository.OrderItemCustomizationRepository;
import com.emenu.features.order.specification.OrderSpecification;
import com.emenu.features.order.repository.OrderStatusHistoryRepository;
import com.emenu.features.order.repository.OrderDeliveryAddressRepository;
import com.emenu.features.order.repository.OrderDeliveryOptionRepository;
import com.emenu.features.order.models.OrderStatusHistory;
import com.emenu.features.location.repository.LocationRepository;
import com.emenu.features.stock.repository.ProductStockRepository;
import com.emenu.features.notification.telegram.service.TelegramNotificationService;
import com.emenu.features.notification.websocket.service.WebSocketNotificationService;
import com.emenu.features.order.service.OrderService;
import com.emenu.features.stock.service.impl.StockServiceImpl;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ImageUrls;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.generate.ReferenceNumberGenerator;
import com.emenu.shared.generate.OrderNumberGenerator;
import com.emenu.shared.generate.PaymentReferenceGenerator;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

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
    private final ProductStockRepository productStockRepository;
    private final LocationRepository locationRepository;
    private final OrderDeliveryAddressRepository orderDeliveryAddressRepository;
    private final OrderDeliveryOptionRepository orderDeliveryOptionRepository;
    private final OrderItemCustomizationRepository orderItemCustomizationRepository;
    private final OrderMapper orderMapper;
    private final OrderPaymentMapper paymentMapper;
    private final SecurityUtils securityUtils;
    private final ReferenceNumberGenerator referenceNumberGenerator;
    private final OrderNumberGenerator orderNumberGenerator;
    private final PaymentReferenceGenerator paymentReferenceGenerator;
    private final PaginationMapper paginationMapper;
    private final StockServiceImpl stockService;
    private final ObjectMapper objectMapper;
    private final EntityManager entityManager;
    private final BusinessSettingRepository businessSettingRepository;
    private final BusinessRepository businessRepository;
    private final TelegramNotificationService telegramNotificationService;
    private final WebSocketNotificationService webSocketNotificationService;

    @Override
    public OrderResponse createOrderFromCart(OrderCreateRequest request) {
        log.info("Starting order creation from cart for business: {}", request.getBusinessId());

        Optional<User> currentUserOpt = securityUtils.getCurrentUserOptional();
        UUID customerId = currentUserOpt.map(User::getId).orElse(null);
        String actorName = currentUserOpt.map(User::getFullName).orElse(
                request.getCustomerName() != null && !request.getCustomerName().isBlank()
                        ? request.getCustomerName()
                        : "Guest Customer"
        );

        try {
            Order order = createBaseOrder(request, customerId);

            // Set order status - default to PENDING if not specified
            OrderStatus status = request.getOrderStatus() != null ? request.getOrderStatus() : OrderStatus.PENDING;
            order.setOrderStatus(status);

            Order savedOrder = orderRepository.save(order);
            log.info("Saved new order #{} with ID: {}", savedOrder.getOrderNumber(), savedOrder.getId());

            // Create delivery address snapshot from addressId OR guestAddress
            OrderDeliveryAddress deliveryAddress = null;
            if (request.getAddressId() != null) {
                deliveryAddress = createDeliveryAddressSnapshot(savedOrder.getId(), request.getAddressId());
            } else if (request.getGuestAddress() != null) {
                deliveryAddress = createGuestDeliveryAddressSnapshot(savedOrder.getId(), request.getGuestAddress());
            }
            if (deliveryAddress != null) {
                orderDeliveryAddressRepository.save(deliveryAddress);
            }

            // Set customer details
            String finalCustomerName = request.getCustomerName() != null && !request.getCustomerName().isBlank()
                    ? request.getCustomerName()
                    : currentUserOpt.map(User::getFullName).orElse("Guest Customer");
            savedOrder.setCustomerName(finalCustomerName);

            if (request.getCustomerPhone() != null) {
                savedOrder.setCustomerPhone(request.getCustomerPhone());
            } else if (currentUserOpt.isPresent() && currentUserOpt.get().getPhoneNumber() != null) {
                savedOrder.setCustomerPhone(currentUserOpt.get().getPhoneNumber());
            }

            if (request.getCustomerEmail() != null) {
                savedOrder.setCustomerEmail(request.getCustomerEmail());
            } else if (currentUserOpt.isPresent() && currentUserOpt.get().getEmail() != null) {
                savedOrder.setCustomerEmail(currentUserOpt.get().getEmail());
            }
            // Save customer details
            orderRepository.save(savedOrder);

            // Create delivery option snapshot
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
            createInitialOrderStatusHistory(savedOrder, customerId, actorName);

            // Create order items from cart summary with customizations
            if (request.getCart() != null && request.getCart().getItems() != null && !request.getCart().getItems().isEmpty()) {
                createOrderItemsFromCartSummaryWithCustomizations(savedOrder.getId(), request.getCart());
            } else {
                throw new ValidationException("Cart is empty or not found");
            }

            // Apply pricing information if provided
            if (request.getPricing() != null) {
                applyPricingToOrder(savedOrder, request.getPricing());
            }

            createPaymentRecord(savedOrder);

            if (customerId != null) {
                clearCartAfterOrder(customerId, request.getBusinessId());
            }

            log.info("Order created successfully: {} - Fetching full response details...", savedOrder.getOrderNumber());
            OrderResponse response = getOrderById(savedOrder.getId());
            log.info("Completed order checkout for #{} - Total: {}, Items: {}",
                response.getOrderNumber(),
                response.getPricing() != null ? response.getPricing().getFinalTotal() : "N/A",
                response.getItems().size());

            try {
                Order orderForNotification = orderRepository.findByIdWithDetails(savedOrder.getId()).orElse(savedOrder);
                telegramNotificationService.notifyNewCustomerOrder(orderForNotification);
                webSocketNotificationService.notifyNewOrder(orderForNotification);
            } catch (Exception e) {
                log.warn("Failed to send Telegram notification for new order: {}", e.getMessage());
            }

            return response;        } catch (Exception e) {
            log.error("Failed to create order during checkout: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<OrderResponse> getCustomerOrderHistory(OrderFilterRequest filter) {
        User currentUser = securityUtils.getCurrentUser();
        filter.setBusinessId(null);  // Clear any business filter for customer orders

        log.info("Fetching order history for customer: {} | Page: {}, Size: {}",
                currentUser.getId(), filter.getPageNo(), filter.getPageSize());

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Specification<Order> spec = OrderSpecification.active()
                .and(OrderSpecification.forCustomer(currentUser.getId()))
                .and(OrderSpecification.byStatus(filter.getOrderStatus()))
                .and(OrderSpecification.byPaymentStatus(filter.getPaymentStatus()))
                .and(OrderSpecification.searchByOrderNumber(filter.getSearch()));

        Page<Order> page = orderRepository.findAll(spec, pageable);

        // Batch-fetch status histories in one query (avoids N+1)
        batchLoadStatusHistories(page.getContent());

        PaginationResponse<OrderResponse> response = paginationMapper.toPaginationResponse(page, orderMapper.toResponseList(page.getContent()));

        log.info("Successfully retrieved {} order history records | Total: {} | Page: {}/{}",
                page.getNumberOfElements(), page.getTotalElements(),
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
        User currentUser = securityUtils.getCurrentUser();

        log.info("Starting orders retrieval for user: {}",
                currentUser.getId());

        // If user is a business user and no businessId filter is provided, restrict to their business
        if (currentUser.isBusinessUser() && filter.getBusinessId() == null) {
            filter.setBusinessId(currentUser.getBusinessId());
        }

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        // Apply filters: businessId, orderStatus, paymentStatus, date range, search by order number
        LocalDateTime startDate = null;
        if (filter.getStartDate() != null && !filter.getStartDate().isBlank()) {
            try {
                startDate = LocalDateTime.parse(filter.getStartDate());
            } catch (Exception e) {
                log.warn("Invalid start date format: {}", filter.getStartDate());
            }
        }

        LocalDateTime endDate = null;
        if (filter.getEndDate() != null && !filter.getEndDate().isBlank()) {
            try {
                endDate = LocalDateTime.parse(filter.getEndDate());
            } catch (Exception e) {
                log.warn("Invalid end date format: {}", filter.getEndDate());
            }
        }

        Specification<Order> spec = OrderSpecification.buildFilter(
                filter.getBusinessId(),
                filter.getOrderStatus(),
                filter.getPaymentStatus(),
                startDate,
                endDate,
                filter.getSearch());

        Page<Order> page = orderRepository.findAll(spec, pageable);
        log.info("Retrieved {} orders from database | Total: {} | Pages: {}",
                page.getNumberOfElements(), page.getTotalElements(), page.getTotalPages());

        // Batch-fetch status histories in one query (avoids N+1)
        batchLoadStatusHistories(page.getContent());

        PaginationResponse<OrderResponse> response = paginationMapper.toPaginationResponse(page, orderMapper.toResponseList(page.getContent()));

        log.info("Completed orders retrieval | Orders: {} | Total records: {} | Pages: {}/{}",
                page.getNumberOfElements(), page.getTotalElements(),
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

        OrderStatus previousStatus = order.getOrderStatus();

        if (request.getOrderStatus() != null) {
            order.updateStatus(request.getOrderStatus());

            // Deduct stock via FIFO ONLY when order transitions to CONFIRMED or COMPLETED from PENDING
            if ((request.getOrderStatus() == OrderStatus.CONFIRMED || request.getOrderStatus() == OrderStatus.COMPLETED)
                    && previousStatus == OrderStatus.PENDING) {
                deductStockForOrder(order);
            }
        }

        // Update delivery address snapshot if provided
        if (request.getDeliveryAddress() != null) {
            OrderDeliveryAddress deliveryAddress = orderDeliveryAddressRepository.findByOrderId(orderId)
                    .orElseGet(() -> {
                        OrderDeliveryAddress address = new OrderDeliveryAddress();
                        address.setOrderId(orderId);
                        return address;
                    });
            orderMapper.updateDeliveryAddress(request.getDeliveryAddress(), deliveryAddress);
            orderDeliveryAddressRepository.save(deliveryAddress);
        }

        // Update delivery option snapshot if provided
        if (request.getDeliveryOption() != null) {
            OrderDeliveryOption deliveryOption = orderDeliveryOptionRepository.findByOrderId(orderId)
                    .orElseGet(() -> {
                        OrderDeliveryOption option = new OrderDeliveryOption();
                        option.setOrderId(orderId);
                        return option;
                    });
            orderMapper.updateDeliveryOption(request.getDeliveryOption(), deliveryOption);
            orderDeliveryOptionRepository.save(deliveryOption);

            order.setDeliveryFee(request.getDeliveryOption().getPrice());
            order.setTotalAmount(order.getSubtotal().add(request.getDeliveryOption().getPrice()));
        }

        // Update payment details
        if (request.getPayment() != null) {
            if (request.getPayment().getPaymentMethod() != null) {
                try {
                    order.setPaymentMethod(PaymentMethod.valueOf(request.getPayment().getPaymentMethod()));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid payment method value: {}", request.getPayment().getPaymentMethod());
                }
            }
            if (request.getPayment().getPaymentStatus() != null) {
                try {
                    order.setPaymentStatus(PaymentStatus.valueOf(request.getPayment().getPaymentStatus()));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid payment status value: {}", request.getPayment().getPaymentStatus());
                }
            }
        }

        if (request.getBusinessNote() != null) {
            order.setBusinessNote(request.getBusinessNote());
        }

        // Update order items if provided
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            log.info("Updating items for order ID: {} | New items count: {}", orderId, request.getItems().size());
            order.getItems().clear();

            for (var itemRequest : request.getItems()) {
                OrderItem item = orderMapper.toOrderItem(itemRequest);
                item.setOrderId(orderId);
                item.setOrder(order);

                // Set SKU and barcode fallback from product master data
                Product product = productRepository.findById(itemRequest.getProductId()).orElse(null);
                if (item.getSku() == null && product != null) item.setSku(product.getSku());
                if (item.getBarcode() == null && product != null) item.setBarcode(product.getBarcode());

                // Set UnitPrice and TotalPrice snapshots
                item.setUnitPrice(itemRequest.getFinalPrice());
                item.setTotalPrice(itemRequest.getFinalPrice().multiply(new BigDecimal(itemRequest.getQuantity())));

                order.getItems().add(item);
            }

            BigDecimal newSubtotal = order.getItems().stream()
                    .map(OrderItem::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            order.setSubtotal(newSubtotal);
        }

        // Pricing information updates
        if (request.getPricing() != null) {
            if (request.getPricing().getDiscountAmount() != null) {
                order.setDiscountAmount(request.getPricing().getDiscountAmount());
            }
            if (request.getPricing().getFinalTotal() != null) {
                order.setTotalAmount(request.getPricing().getFinalTotal());
            }
            if (request.getPricing().getDeliveryFee() != null && request.getDeliveryOption() == null) {
                order.setDeliveryFee(request.getPricing().getDeliveryFee());
            }
        }

        // Recalculate totals
        if (request.getItems() != null || request.getPricing() != null) {
            BigDecimal subtotal = order.getSubtotal() != null ? order.getSubtotal() : BigDecimal.ZERO;
            BigDecimal discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
            BigDecimal delivery = order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO;
            BigDecimal tax = order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO;
            order.setTotalAmount(subtotal.subtract(discount).add(delivery).add(tax));
        }

        // Create and save status history if status changed
        if (request.getOrderStatus() != null && request.getOrderStatus() != previousStatus) {
            try {
                OrderStatusHistory history = new OrderStatusHistory();
                history.setOrderId(order.getId());
                history.setOrderStatus(request.getOrderStatus());
                history.setChangedByUserId(currentUser != null ? currentUser.getId() : null);
                history.setChangedByName(currentUser != null ? currentUser.getFullName() : "System");
                
                String noteToSave = request.getBusinessNote();
                if (noteToSave != null && !noteToSave.trim().isEmpty()) {
                    String[] parts = noteToSave.split("\\|");
                    List<String> uniqueParts = new ArrayList<>();
                    for (String p : parts) {
                        String t = p.trim();
                        if (!t.isEmpty() && !uniqueParts.contains(t)) {
                            uniqueParts.add(t);
                        }
                    }
                    noteToSave = String.join(" | ", uniqueParts);
                } else {
                    noteToSave = "Order status updated";
                }
                history.setNote(noteToSave);
                history.setOrder(order);
                history.setPaymentMethod(order.getPaymentMethod());
                history.setPaymentStatus(order.getPaymentStatus());
                OrderStatusHistory savedHistory = orderStatusHistoryRepository.save(history);
                order.getStatusHistory().add(savedHistory);
            } catch (Exception e) {
                log.warn("Failed to save status history snapshot during update: {}", e.getMessage());
            }
        }

        Order updatedOrder = orderRepository.save(order);

        log.info("Order updated: {}", orderId);

        if (request.getOrderStatus() != null && updatedOrder.getOrderStatus() != previousStatus) {
            try {
                Order orderForNotification = orderRepository.findByIdWithDetails(updatedOrder.getId()).orElse(updatedOrder);
                telegramNotificationService.notifyOrderStatusChanged(orderForNotification);
                webSocketNotificationService.notifyOrderStatusChanged(orderForNotification);
            } catch (Exception e) {
                log.warn("Failed to send notification for order status change: {}", e.getMessage());
            }
        }

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
        // Generate order number with per-business counter (ORD-YYYYMMDD-XXXXX)
        String orderNumber = orderNumberGenerator.generateOrderNumber(request.getBusinessId());
        OrderCreateHelper helper = orderMapper.buildOrderHelper(request, customerId, orderNumber);
        Order order = orderMapper.createFromHelper(helper);
        // Set orderFrom to distinguish between CUSTOMER (checkout) and BUSINESS (POS) orders
        if (request.getOrderFrom() != null) {
            order.setOrderFrom(request.getOrderFrom());
        }
        return order;
    }

    private void createOrderItemsFromCart(UUID orderId, Cart cart) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal discountAmount = BigDecimal.ZERO;

        for (var cartItem : cart.getItems()) {
            // Get product for SKU/barcode
            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new NotFoundException("Product not found: " + cartItem.getProductId()));

            OrderItemCreateHelper helper = orderMapper.buildOrderItemHelperFromCartItem(cartItem, orderId);

            // Set SKU and barcode from product master data (primary source)
            helper.setSku(product.getSku());
            helper.setBarcode(product.getBarcode());

            OrderItem orderItem = orderMapper.createOrderItemFromHelper(helper);
            orderItem.calculateTotalPrice();

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
        if (!(cartSummary instanceof CartSummaryResponse)) {
            log.warn("Invalid cart summary type: {}", cartSummary.getClass().getName());
            return;
        }

        CartSummaryResponse cartResponse = (CartSummaryResponse) cartSummary;

        BigDecimal subtotal = cartResponse.getSubtotal() != null ? cartResponse.getSubtotal() : BigDecimal.ZERO;
        BigDecimal discountAmount = cartResponse.getTotalDiscount() != null ? cartResponse.getTotalDiscount() : BigDecimal.ZERO;

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    log.error("Order not found with ID: {}", orderId);
                    return new NotFoundException("Order not found: " + orderId);
                });

        int itemCount = 0;
        for (var item : cartResponse.getItems()) {
            itemCount++;

            // Get product for SKU/barcode
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new NotFoundException("Product not found: " + item.getProductId()));

            BigDecimal finalPrice = item.getFinalPrice();

            OrderItemCreateHelper helper = OrderItemCreateHelper.builder()
                    .orderId(orderId)
                    .productId(item.getProductId())
                    .productSizeId(item.getProductSizeId())
                    .productName(item.getProductName())
                    .productImageUrl(item.getProductImageUrl())
                    .sizeName(item.getSizeName())
                    .finalPrice(finalPrice)
                    .unitPrice(finalPrice)
                    .quantity(item.getQuantity())
                    .sku(product.getSku())
                    .barcode(product.getBarcode())
                    .build();

            OrderItem orderItem = orderMapper.createOrderItemFromHelper(helper);
            orderItem.setTotalPrice(item.getTotalPrice() != null ? item.getTotalPrice() :
                    finalPrice.multiply(new BigDecimal(item.getQuantity())));

            orderItem.setOrder(order);
            order.getItems().add(orderItem);
        }

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);

        BigDecimal deliveryFee = order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO;
        BigDecimal taxAmount = order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.subtract(discountAmount).add(deliveryFee).add(taxAmount);
        order.setTotalAmount(totalAmount);

        // Store order-level pricing audit trail if provided
        // Note: finalTotal is intentionally NOT overridden from pricingInfo — it is always
        // recalculated server-side as subtotal - discount + delivery + tax to prevent
        // client-sent wrong values from being persisted.
        if (pricingInfo != null) {
            if (pricingInfo.getDeliveryFee() != null) {
                order.setDeliveryFee(pricingInfo.getDeliveryFee());
                // Recalculate totalAmount if delivery fee was overridden
                order.setTotalAmount(order.getSubtotal().subtract(discountAmount)
                        .add(pricingInfo.getDeliveryFee()).add(taxAmount));
            }
        }

        log.info("Saving order ID: {}, Items: {}, Total: {} (Subtotal: {}, Discount: {}, Delivery: {}, Tax: {})",
            orderId, order.getItems().size(), totalAmount, subtotal, discountAmount, deliveryFee, taxAmount);

        orderRepository.save(order);
        log.info("Successfully saved {} order items for order ID: {}", order.getItems().size(), orderId);
    }

    private void createOrderItemsFromCartSummaryWithCustomizations(UUID orderId, CartSummaryRequest cartSummary) {
        BigDecimal subtotal = cartSummary.getSubtotal() != null ? cartSummary.getSubtotal() : BigDecimal.ZERO;
        BigDecimal customizationTotal = cartSummary.getCustomizationTotal() != null ? cartSummary.getCustomizationTotal() : BigDecimal.ZERO;
        BigDecimal discountAmount = cartSummary.getTotalDiscount() != null ? cartSummary.getTotalDiscount() : BigDecimal.ZERO;

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        int itemCount = 0;
        for (CartItemRequest item : cartSummary.getItems()) {
            itemCount++;

            UUID prodId = item.getProductId() != null ? item.getProductId() : item.getId();
            if (prodId == null) {
                log.warn("Skipping cart item with missing productId and id: {}", item);
                continue;
            }

            // Get product for SKU/barcode
            Product product = productRepository.findById(prodId)
                    .orElseThrow(() -> new NotFoundException("Product not found: " + prodId));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setOrderId(orderId);
            orderItem.setProductId(prodId);
            orderItem.setProductSizeId(item.getProductSizeId());
            orderItem.setProductName(item.getProductName() != null ? item.getProductName() : product.getName());
            ImageUrls originalImgUrl = product.getMainImage();
            orderItem.setProductImageUrl(originalImgUrl != null ? originalImgUrl : 
                    orderMapper.toImageUrls(item.getProductImageUrl()));
            orderItem.setSizeName(item.getSizeName());

            // Set SKU and barcode: prefer from request, fallback to product master data
            orderItem.setSku(item.getSku() != null ? item.getSku() : product.getSku());
            orderItem.setBarcode(item.getBarcode() != null ? item.getBarcode() : product.getBarcode());

            int quantity = item.getQuantity() != null && item.getQuantity() > 0 ? item.getQuantity() : 1;
            orderItem.setQuantity(quantity);

            BigDecimal productMasterPrice = product.getPrice() != null ? product.getPrice() : BigDecimal.ZERO;
            BigDecimal finalPrice = item.getFinalPrice() != null && item.getFinalPrice().compareTo(BigDecimal.ZERO) > 0
                    ? item.getFinalPrice()
                    : (item.getCurrentPrice() != null && item.getCurrentPrice().compareTo(BigDecimal.ZERO) > 0
                        ? item.getCurrentPrice()
                        : productMasterPrice);
            BigDecimal basePrice = item.getCurrentPrice() != null && item.getCurrentPrice().compareTo(BigDecimal.ZERO) > 0
                    ? item.getCurrentPrice()
                    : finalPrice;

            if (Boolean.TRUE.equals(item.getHasPromotion()) && item.getPromotionType() != null && item.getPromotionValue() != null && item.getPromotionValue().compareTo(BigDecimal.ZERO) > 0) {
                if (basePrice.compareTo(finalPrice) <= 0) {
                    if ("FIXED_AMOUNT".equalsIgnoreCase(item.getPromotionType())) {
                        basePrice = finalPrice.add(item.getPromotionValue());
                    } else if ("PERCENTAGE".equalsIgnoreCase(item.getPromotionType()) && item.getPromotionValue().compareTo(new BigDecimal("100")) < 0) {
                        BigDecimal remainingRatio = BigDecimal.ONE.subtract(item.getPromotionValue().divide(new BigDecimal("100"), 4, java.math.RoundingMode.HALF_UP));
                        if (remainingRatio.compareTo(BigDecimal.ZERO) > 0) {
                            basePrice = finalPrice.divide(remainingRatio, 2, java.math.RoundingMode.HALF_UP);
                        }
                    }
                }
            }

            orderItem.setCurrentPrice(basePrice);
            orderItem.setUnitPrice(finalPrice);
            orderItem.setFinalPrice(finalPrice);
            orderItem.setTotalPrice(item.getTotalPrice() != null ? item.getTotalPrice() :
                    finalPrice.multiply(BigDecimal.valueOf(quantity)));

            // Map promotion details from cart item to order item
            orderItem.setHasPromotion(item.getHasPromotion());
            if (Boolean.TRUE.equals(item.getHasPromotion())) {
                orderItem.setPromotionType(item.getPromotionType());
                orderItem.setPromotionValue(item.getPromotionValue());
                orderItem.setPromotionFromDate(item.getPromotionFromDate());
                orderItem.setPromotionToDate(item.getPromotionToDate());
                log.info("Item {} has promotion: type={}, value={}",
                    prodId, item.getPromotionType(), item.getPromotionValue());
            }

            // Process customizations - store total but don't create objects yet
            if (item.getCustomizations() != null && !item.getCustomizations().isEmpty()) {
                try {
                    BigDecimal itemCustomizationTotal = item.getCustomizations().stream()
                        .map(c -> c.getPriceAdjustment() != null ? c.getPriceAdjustment() : BigDecimal.ZERO)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .multiply(BigDecimal.valueOf(quantity));
                    orderItem.setCustomizationTotal(itemCustomizationTotal);
                } catch (Exception e) {
                    log.warn("Failed to calculate customization total for item {}: {}", prodId, e.getMessage());
                    orderItem.setCustomizationTotal(BigDecimal.ZERO);
                }
            } else {
                orderItem.setCustomizationTotal(BigDecimal.ZERO);
            }

            order.getItems().add(orderItem);
        }

        BigDecimal computedCustomizationTotal = order.getItems().stream()
                .map(oi -> oi.getCustomizationTotal() != null ? oi.getCustomizationTotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setSubtotal(subtotal);
        order.setCustomizationTotal(computedCustomizationTotal);
        order.setDiscountAmount(discountAmount);
        order.setHadOrderLevelChangeFromPOS(false);

        BigDecimal deliveryFee = order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO;
        BigDecimal taxAmount = order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.add(computedCustomizationTotal).add(deliveryFee).add(taxAmount).subtract(discountAmount);
        order.setTotalAmount(totalAmount);

        // Save order and items first
        orderRepository.save(order);

        // Now save customizations with the order item IDs
        for (CartItemRequest item : cartSummary.getItems()) {
            UUID prodId = item.getProductId() != null ? item.getProductId() : item.getId();
            if (prodId == null) continue;

            OrderItem savedItem = order.getItems().stream()
                .filter(oi -> oi.getProductId() != null && oi.getProductId().equals(prodId) &&
                             (oi.getProductSizeId() == null ? item.getProductSizeId() == null : oi.getProductSizeId().equals(item.getProductSizeId())))
                .findFirst()
                .orElse(null);

            if (savedItem != null && item.getCustomizations() != null && !item.getCustomizations().isEmpty()) {
                try {
                    List<OrderItemCustomization> customizations = item.getCustomizations().stream()
                        .map(c -> {
                            OrderItemCustomization customization = new OrderItemCustomization();
                            customization.setOrderItemId(savedItem.getId());
                            customization.setProductCustomizationId(c.getProductCustomizationId());
                            customization.setName(c.getName());
                            customization.setPriceAdjustment(c.getPriceAdjustment());
                            return customization;
                        })
                        .toList();
                    orderItemCustomizationRepository.saveAll(customizations);
                } catch (Exception e) {
                    log.warn("Failed to save customizations for item {}: {}", prodId, e.getMessage());
                }
            } else if (savedItem == null) {
                log.warn("No matching orderItem found for productId={}, sizeId={}", prodId, item.getProductSizeId());
            }
        }
    }

    private void applyPricingToOrder(Order order, OrderCreateRequest.PricingInfo pricingInfo) {
        if (pricingInfo == null) return;

        // Apply subtotal
        if (pricingInfo.getSubtotal() != null) {
            order.setSubtotal(pricingInfo.getSubtotal());
        }

        // Apply delivery fee
        if (pricingInfo.getDeliveryFee() != null) {
            order.setDeliveryFee(pricingInfo.getDeliveryFee());
        }

        // Apply tax information
        if (pricingInfo.getTaxPercentage() != null) {
            order.setTaxPercentage(pricingInfo.getTaxPercentage());
        }
        if (pricingInfo.getTaxAmount() != null) {
            order.setTaxAmount(pricingInfo.getTaxAmount());
        }

        // Apply discount information
        if (pricingInfo.getDiscountAmount() != null) {
            order.setDiscountAmount(pricingInfo.getDiscountAmount());
        }
        if (pricingInfo.getDiscountType() != null) {
            order.setDiscountType(pricingInfo.getDiscountType());
        }
        if (pricingInfo.getDiscountReason() != null) {
            order.setDiscountReason(pricingInfo.getDiscountReason());
        }

        // Apply final total
        if (pricingInfo.getFinalTotal() != null) {
            order.setTotalAmount(pricingInfo.getFinalTotal());
        }

        // Save order with updated pricing
        orderRepository.save(order);
    }

    private void applyPOSPricingToOrder(Order order, POSCheckoutRequest.PricingInfo pricingInfo) {
        if (pricingInfo == null) return;

        if (pricingInfo.getSubtotal() != null) {
            order.setSubtotal(pricingInfo.getSubtotal());
        }
        if (pricingInfo.getDeliveryFee() != null) {
            order.setDeliveryFee(pricingInfo.getDeliveryFee());
        }
        if (pricingInfo.getTaxPercentage() != null) {
            order.setTaxPercentage(pricingInfo.getTaxPercentage());
        }
        if (pricingInfo.getTaxAmount() != null) {
            order.setTaxAmount(pricingInfo.getTaxAmount());
        }
        if (pricingInfo.getDiscountAmount() != null) {
            order.setDiscountAmount(pricingInfo.getDiscountAmount());
        }
        if (pricingInfo.getDiscountType() != null) {
            order.setDiscountType(pricingInfo.getDiscountType());
        }
        if (pricingInfo.getDiscountReason() != null) {
            order.setDiscountReason(pricingInfo.getDiscountReason());
        }
        if (pricingInfo.getFinalTotal() != null) {
            order.setTotalAmount(pricingInfo.getFinalTotal());
        }

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
                .customerPaymentMethod(order.getCustomerPaymentMethod())
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

    private void createInitialOrderStatusHistory(Order order, UUID userId, String changedByName) {
        try {
            OrderStatusHistory history = new OrderStatusHistory();
            history.setOrderId(order.getId());
            history.setOrderStatus(order.getOrderStatus());
            history.setChangedByUserId(userId);
            history.setChangedByName(changedByName != null ? changedByName : "System");
            history.setNote("Order created from checkout");
            history.setPaymentMethod(order.getPaymentMethod());
            history.setPaymentStatus(order.getPaymentStatus());

            orderStatusHistoryRepository.save(history);
        } catch (Exception e) {
            log.warn("Failed to save initial status history snapshot: {}", e.getMessage());
            // Don't throw exception - order creation should not fail if history creation fails
        }
    }

    // Order number generation is now handled by orderNumberGenerator with per-business counters
    // Format: ORD-YYYYMMDD-XXXXX (where XXXXX can be 00001-99999, 100000 onwards)

    @Override
    public OrderResponse createPOSCheckoutOrder(POSCheckoutRequest request) {

        User currentUser = securityUtils.getCurrentUser();

        try {
            Order order = orderMapper.fromPOSCheckoutRequest(request);
            order.setOrderNumber(orderNumberGenerator.generateOrderNumber(request.getBusinessId()));

            Order savedOrder = orderRepository.save(order);

            // Create delivery option snapshot
            if (request.getDeliveryOption() != null) {
                OrderDeliveryOption deliveryOption = new OrderDeliveryOption();
                orderMapper.updateDeliveryOption(request.getDeliveryOption(), deliveryOption);
                deliveryOption.setOrderId(savedOrder.getId());
                orderDeliveryOptionRepository.save(deliveryOption);

                savedOrder.setDeliveryFee(request.getDeliveryOption().getPrice());
            }

            // Create initial order status history
            createInitialOrderStatusHistory(savedOrder, 
                    currentUser != null ? currentUser.getId() : null,
                    currentUser != null ? currentUser.getFullName() : "Walk-in Cashier");

            // Create order items with customizations
            if (request.getCart() != null && request.getCart().getItems() != null && !request.getCart().getItems().isEmpty()) {
                createOrderItemsFromCartSummaryWithCustomizations(savedOrder.getId(), request.getCart());
            } else {
                throw new ValidationException("Order must contain at least one item");
            }

            createPaymentRecord(savedOrder);

            // CRITICAL FIX: Reload order from database to get the items that were just created
            Order orderWithItems = orderRepository.findById(savedOrder.getId())
                .orElseThrow(() -> new NotFoundException("Order not found after item creation"));

            if (savedOrder.getOrderStatus() == OrderStatus.CONFIRMED || savedOrder.getOrderStatus() == OrderStatus.COMPLETED) {
                deductStockForOrder(orderWithItems);
            }

            entityManager.flush();
            entityManager.clear();
            OrderResponse response = getOrderById(savedOrder.getId());
            if (response.getBusinessName() == null) {
                businessRepository.findById(request.getBusinessId())
                    .ifPresent(b -> response.setBusinessName(b.getName()));
            }
            log.info("POS checkout order #{} created successfully - Items: {}, Total: ${}",
                savedOrder.getOrderNumber(),
                response.getItems() != null ? response.getItems().size() : 0,
                response.getPricing() != null ? response.getPricing().getFinalTotal() : 0);

            Order orderForNotification = orderRepository.findByIdWithDetails(savedOrder.getId()).orElse(savedOrder);
            telegramNotificationService.notifyNewPOSOrder(orderForNotification);
            webSocketNotificationService.notifyNewOrder(orderForNotification);

            return response;

        } catch (Exception e) {
            log.error("Failed to create POS checkout order: {}", e.getMessage(), e);
            throw new ValidationException("Failed to create POS order: " + e.getMessage());
        }
    }

    private void batchLoadStatusHistories(List<Order> orders) {
        if (orders == null || orders.isEmpty()) return;
        List<UUID> orderIds = orders.stream().map(Order::getId).toList();
        Map<UUID, List<OrderStatusHistory>> historyMap = orderRepository
                .findStatusHistoriesByOrderIds(orderIds)
                .stream()
                .collect(Collectors.groupingBy(OrderStatusHistory::getOrderId));
        orders.forEach(order ->
            order.setStatusHistory(historyMap.getOrDefault(order.getId(), Collections.emptyList()))
        );
    }

    /**
     * Deduct stock via FIFO for each item in the order.
     * Called when order status changes to CONFIRMED.
     */
    private void deductStockForOrder(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return;
        }

        BusinessSetting businessSetting = businessSettingRepository
            .findByBusinessIdAndIsDeletedFalse(order.getBusinessId())
            .orElse(null);

        if (businessSetting == null || businessSetting.getEnableStock() != StockStatus.ENABLED) {
            return;
        }

        // Pre-validate stock availability for all items before performing deductions
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product == null || product.getStockStatus() != com.emenu.enums.product.StockStatus.ENABLED) {
                continue;
            }

            Integer available = productStockRepository.sumAvailableQuantity(
                item.getProductId(),
                item.getProductSizeId(),
                order.getBusinessId()
            );
            if (available == null) available = 0;

            if (available < item.getQuantity()) {
                String sizeInfo = item.getSizeName() != null ? " (" + item.getSizeName() + ")" : "";
                throw new ValidationException("Insufficient stock for item: " + item.getProductName() + sizeInfo +
                    ". Available: " + available + ", requested: " + item.getQuantity());
            }
        }

        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product == null || product.getStockStatus() != com.emenu.enums.product.StockStatus.ENABLED) {
                continue;
            }

            stockService.deductStockFIFO(
                order.getBusinessId(),
                item.getProductId(),
                item.getProductSizeId(),
                item.getQuantity(),
                order.getId(),
                "Order confirmed: " + order.getOrderNumber()
            );
        }
    }

    /**
     * Create delivery address snapshot by fetching location from database
     * Stores complete address details + location images for order history preservation
     */
    private OrderDeliveryAddress createDeliveryAddressSnapshot(UUID orderId, UUID addressId) {
        if (addressId == null) {
            log.info("No addressId provided for delivery address snapshot, skipping.");
            return null;
        }
        try {
            // Fetch location from database
            Location location = locationRepository.findById(addressId)
                    .orElseThrow(() -> new NotFoundException("Address not found: " + addressId));

            // Create snapshot with all location details
            OrderDeliveryAddress deliveryAddress = new OrderDeliveryAddress();
            deliveryAddress.setOrderId(orderId);
            deliveryAddress.setVillage(location.getVillage());
            deliveryAddress.setCommune(location.getCommune());
            deliveryAddress.setDistrict(location.getDistrict());
            deliveryAddress.setProvince(location.getProvince());
            deliveryAddress.setStreetNumber(location.getStreetNumber());
            deliveryAddress.setHouseNumber(location.getHouseNumber());
            deliveryAddress.setNote(location.getNote());
            deliveryAddress.setLatitude(location.getLatitude());
            deliveryAddress.setLongitude(location.getLongitude());

            // Store reference to original location
            deliveryAddress.setLocationId(addressId);

            // Snapshot location images at time of order
            // If location images are updated later, orders preserve the images from checkout
            if (location.getLocationImages() != null && !location.getLocationImages().isEmpty()) {
                List<String> imageUrls = location.getLocationImages().stream()
                        .map(img -> img.getImageUrl())
                        .collect(Collectors.toList());
                deliveryAddress.setLocationImages(imageUrls);
            }

            return deliveryAddress;
        } catch (NotFoundException e) {
            log.error("Failed to fetch address details for snapshot: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error creating delivery address snapshot: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create delivery address snapshot", e);
        }
    }

    private OrderDeliveryAddress createGuestDeliveryAddressSnapshot(UUID orderId, OrderCreateRequest.GuestAddressRequest guestAddr) {
        if (guestAddr == null) return null;
        OrderDeliveryAddress deliveryAddress = new OrderDeliveryAddress();
        deliveryAddress.setOrderId(orderId);
        deliveryAddress.setVillage(guestAddr.getVillage());
        deliveryAddress.setCommune(guestAddr.getCommune());
        deliveryAddress.setDistrict(guestAddr.getDistrict());
        deliveryAddress.setProvince(guestAddr.getProvince());
        deliveryAddress.setStreetNumber(guestAddr.getStreetNumber());
        deliveryAddress.setHouseNumber(guestAddr.getHouseNumber());
        deliveryAddress.setNote(guestAddr.getNote());
        deliveryAddress.setLatitude(guestAddr.getLatitude());
        deliveryAddress.setLongitude(guestAddr.getLongitude());
        deliveryAddress.setLocationId(null);
        return deliveryAddress;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getGuestOrders(List<UUID> orderIds) {
        if (orderIds == null || orderIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        List<Order> orders = orderRepository.findAllById(orderIds);
        batchLoadStatusHistories(orders);
        return orderMapper.toResponseList(orders);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] getOrderReceiptPdf(UUID orderId) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));
        BusinessSetting settings = businessSettingRepository.findByBusinessIdAndIsDeletedFalse(order.getBusinessId())
                .orElse(null);
        return PdfReceiptGenerator.generatePdfReceipt(order, settings);
    }
}

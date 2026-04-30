package com.emenu.features.order.models;

import com.emenu.enums.order.OrderStatus;
import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.models.User;
import com.emenu.features.location.models.Location;
import com.emenu.features.order.enums.OrderFromEnum;
import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Order extends BaseUUIDEntity {

    @Column(name = "order_number", nullable = false, unique = true)
    private String orderNumber;

    // Customer Info
    @Column(name = "customer_id")
    private UUID customerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", insertable = false, updatable = false)
    private User customer;

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", insertable = false, updatable = false)
    private Business business;

    // ===== Delivery Address & Option Snapshots =====
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private OrderDeliveryAddress deliveryAddress;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private OrderDeliveryOption deliveryOption;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false)
    private OrderStatus orderStatus = OrderStatus.PENDING;

    @Column(name = "source", nullable = false, length = 50)
    private String source = "PUBLIC"; // PUBLIC or POS

    @Enumerated(EnumType.STRING)
    @Column(name = "order_from", nullable = false, length = 20)
    private OrderFromEnum orderFrom = OrderFromEnum.CUSTOMER;

    // Customer contact info - captured at checkout time
    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_phone")
    private String customerPhone;

    @Column(name = "customer_email")
    private String customerEmail;

    @Column(name = "customer_address", columnDefinition = "TEXT")
    private String customerAddress;

    @Column(name = "customer_note", columnDefinition = "TEXT")
    private String customerNote;

    @Column(name = "business_note", columnDefinition = "TEXT")
    private String businessNote;

    // ===== AUDIT TRAIL: Order-level changes =====
    // Was the order total modified from POS?
    @Column(name = "had_order_level_change_from_pos")
    private Boolean hadOrderLevelChangeFromPOS = false;

    // Reason for order-level change (if any)
    @Column(name = "order_level_change_reason", columnDefinition = "TEXT")
    private String orderLevelChangeReason;

    // Pricing
    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;           // Items total before discounts

    @Column(name = "customization_total", precision = 10, scale = 2)
    private BigDecimal customizationTotal = BigDecimal.ZERO; // Total cost of add-ons/customizations

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO; // Total discount applied

    @Column(name = "discount_type", length = 20)
    private String discountType; // PERCENTAGE or FIXED_AMOUNT (null if no discount)

    @Column(name = "discount_reason", columnDefinition = "TEXT")
    private String discountReason; // Why discount was applied (audit trail)

    @Column(name = "delivery_fee", precision = 10, scale = 2)
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    @Column(name = "tax_percentage", precision = 5, scale = 2)
    private BigDecimal taxPercentage = BigDecimal.ZERO; // Tax rate (e.g., 10.00 for 10%)

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;     // Calculated tax amount

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;        // Final = subtotal - discount + delivery + tax

    // Payment info
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    // Payment status - using enum for type safety (PAID, UNPAID, PARTIALLY_PAID, REFUNDED, etc.)
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    // Timestamps
    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();

    // Business Methods
    public void updateStatus(OrderStatus newStatus) {
        this.orderStatus = newStatus;
    }

    public void confirmOrder() {
        this.orderStatus = OrderStatus.CONFIRMED;
        this.confirm();
    }

    public void completeOrder() {
        this.orderStatus = OrderStatus.COMPLETED;
        this.complete();
    }

    public void cancelOrder() {
        this.orderStatus = OrderStatus.CANCELLED;
    }

    public void confirm() {
        this.confirmedAt = LocalDateTime.now();
    }

    public void complete() {
        this.completedAt = LocalDateTime.now();
    }

    public String getCustomerIdentifier() {
        return customer != null ? customer.getFullName() : null;
    }

    public String getCustomerContact() {
        return customer != null && customer.getProfile() != null ? customer.getProfile().getPhoneNumber() : null;
    }

    public void markAsPaid() {
        this.paymentStatus = PaymentStatus.PAID;
    }

    public void markAsUnpaid() {
        this.paymentStatus = PaymentStatus.UNPAID;
    }

    public void markAsRefunded() {
        this.paymentStatus = PaymentStatus.REFUNDED;
    }
}

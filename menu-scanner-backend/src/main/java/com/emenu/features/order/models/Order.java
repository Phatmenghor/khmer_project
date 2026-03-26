package com.emenu.features.order.models;

import com.emenu.enums.order.OrderStatus;
import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.models.User;
import com.emenu.features.location.models.Location;
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

    // Delivery info - full JSON snapshots from frontend (no IDs) - DEPRECATED, use proper columns below
    @Column(name = "delivery_address_snapshot", columnDefinition = "TEXT")
    private String deliveryAddressSnapshot;

    @Column(name = "delivery_option_snapshot", columnDefinition = "TEXT")
    private String deliveryOptionSnapshot;

    // ===== NEW: Delivery Address Fields (replacing JSON snapshot) =====
    @Column(name = "delivery_village")
    private String deliveryVillage;

    @Column(name = "delivery_commune")
    private String deliveryCommune;

    @Column(name = "delivery_district")
    private String deliveryDistrict;

    @Column(name = "delivery_province")
    private String deliveryProvince;

    @Column(name = "delivery_street_number")
    private String deliveryStreetNumber;

    @Column(name = "delivery_house_number")
    private String deliveryHouseNumber;

    @Column(name = "delivery_note", columnDefinition = "TEXT")
    private String deliveryNote;

    @Column(name = "delivery_latitude", precision = 10, scale = 8)
    private Double deliveryLatitude;

    @Column(name = "delivery_longitude", precision = 11, scale = 8)
    private Double deliveryLongitude;

    // ===== NEW: Delivery Option Fields (replacing JSON snapshot) =====
    @Column(name = "delivery_option_name")
    private String deliveryOptionName;

    @Column(name = "delivery_option_description", columnDefinition = "TEXT")
    private String deliveryOptionDescription;

    @Column(name = "delivery_option_image_url")
    private String deliveryOptionImageUrl;

    @Column(name = "delivery_option_price", precision = 19, scale = 2)
    private BigDecimal deliveryOptionPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false)
    private OrderStatus orderStatus = OrderStatus.PENDING;

    @Column(name = "source", nullable = false, length = 50)
    private String source = "PUBLIC"; // PUBLIC or POS

    @Column(name = "customer_note", columnDefinition = "TEXT")
    private String customerNote;

    @Column(name = "business_note", columnDefinition = "TEXT")
    private String businessNote;

    // ===== AUDIT TRAIL: Order-level discount snapshot =====
    // Snapshot BEFORE order-level modifications (after item-level pricing)
    @Column(name = "pricing_before_snapshot", columnDefinition = "TEXT")
    private String pricingBeforeSnapshot; // JSON: OrderPricingSnapshot

    // Was the order total modified from POS?
    @Column(name = "had_order_level_change_from_pos")
    private Boolean hadOrderLevelChangeFromPOS = false;

    // Snapshot AFTER order-level modifications
    @Column(name = "pricing_after_snapshot", columnDefinition = "TEXT")
    private String pricingAfterSnapshot; // JSON: OrderPricingSnapshot

    // Detailed order-level discount metadata (if applied)
    @Column(name = "order_discount_metadata", columnDefinition = "TEXT")
    private String orderDiscountMetadata; // JSON: OrderLevelDiscountMetadata

    // Reason for order-level change (if any)
    @Column(name = "order_level_change_reason", columnDefinition = "TEXT")
    private String orderLevelChangeReason;

    // Pricing
    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;           // Items total before discounts

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO; // Total discount applied

    @Column(name = "delivery_fee", precision = 10, scale = 2)
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;      // Tax (reserved for future use)

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

    public void failOrder() {
        this.orderStatus = OrderStatus.FAILED;
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
        return customer != null ? customer.getPhoneNumber() : null;
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

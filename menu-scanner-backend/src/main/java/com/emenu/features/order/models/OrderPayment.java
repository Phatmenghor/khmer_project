package com.emenu.features.order.models;

import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.enums.payment.PaymentStatusConverter;
import com.emenu.features.auth.models.Business;
import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "order_payments")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class OrderPayment extends BaseUUIDEntity {

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", insertable = false, updatable = false)
    private Business business;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Order order;

    @Column(name = "payment_reference", nullable = false, unique = true)
    private String paymentReference; // Generated reference

    // Pricing breakdown for easy payment records/download
    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;          // Items total before discounts

    @Column(name = "customization_total", precision = 10, scale = 2)
    private BigDecimal customizationTotal = BigDecimal.ZERO; // Total cost of customizations/add-ons

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO; // Total discount applied

    @Column(name = "delivery_fee", precision = 10, scale = 2)
    private BigDecimal deliveryFee = BigDecimal.ZERO;    // Delivery cost

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;      // Tax (reserved for future use)

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;       // Final = subtotal - discount + delivery + tax

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Convert(converter = PaymentStatusConverter.class)
    @Column(name = "status", nullable = false)
    private PaymentStatus status = PaymentStatus.PAID;

    // Customer payment method for POS orders (e.g., "Cash", "Card", "Mobile Payment")
    @Column(name = "customer_payment_method")
    private String customerPaymentMethod;

    // Business Methods
    public void markAsPaid() {
        this.status = PaymentStatus.PAID;
    }

    public void markAsUnpaid() {
        this.status = PaymentStatus.UNPAID;
    }

    public void markAsRefunded() {
        this.status = PaymentStatus.REFUNDED;
    }

    public boolean isPaid() {
        return PaymentStatus.PAID.equals(status);
    }

    public boolean isUnpaid() {
        return PaymentStatus.UNPAID.equals(status);
    }

    public String getFormattedAmount() {
        return totalAmount != null ? String.format("$%.2f", totalAmount) : "$0.00";
    }
}
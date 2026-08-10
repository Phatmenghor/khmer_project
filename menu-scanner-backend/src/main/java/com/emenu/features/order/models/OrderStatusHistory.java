package com.emenu.features.order.models;

import com.emenu.enums.order.OrderStatus;
import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.features.auth.models.User;
import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.UUID;

@Entity
@Table(name = "order_status_history",
        indexes = {
                @Index(name = "idx_order_status_history_order_id", columnList = "order_id")
        }
)
@Data
@ToString(callSuper = true, exclude = {"order", "changedByUser"})
@EqualsAndHashCode(callSuper = true, exclude = {"order", "changedByUser"})
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusHistory extends BaseUUIDEntity {

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false)
    private OrderStatus orderStatus;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    // User who changed the status
    @Column(name = "changed_by_user_id")
    private UUID changedByUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_user_id", insertable = false, updatable = false)
    private User changedByUser;

    // Snapshot of user details at time of change
    @Column(name = "changed_by_name")
    private String changedByName; // Full name for backward compatibility

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus;

    public OrderStatusHistory(UUID orderId, OrderStatus orderStatus, String note, UUID changedByUserId, String changedByName) {
        this.orderId = orderId;
        this.orderStatus = orderStatus;
        this.note = note;
        this.changedByUserId = changedByUserId;
        this.changedByName = changedByName;
    }

    public OrderStatusHistory(UUID orderId, OrderStatus orderStatus, String note, UUID changedByUserId, String changedByName, PaymentMethod paymentMethod, PaymentStatus paymentStatus) {
        this.orderId = orderId;
        this.orderStatus = orderStatus;
        this.note = note;
        this.changedByUserId = changedByUserId;
        this.changedByName = changedByName;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
    }
}
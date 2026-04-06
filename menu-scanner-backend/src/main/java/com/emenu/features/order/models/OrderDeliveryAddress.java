package com.emenu.features.order.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "order_delivery_addresses")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class OrderDeliveryAddress extends BaseUUIDEntity {

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Order order;

    @Column(name = "village")
    private String village;

    @Column(name = "commune")
    private String commune;

    @Column(name = "district")
    private String district;

    @Column(name = "province")
    private String province;

    @Column(name = "street_number")
    private String streetNumber;

    @Column(name = "house_number")
    private String houseNumber;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    // Location images from address at checkout time
    @Column(name = "location_images", columnDefinition = "jsonb")
    private List<String> locationImages = new ArrayList<>();
}

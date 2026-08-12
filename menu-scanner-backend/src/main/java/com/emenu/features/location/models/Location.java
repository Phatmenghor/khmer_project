package com.emenu.features.location.models;

import com.emenu.features.auth.models.User;
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
@Table(name = "customer_addresses",
        indexes = {
                @Index(name = "idx_customer_addresses_user_id", columnList = "user_id")
        }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Location extends BaseUUIDEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(name = "label")
    private String label;

    @Column(name = "village")
    private String village;

    @Column(name = "commune")
    private String commune;

    @Column(name = "district", nullable = false)
    private String district;

    @Column(name = "province", nullable = false)
    private String province;

    @Column(name = "country")
    private String country;

    @Column(name = "street_number")
    private String streetNumber;

    @Column(name = "house_number")
    private String houseNumber;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "latitude", precision = 10, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 6)
    private BigDecimal longitude;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @OneToMany(mappedBy = "location", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<LocationImage> locationImages = new ArrayList<>();

    public void setAsDefault() {
        this.isDefault = true;
    }

    public void unsetDefault() {
        this.isDefault = false;
    }

    public String getFullAddress() {
        StringBuilder address = new StringBuilder();
        if (houseNumber != null) address.append(houseNumber).append(", ");
        if (streetNumber != null) address.append(streetNumber).append(", ");
        if (village != null) address.append(village).append(", ");
        if (commune != null) address.append(commune).append(", ");
        address.append(district).append(", ");
        address.append(province);
        return address.toString();
    }

    public boolean hasCoordinates() {
        return latitude != null && longitude != null &&
               (latitude.compareTo(BigDecimal.ZERO) != 0 || longitude.compareTo(BigDecimal.ZERO) != 0);
    }

    public String getGoogleMapsUrl() {
        if (!hasCoordinates()) return null;
        return "https://www.google.com/maps/search/" + latitude + "," + longitude;
    }
}
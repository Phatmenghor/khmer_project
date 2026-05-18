package com.emenu.features.location.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "location_images")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class LocationImage extends BaseUUIDEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;
}

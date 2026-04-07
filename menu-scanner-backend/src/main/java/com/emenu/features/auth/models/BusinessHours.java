package com.emenu.features.auth.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * BusinessHours Entity
 * Represents business hours for each day of the week
 * Has automatic audit fields: createdAt, updatedAt, createdBy, updatedBy, isDeleted
 */
@Entity
@Table(name = "business_hours")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class BusinessHours extends BaseUUIDEntity {

    @Column(name = "business_setting_id", nullable = false)
    private UUID businessSettingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_setting_id", insertable = false, updatable = false)
    private BusinessSetting businessSetting;

    @Column(name = "day", nullable = false)
    private String day;

    @Column(name = "opening_time")
    private String openingTime;

    @Column(name = "closing_time")
    private String closingTime;
}

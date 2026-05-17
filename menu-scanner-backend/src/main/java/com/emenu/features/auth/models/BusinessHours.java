package com.emenu.features.auth.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

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

    @Column(name = "is_closed", nullable = false)
    private Boolean isClosed = false;
}

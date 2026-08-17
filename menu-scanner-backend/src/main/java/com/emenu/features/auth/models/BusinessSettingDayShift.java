package com.emenu.features.auth.models;

import com.emenu.enums.hr.ScanModeEnum;
import com.emenu.shared.domain.BaseUUIDEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "business_setting_day_shifts")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessSettingDayShift extends BaseUUIDEntity {

    @Column(name = "business_setting_id", nullable = false)
    private UUID businessSettingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_setting_id", insertable = false, updatable = false)
    @JsonIgnore
    private BusinessSetting businessSetting;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;

    @Column(name = "is_enabled", nullable = false)
    private Boolean enabled;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "break_start_time")
    private LocalTime breakStartTime;

    @Column(name = "break_end_time")
    private LocalTime breakEndTime;

    @Column(name = "enable_check_in")
    @Builder.Default
    private Boolean enableCheckIn = true;

    @Column(name = "scan_mode")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ScanModeEnum scanMode = ScanModeEnum.FULL_TIME;
}

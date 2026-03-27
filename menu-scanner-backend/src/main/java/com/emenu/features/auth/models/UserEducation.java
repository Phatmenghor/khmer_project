package com.emenu.features.auth.models;

import com.emenu.enums.user.EducationLevel;
import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_educations")
@Data
@EqualsAndHashCode(callSuper = true, exclude = "user")
@ToString(exclude = "user")
@NoArgsConstructor
@AllArgsConstructor
public class UserEducation extends BaseUUIDEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "level")
    private EducationLevel level;

    @Column(name = "school_name")
    private String schoolName;

    @Column(name = "field_of_study")
    private String fieldOfStudy;

    @Column(name = "start_year")
    private String startYear;

    @Column(name = "end_year")
    private String endYear;

    @Column(name = "is_graduated")
    private Boolean isGraduated = false;

    @Column(name = "certificate_url", columnDefinition = "TEXT")
    private String certificateUrl;
}

package com.emenu.features.auth.models;

import com.emenu.enums.user.EmploymentType;
import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_employments",
        indexes = {
                // FK join — used in every detail fetch
                @Index(name = "idx_user_employments_user_id",    columnList = "user_id"),

                // HR filter queries
                @Index(name = "idx_user_employments_position",   columnList = "position"),
                @Index(name = "idx_user_employments_department",  columnList = "department"),
                @Index(name = "idx_user_employments_type",        columnList = "employment_type"),
        }
)
@Data
@EqualsAndHashCode(callSuper = true, exclude = "user")
@ToString(exclude = "user")
@NoArgsConstructor
@AllArgsConstructor
public class UserEmployment extends BaseUUIDEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "employee_id")
    private String employeeId;

    @Column(name = "position")
    private String position;

    @Column(name = "department")
    private String department;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type")
    private EmploymentType employmentType;

    @Column(name = "join_date")
    private LocalDate joinDate;

    @Column(name = "leave_date")
    private LocalDate leaveDate;

    @Column(name = "shift")
    private String shift;
}

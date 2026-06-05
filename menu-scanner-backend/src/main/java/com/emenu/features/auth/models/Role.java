package com.emenu.features.auth.models;

import com.emenu.enums.user.UserType;
import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "roles",
        indexes = {
                @Index(name = "idx_roles_name",        columnList = "name"),
                @Index(name = "idx_roles_business_id", columnList = "business_id")
        }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Role extends BaseUUIDEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "business_id")
    private UUID businessId;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", length = 50)
    private UserType userType;

    public boolean isCustomer() {
        return "CUSTOMER".equals(name);
    }

    public boolean isCompatibleWithUserType(UserType targetUserType) {
        if (userType == null || targetUserType == null) {
            return true;
        }
        return userType == targetUserType;
    }
}
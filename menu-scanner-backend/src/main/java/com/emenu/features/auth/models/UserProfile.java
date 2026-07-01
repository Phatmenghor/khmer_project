package com.emenu.features.auth.models;

import com.emenu.enums.user.Gender;
import com.emenu.shared.domain.BaseUUIDEntity;
import com.emenu.shared.dto.ImageUrls;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;

@Entity
@Table(name = "user_profiles",
        indexes = {
                // FK join — used in every detail fetch and list join
                @Index(name = "idx_user_profiles_user_id",    columnList = "user_id"),

                // Search fields — used by UserSpecification.searchByIdentifierOrProfile()
                // LIKE '%search%' on these columns uses the index for prefix/equality checks
                @Index(name = "idx_user_profiles_email",      columnList = "email"),
                @Index(name = "idx_user_profiles_first_name", columnList = "first_name"),
                @Index(name = "idx_user_profiles_last_name",  columnList = "last_name"),
                @Index(name = "idx_user_profiles_phone",      columnList = "phone_number"),

                // Composite: first + last name for full-name search
                @Index(name = "idx_user_profiles_full_name",  columnList = "first_name, last_name"),
        }
)
@Data
@EqualsAndHashCode(callSuper = true, exclude = "user")
@ToString(exclude = "user")
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile extends BaseUUIDEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "email")
    private String email;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "nickname")
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "phone_number")
    private String phoneNumber;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "profile_image", columnDefinition = "jsonb")
    private ImageUrls profileImage;

    public String getFullName() {
        if (firstName != null && lastName != null) return firstName + " " + lastName;
        if (firstName != null) return firstName;
        if (lastName != null) return lastName;
        return null;
    }
}

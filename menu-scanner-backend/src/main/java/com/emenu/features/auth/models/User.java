package com.emenu.features.auth.models;

import com.emenu.enums.user.*;
import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(name = "uk_platform_user_identifier", columnNames = {"user_identifier", "user_type"}),
        @UniqueConstraint(name = "uk_business_user_identifier", columnNames = {"user_identifier", "business_id"})
})
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"userAddress", "emergencyContacts", "documents", "educations"})
@ToString(exclude = {"userAddress", "emergencyContacts", "documents", "educations"})
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseUUIDEntity {

    // ── Identity ──────────────────────────────────────────────────────────────

    @Column(name = "user_identifier", nullable = false)
    private String userIdentifier;

    @Column(name = "email")
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    // ── Personal Info ─────────────────────────────────────────────────────────

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

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    // ── Account ───────────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false)
    private UserType userType;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    @Column(name = "business_id")
    private UUID businessId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", insertable = false, updatable = false)
    private Business business;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private List<Role> roles;

    // ── Employment ────────────────────────────────────────────────────────────

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

    // ── Address & Related ─────────────────────────────────────────────────────

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private UserAddress userAddress;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<UserEmergencyContact> emergencyContacts = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<UserDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<UserEducation> educations = new ArrayList<>();

    // ── Misc ──────────────────────────────────────────────────────────────────

    @Column(name = "notes")
    private String notes;

    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;

    // ── Telegram ──────────────────────────────────────────────────────────────

    @Column(name = "telegram_id", unique = true)
    private Long telegramId;

    @Column(name = "telegram_username")
    private String telegramUsername;

    @Column(name = "telegram_first_name")
    private String telegramFirstName;

    @Column(name = "telegram_last_name")
    private String telegramLastName;

    @Column(name = "telegram_photo_url")
    private String telegramPhotoUrl;

    @Column(name = "telegram_synced_at")
    private java.time.LocalDateTime telegramSyncedAt;

    // ── Google OAuth ──────────────────────────────────────────────────────────

    @Column(name = "google_id")
    private String googleId;

    @Column(name = "google_email")
    private String googleEmail;

    @Column(name = "google_synced_at")
    private java.time.LocalDateTime googleSyncedAt;

    // ── Session Tracking ──────────────────────────────────────────────────────

    @Column(name = "last_login_at")
    private java.time.LocalDateTime lastLoginAt;

    @Column(name = "last_active_at")
    private java.time.LocalDateTime lastActiveAt;

    @Column(name = "active_sessions_count")
    private Integer activeSessionsCount = 0;

    // ── Computed ──────────────────────────────────────────────────────────────

    public String getFullName() {
        if (firstName != null && lastName != null) return firstName + " " + lastName;
        if (firstName != null) return firstName;
        if (lastName != null) return lastName;
        return userIdentifier;
    }

    public boolean isActive() { return AccountStatus.ACTIVE.equals(accountStatus); }
    public boolean isBusinessUser() { return UserType.BUSINESS_USER.equals(userType); }
    public boolean isCustomer() { return UserType.CUSTOMER.equals(userType); }

    // ── Sync Helpers ──────────────────────────────────────────────────────────

    public void syncTelegram(Long telegramId, String telegramUsername, String telegramFirstName, String telegramLastName, String telegramPhotoUrl) {
        this.telegramId = telegramId;
        this.telegramUsername = telegramUsername;
        this.telegramFirstName = telegramFirstName;
        this.telegramLastName = telegramLastName;
        this.telegramPhotoUrl = telegramPhotoUrl;
        this.telegramSyncedAt = java.time.LocalDateTime.now();
    }

    public void unsyncTelegram() {
        this.telegramId = null;
        this.telegramUsername = null;
        this.telegramFirstName = null;
        this.telegramLastName = null;
        this.telegramPhotoUrl = null;
        this.telegramSyncedAt = null;
    }

    public void syncGoogle(String googleId, String googleEmail) {
        this.googleId = googleId;
        this.googleEmail = googleEmail;
        this.googleSyncedAt = java.time.LocalDateTime.now();
    }

    public void unsyncGoogle() {
        this.googleId = null;
        this.googleEmail = null;
        this.googleSyncedAt = null;
    }
}

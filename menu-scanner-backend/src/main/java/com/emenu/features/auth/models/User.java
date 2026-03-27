package com.emenu.features.auth.models;

import com.emenu.enums.user.AccountStatus;
import com.emenu.enums.user.UserType;
import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(name = "uk_platform_user_identifier", columnNames = {"user_identifier", "user_type"}),
        @UniqueConstraint(name = "uk_business_user_identifier", columnNames = {"user_identifier", "business_id"})
})
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"profile", "employment", "telegram", "addresses", "emergencyContacts", "documents", "educations"})
@ToString(exclude = {"profile", "employment", "telegram", "addresses", "emergencyContacts", "documents", "educations"})
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseUUIDEntity {

    // ── Core ──────────────────────────────────────────────────────────────────

    @Column(name = "user_identifier", nullable = false)
    private String userIdentifier;

    @Column(name = "password", nullable = false)
    private String password;

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

    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;

    // ── Profile & Employment & Telegram (separate tables) ────────────────────

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private UserProfile profile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private UserEmployment employment;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private UserTelegram telegram;

    // ── Related Lists ─────────────────────────────────────────────────────────

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<UserAddress> addresses = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<UserEmergencyContact> emergencyContacts = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<UserDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<UserEducation> educations = new ArrayList<>();

    // ── Session Tracking ──────────────────────────────────────────────────────

    @Column(name = "last_login_at")
    private java.time.LocalDateTime lastLoginAt;

    @Column(name = "last_active_at")
    private java.time.LocalDateTime lastActiveAt;

    @Column(name = "active_sessions_count")
    private Integer activeSessionsCount = 0;

    // ── Helpers ───────────────────────────────────────────────────────────────

    public String getFullName() {
        if (profile != null) {
            String name = profile.getFullName();
            if (name != null) return name;
        }
        return userIdentifier;
    }

    public boolean isActive() { return AccountStatus.ACTIVE.equals(accountStatus); }
    public boolean isBusinessUser() { return UserType.BUSINESS_USER.equals(userType); }
    public boolean isCustomer() { return UserType.CUSTOMER.equals(userType); }

    // ── Telegram Sync ─────────────────────────────────────────────────────────

    public void syncTelegram(Long telegramId, String username, String firstName, String lastName, String photoUrl) {
        if (this.telegram == null) {
            this.telegram = new UserTelegram();
            this.telegram.setUser(this);
        }
        this.telegram.setTelegramId(telegramId);
        this.telegram.setTelegramUsername(username);
        this.telegram.setTelegramFirstName(firstName);
        this.telegram.setTelegramLastName(lastName);
        this.telegram.setTelegramPhotoUrl(photoUrl);
        this.telegram.setTelegramSyncedAt(java.time.LocalDateTime.now());
    }

    public void unsyncTelegram() {
        this.telegram = null; // orphanRemoval deletes the row
    }
}

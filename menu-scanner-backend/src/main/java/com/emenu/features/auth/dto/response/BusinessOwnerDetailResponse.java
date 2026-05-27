package com.emenu.features.auth.dto.response;

import com.emenu.enums.sub_scription.SubscriptionStatus;
import com.emenu.enums.user.BusinessStatus;
import com.emenu.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class BusinessOwnerDetailResponse extends BaseAuditResponse {

    // Owner Info
    private UUID ownerId;
    private String ownerUserIdentifier;
    private String ownerEmail;
    private String ownerFullName;
    private String ownerPhone;
    private String ownerAccountStatus;
    private String ownerProfileImageUrl;

    // Business Info
    private UUID businessId;
    private String businessName;
    private String businessEmail;
    private String businessPhone;
    private String businessAddress;
    private String businessDescription;
    private BusinessStatus businessStatus;
    private Boolean isSubscriptionActive;
    private LocalDateTime businessCreatedAt;

    // Business Setting Info
    private UUID businessSettingId;
    private Double taxPercentage;
    private String logoBusinessUrl;
    private String primaryColor;
    private String settingBusinessName;
    private String settingContactAddress;
    private String settingContactPhone;
    private String settingContactEmail;
    private String enableStock;
    private Boolean useBrands;
    private Integer lowStockThreshold;
    private String telegramGroupChatId;

    // Subscription Info
    private UUID currentSubscriptionId;
    private UUID currentPlanId;
    private String currentPlanName;
    private BigDecimal currentPlanPrice;
    private Integer currentPlanDurationDays;
    private LocalDateTime subscriptionStartDate;
    private LocalDateTime subscriptionEndDate;
    private Long daysRemaining;
    private Long daysActive;
    private SubscriptionStatus subscriptionStatus;
    private Boolean autoRenew;
    private Boolean isExpiringSoon;

    // Payment Info
    private BigDecimal totalPaid;
    private BigDecimal totalPending;
    private Integer totalPayments;
    private Integer completedPayments;
    private Integer pendingPayments;
    private String paymentStatus;
    private LocalDateTime lastPaymentDate;
}

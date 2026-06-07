package com.emenu.features.auth.dto.response;

import com.emenu.enums.sub_scription.SubscriptionPlanDurationType;
import com.emenu.enums.sub_scription.SubscriptionStatus;
import com.emenu.enums.user.BusinessStatus;
import com.emenu.shared.dto.BaseAuditResponse;
import com.emenu.shared.dto.ImageUrls;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
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

    // Business Info
    private UUID businessId;
    private String businessName;
    private String businessEmail;
    private String businessPhone;
    private String businessAddress;
    private BusinessStatus businessStatus;
    private Boolean isSubscriptionActive;

    // Business Setting Info
    private UUID businessSettingId;
    private ImageUrls logoBusiness;
    private String enableStock;

    // Subscription Info
    private UUID currentSubscriptionId;
    private UUID currentPlanId;
    private String currentPlanName;
    private BigDecimal currentPlanPrice;
    private SubscriptionPlanDurationType currentPlanDurationType;
    private LocalDate subscriptionStartDate;
    private LocalDate subscriptionEndDate;
    private Long daysRemaining;
    private Long daysActive;
    private SubscriptionStatus subscriptionStatus;
    private String subscriptionCancellationReason;
    private Boolean autoRenew;

}

package com.emenu.features.auth.service.impl;

import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.sub_scription.SubscriptionPaymentStatus;
import com.emenu.enums.sub_scription.SubscriptionPaymentType;
import com.emenu.enums.sub_scription.SubscriptionStatus;
import com.emenu.enums.user.AccountStatus;
import com.emenu.enums.user.BusinessStatus;
import com.emenu.enums.user.UserType;
import com.emenu.exception.custom.NotFoundException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.dto.filter.BusinessOwnerFilterRequest;
import com.emenu.features.auth.dto.request.*;
import com.emenu.features.auth.dto.response.BusinessOwnerCreateResponse;
import com.emenu.features.auth.dto.response.BusinessOwnerDetailResponse;
import com.emenu.features.auth.models.BusinessSetting;
import com.emenu.features.auth.repository.BusinessSettingRepository;
import com.emenu.features.auth.mapper.BusinessOwnerMapper;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.models.Role;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.models.UserEmployment;
import com.emenu.features.auth.models.UserProfile;
import com.emenu.features.auth.repository.BusinessOwnerRepository;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.auth.repository.RoleRepository;
import com.emenu.features.auth.service.BusinessOwnerService;
import com.emenu.features.auth.service.UserValidationService;
import com.emenu.features.notification.websocket.service.WebSocketNotificationService;
import com.emenu.features.notification.telegram.service.TelegramNotificationService;
import com.emenu.features.subscription.models.Subscription;
import com.emenu.features.subscription.models.SubscriptionPayment;
import com.emenu.features.subscription.models.SubscriptionPlan;
import com.emenu.features.subscription.repository.SubscriptionPaymentRepository;
import com.emenu.features.subscription.repository.SubscriptionPlanRepository;
import com.emenu.features.subscription.repository.SubscriptionRepository;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BusinessOwnerServiceImpl implements BusinessOwnerService {

    private final BusinessOwnerRepository businessOwnerRepository;
    private final BusinessRepository businessRepository;
    private final BusinessSettingRepository businessSettingRepository;
    private final RoleRepository roleRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionPaymentRepository subscriptionPaymentRepository;
    private final PasswordEncoder passwordEncoder;
    private final BusinessOwnerMapper mapper;
    private final UserValidationService userValidationService;
    private final PaginationMapper paginationMapper;
    private final WebSocketNotificationService webSocketNotificationService;
    private final TelegramNotificationService telegramNotificationService;

    @Value("${app.subscription.expiry-soon-days:7}")
    private int expirySoonDays;

    @Override
    public BusinessOwnerCreateResponse createBusinessOwner(BusinessOwnerCreateRequest creationRequestData) {
        log.info("Business owner creation initiated: business_name={}, owner_email={}",
                creationRequestData.getBusinessName(), creationRequestData.getOwnerEmail());

        validateBusinessOwnerCreation(creationRequestData);

        Business businessEntity = createBusiness(creationRequestData);
        User ownerUserEntity = createOwnerUser(creationRequestData, businessEntity.getId());

        businessEntity.setOwnerId(ownerUserEntity.getId());
        businessRepository.save(businessEntity);

        Subscription subscriptionRecord = null;
        SubscriptionPayment paymentRecord = null;

        if (creationRequestData.getPlanId() != null) {
            subscriptionRecord = createSubscription(businessEntity.getId(), creationRequestData);
            paymentRecord = createSubscriptionPayment(subscriptionRecord, creationRequestData);
            businessEntity.activateSubscription();
            businessRepository.save(businessEntity);
        }

        BusinessOwnerCreateResponse response = mapper.toCreateResponse(ownerUserEntity, businessEntity, subscriptionRecord, paymentRecord);
        response.setCreatedComponents(buildCreatedComponentsList(paymentRecord != null));

        log.info("Business owner created successfully: owner_id={}, business_id={}, subscription_id={}, has_payment={}",
                ownerUserEntity.getId(), businessEntity.getId(),
                subscriptionRecord != null ? subscriptionRecord.getId() : null, paymentRecord != null);
        webSocketNotificationService.notifyPlatformEvent("BUSINESS_OWNER_CHANGED", Map.of("action", "created", "ownerId", ownerUserEntity.getId().toString()));

        // Send Telegram notification
        if (subscriptionRecord != null) {
            String planName = subscriptionRecord.getPlan() != null ? subscriptionRecord.getPlan().getName() : "N/A";
            String expiryDate = subscriptionRecord.getEndDate().toLocalDate().toString();
            telegramNotificationService.notifyBusinessOwnerRegistered(
                businessEntity.getId(),
                ownerUserEntity.getFullName(),
                businessEntity.getName(),
                planName,
                expiryDate
            );
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<BusinessOwnerDetailResponse> getAllBusinessOwners(BusinessOwnerFilterRequest filterCriteria) {
        Pageable pageableRequest = PaginationUtils.createPageable(
                filterCriteria.getPageNo(),
                filterCriteria.getPageSize(),
                filterCriteria.getSortBy(),
                filterCriteria.getSortDirection()
        );

        List<SubscriptionStatus> filterSubscriptionStatuses = (filterCriteria.getSubscriptionStatuses() != null && !filterCriteria.getSubscriptionStatuses().isEmpty())
                ? filterCriteria.getSubscriptionStatuses() : null;

        boolean hasActiveSubscription = filterSubscriptionStatuses != null && filterSubscriptionStatuses.contains(SubscriptionStatus.ACTIVE);
        boolean hasExpiredSubscription = filterSubscriptionStatuses != null && filterSubscriptionStatuses.contains(SubscriptionStatus.EXPIRED);
        boolean hasExpiringSubscription = filterSubscriptionStatuses != null && filterSubscriptionStatuses.contains(SubscriptionStatus.EXPIRING_SOON);

        LocalDateTime currentDateTime = LocalDateTime.now();
        LocalDateTime expiryThreshold = currentDateTime.plusDays(filterCriteria.getExpiringSoonDays());

        Page<User> ownerPage = businessOwnerRepository.findAllBusinessOwnersWithFilters(
                filterSubscriptionStatuses,
                hasActiveSubscription,
                hasExpiredSubscription,
                hasExpiringSubscription,
                currentDateTime,
                expiryThreshold,
                filterCriteria.getAutoRenew(),
                filterCriteria.getSearch(),
                pageableRequest
        );

        List<BusinessOwnerDetailResponse> enrichedResponses = ownerPage.getContent().stream()
                .map(this::buildEnrichedDetailResponse)
                .toList();

        log.info("Business owners fetched successfully: count={}, page={}/{}, total={}",
                enrichedResponses.size(), ownerPage.getNumber() + 1, ownerPage.getTotalPages(), ownerPage.getTotalElements());

        return paginationMapper.toPaginationResponse(ownerPage, enrichedResponses);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessOwnerDetailResponse getBusinessOwnerDetail(UUID ownerId) {
        User ownerEntity = businessOwnerRepository.findBusinessOwnerById(ownerId)
                .orElseThrow(() -> {
                    log.warn("Business owner not found: owner_id={}", ownerId);
                    return new NotFoundException("Business owner not found: " + ownerId);
                });

        log.info("Business owner details retrieved successfully: owner_id={}", ownerId);
        return buildEnrichedDetailResponse(ownerEntity);
    }

    @Override
    public BusinessOwnerDetailResponse renewSubscription(UUID ownerId, BusinessOwnerSubscriptionRenewRequest renewRequestData) {
        log.info("Subscription renewal initiated: owner_id={}", ownerId);

        User ownerEntity = getOwnerOrThrow(ownerId);
        Business businessEntity = ownerEntity.getBusiness();
        Subscription currentSubscription = getCurrentSubscription(businessEntity.getId());

        SubscriptionPlan planToUse = renewRequestData.getNewPlanId() != null
                ? getPlanOrThrow(renewRequestData.getNewPlanId())
                : currentSubscription.getPlan();

        // Create a new subscription record (old one stays as history)
        LocalDateTime newStartDate = currentSubscription.isExpired()
                ? LocalDateTime.now() : currentSubscription.getEndDate();

        Subscription newSubscription = new Subscription();
        newSubscription.setBusinessId(businessEntity.getId());
        newSubscription.setPlanId(planToUse.getId());
        newSubscription.setPlan(planToUse);
        newSubscription.setStartDate(newStartDate);
        newSubscription.setEndDate(planToUse.calculateEndDate(newStartDate));
        newSubscription.setAutoRenew(currentSubscription.getAutoRenew());
        subscriptionRepository.save(newSubscription);

        // Always create a payment record for this renewal
        BigDecimal amount = renewRequestData.getPaymentAmount() != null
                ? renewRequestData.getPaymentAmount() : planToUse.getPrice();
        String method = renewRequestData.getPaymentMethod() != null && !renewRequestData.getPaymentMethod().isBlank()
                ? renewRequestData.getPaymentMethod() : PaymentMethod.CASH.name();
        createSubscriptionPaymentForRenewal(newSubscription, amount, method,
                renewRequestData.getPaymentReference(), renewRequestData.getPaymentNotes());

        businessEntity.activateSubscription();
        businessRepository.save(businessEntity);

        log.info("Subscription renewed: owner_id={}, old_subscription_id={}, new_subscription_id={}",
                ownerId, currentSubscription.getId(), newSubscription.getId());
        webSocketNotificationService.notifyPlatformEvent("BUSINESS_OWNER_CHANGED", Map.of("action", "renewed", "ownerId", ownerId.toString()));

        // Send Telegram notification
        String planName = planToUse.getName();
        String newExpiryDate = newSubscription.getEndDate().toLocalDate().toString();
        telegramNotificationService.notifySubscriptionRenewed(
            businessEntity.getId(),
            businessEntity.getName(),
            planName,
            newExpiryDate
        );

        return buildEnrichedDetailResponse(ownerEntity);
    }

    @Override
    public BusinessOwnerDetailResponse changePlan(UUID ownerId, BusinessOwnerChangePlanRequest changePlanRequestData) {
        log.info("Subscription plan change initiated: owner_id={}, new_plan_id={}", ownerId, changePlanRequestData.getNewPlanId());

        User ownerEntity = getOwnerOrThrow(ownerId);
        Business businessEntity = ownerEntity.getBusiness();
        Subscription currentSubscriptionRecord = getCurrentSubscription(businessEntity.getId());
        SubscriptionPlan newPlanEntity = getPlanOrThrow(changePlanRequestData.getNewPlanId());

        currentSubscriptionRecord.setPlan(newPlanEntity);
        currentSubscriptionRecord.setStartDate(LocalDateTime.now());
        currentSubscriptionRecord.setEndDate(newPlanEntity.calculateEndDate(LocalDateTime.now()));

        subscriptionRepository.save(currentSubscriptionRecord);

        if (changePlanRequestData.hasPaymentInfo() && changePlanRequestData.isPaymentInfoComplete()) {
            createSubscriptionPaymentForRenewal(currentSubscriptionRecord, changePlanRequestData.getPaymentAmount(),
                    changePlanRequestData.getPaymentMethod(), changePlanRequestData.getPaymentReference(), changePlanRequestData.getPaymentNotes());
        }

        log.info("Subscription plan changed successfully: owner_id={}, subscription_id={}, new_plan_id={}",
                ownerId, currentSubscriptionRecord.getId(), changePlanRequestData.getNewPlanId());
        webSocketNotificationService.notifyPlatformEvent("BUSINESS_OWNER_CHANGED", Map.of("action", "planChanged", "ownerId", ownerId.toString()));

        // Send Telegram notification
        String oldPlanName = currentSubscriptionRecord.getPlan() != null ? currentSubscriptionRecord.getPlan().getName() : "N/A";
        String newPlanName = newPlanEntity.getName();
        String newExpiryDate = currentSubscriptionRecord.getEndDate().toLocalDate().toString();
        telegramNotificationService.notifySubscriptionPlanChanged(
            businessEntity.getId(),
            businessEntity.getName(),
            oldPlanName,
            newPlanName,
            newExpiryDate
        );

        return buildEnrichedDetailResponse(ownerEntity);
    }

    @Override
    public BusinessOwnerDetailResponse cancelSubscription(UUID ownerId, BusinessOwnerSubscriptionCancelRequest cancelRequestData) {
        log.info("Subscription cancellation initiated: owner_id={}", ownerId);

        User ownerEntity = getOwnerOrThrow(ownerId);
        Business businessEntity = ownerEntity.getBusiness();
        Subscription currentSubscriptionRecord = getCurrentSubscription(businessEntity.getId());

        currentSubscriptionRecord.cancel();
        subscriptionRepository.save(currentSubscriptionRecord);

        subscriptionPaymentRepository
                .findBySubscriptionIdAndStatusAndIsDeletedFalse(
                        currentSubscriptionRecord.getId(), SubscriptionPaymentStatus.PENDING)
                .ifPresent(paymentRecord -> {
                    paymentRecord.setStatus(SubscriptionPaymentStatus.CANCELLED);
                    paymentRecord.setNotes("Cancelled: " + cancelRequestData.getReason());
                    subscriptionPaymentRepository.save(paymentRecord);
                });

        businessEntity.deactivateSubscription();
        businessRepository.save(businessEntity);

        if (cancelRequestData.hasRefundAmount()) {
            createRefundPayment(currentSubscriptionRecord, cancelRequestData);
        }

        log.info("Subscription cancelled successfully: owner_id={}, subscription_id={}, refund_issued={}",
                ownerId, currentSubscriptionRecord.getId(), cancelRequestData.hasRefundAmount());
        webSocketNotificationService.notifyPlatformEvent("BUSINESS_OWNER_CHANGED", Map.of("action", "cancelled", "ownerId", ownerId.toString()));

        // Send Telegram notification
        telegramNotificationService.notifySubscriptionCancelled(
            businessEntity.getId(),
            businessEntity.getName()
        );

        return buildEnrichedDetailResponse(ownerEntity);
    }

    @Override
    public BusinessOwnerDetailResponse updateBusinessOwner(UUID ownerId, BusinessOwnerUpdateRequest request) {
        log.info("Business owner update initiated: owner_id={}", ownerId);

        User ownerEntity = getOwnerOrThrow(ownerId);

        if (ownerEntity.getProfile() != null) {
            UserProfile profile = ownerEntity.getProfile();
            if (request.getOwnerFullName() != null) {
                String[] nameParts = request.getOwnerFullName().split(" ", 2);
                profile.setFirstName(nameParts[0]);
                profile.setLastName(nameParts.length > 1 ? nameParts[1] : "");
            }
            if (request.getOwnerEmail() != null) profile.setEmail(request.getOwnerEmail());
            if (request.getOwnerPhone() != null) profile.setPhoneNumber(request.getOwnerPhone());
        }

        if (request.getOwnerAccountStatus() != null) {
            ownerEntity.setAccountStatus(request.getOwnerAccountStatus());
        }

        ownerEntity = businessOwnerRepository.save(ownerEntity);

        Business businessEntity = ownerEntity.getBusiness();
        if (businessEntity != null) {
            if (request.getBusinessName() != null) businessEntity.setName(request.getBusinessName());
            if (request.getBusinessEmail() != null) businessEntity.setEmail(request.getBusinessEmail());
            if (request.getBusinessPhone() != null) businessEntity.setPhone(request.getBusinessPhone());
            if (request.getBusinessAddress() != null) businessEntity.setAddress(request.getBusinessAddress());
            if (request.getBusinessDescription() != null) businessEntity.setDescription(request.getBusinessDescription());
            if (request.getBusinessStatus() != null) businessEntity.setStatus(request.getBusinessStatus());
            businessRepository.save(businessEntity);
        }

        if (request.getAutoRenew() != null && ownerEntity.getBusiness() != null) {
            subscriptionRepository.findCurrentActiveByBusinessId(ownerEntity.getBusiness().getId(), LocalDateTime.now())
                    .ifPresent(sub -> {
                        sub.setAutoRenew(request.getAutoRenew());
                        subscriptionRepository.save(sub);
                    });
        }

        log.info("Business owner updated successfully: owner_id={}", ownerId);
        webSocketNotificationService.notifyPlatformEvent("BUSINESS_OWNER_CHANGED", Map.of("action", "updated", "ownerId", ownerId.toString()));
        return buildEnrichedDetailResponse(ownerEntity);
    }

    @Override
    public BusinessOwnerDetailResponse deleteBusinessOwner(UUID ownerId) {
        log.info("Business owner deletion initiated: owner_id={}", ownerId);

        User ownerEntity = getOwnerOrThrow(ownerId);
        Business businessEntity = ownerEntity.getBusiness();

        List<Subscription> subscriptionRecords = subscriptionRepository.findByBusinessIdAndIsDeletedFalse(businessEntity.getId());
        subscriptionRecords.forEach(subscriptionRecord -> {
            subscriptionRecord.softDelete();
            subscriptionRepository.save(subscriptionRecord);
        });

        businessEntity.softDelete();
        businessRepository.save(businessEntity);

        ownerEntity.softDelete();
        businessOwnerRepository.save(ownerEntity);

        log.info("Business owner deleted successfully: owner_id={}, business_id={}, subscriptions_deleted={}",
                ownerId, businessEntity.getId(), subscriptionRecords.size());
        webSocketNotificationService.notifyPlatformEvent("BUSINESS_OWNER_CHANGED", Map.of("action", "deleted", "ownerId", ownerId.toString()));
        return buildEnrichedDetailResponse(ownerEntity);
    }

    private void validateBusinessOwnerCreation(BusinessOwnerCreateRequest creationRequestData) {
        if (businessOwnerRepository.existsBusinessOwnerByEmail(creationRequestData.getOwnerEmail())) {
            log.warn("Business owner creation failed - duplicate email: email={}", creationRequestData.getOwnerEmail());
            throw new ValidationException("Email already exists: " + creationRequestData.getOwnerEmail());
        }

        if (businessRepository.existsByEmailAndIsDeletedFalse(creationRequestData.getBusinessEmail())) {
            log.warn("Business owner creation failed - duplicate business email: business_email={}", creationRequestData.getBusinessEmail());
            throw new ValidationException("Business email already exists: " + creationRequestData.getBusinessEmail());
        }

        if (!planRepository.existsById(creationRequestData.getPlanId())) {
            log.warn("Business owner creation failed - plan not found: plan_id={}", creationRequestData.getPlanId());
            throw new NotFoundException("Plan not found: " + creationRequestData.getPlanId());
        }
    }

    private Business createBusiness(BusinessOwnerCreateRequest creationRequestData) {
        Business businessEntity = new Business();
        businessEntity.setName(creationRequestData.getBusinessName());
        businessEntity.setEmail(creationRequestData.getBusinessEmail());
        businessEntity.setPhone(creationRequestData.getBusinessPhone());
        businessEntity.setAddress(creationRequestData.getBusinessAddress());
        businessEntity.setStatus(BusinessStatus.PENDING);
        return businessRepository.save(businessEntity);
    }

    private User createOwnerUser(BusinessOwnerCreateRequest creationRequestData, UUID businessId) {
        Role ownerRoleEntity = roleRepository.findByNameAndIsDeletedFalse("BUSINESS_OWNER")
                .orElseThrow(() -> {
                    log.warn("Business owner creation failed - business owner role not found");
                    return new NotFoundException("Business owner role not found");
                });

        if (!ownerRoleEntity.isCompatibleWithUserType(UserType.BUSINESS_USER)) {
            log.warn("Business owner creation failed - business owner role not compatible with user type");
            throw new ValidationException("BUSINESS_OWNER role is not properly configured for BUSINESS_USER type");
        }

        User ownerUserEntity = new User();
        ownerUserEntity.setUserIdentifier(creationRequestData.getOwnerUserIdentifier());
        ownerUserEntity.setPassword(passwordEncoder.encode(creationRequestData.getOwnerPassword()));
        ownerUserEntity.setUserType(UserType.BUSINESS_USER);
        ownerUserEntity.setAccountStatus(AccountStatus.ACTIVE);
        ownerUserEntity.setBusinessId(businessId);
        ownerUserEntity.setRoles(List.of(ownerRoleEntity));

        ownerUserEntity = businessOwnerRepository.save(ownerUserEntity);

        String[] nameParts = creationRequestData.getOwnerFullName() != null
                ? creationRequestData.getOwnerFullName().split(" ", 2)
                : new String[]{"", ""};

        UserProfile profileEntity = new UserProfile();
        profileEntity.setUser(ownerUserEntity);
        profileEntity.setEmail(creationRequestData.getOwnerEmail());
        profileEntity.setFirstName(nameParts[0]);
        profileEntity.setLastName(nameParts.length > 1 ? nameParts[1] : "");
        profileEntity.setPhoneNumber(creationRequestData.getOwnerPhone());
        ownerUserEntity.setProfile(profileEntity);

        UserEmployment employmentEntity = new UserEmployment();
        employmentEntity.setUser(ownerUserEntity);
        employmentEntity.setPosition("Owner");
        ownerUserEntity.setEmployment(employmentEntity);

        return businessOwnerRepository.save(ownerUserEntity);
    }

    private Subscription createSubscription(UUID businessId, BusinessOwnerCreateRequest creationRequestData) {
        SubscriptionPlan planEntity = planRepository.findById(creationRequestData.getPlanId())
                .orElseThrow(() -> {
                    log.warn("Subscription creation failed - plan not found: plan_id={}", creationRequestData.getPlanId());
                    return new NotFoundException("Plan not found");
                });

        Subscription subscriptionRecord = new Subscription();
        subscriptionRecord.setBusinessId(businessId);
        subscriptionRecord.setPlanId(creationRequestData.getPlanId());

        LocalDateTime startDateTime = LocalDateTime.now();
        subscriptionRecord.setStartDate(startDateTime);
        subscriptionRecord.setEndDate(planEntity.calculateEndDate(startDateTime));

        subscriptionRecord.setAutoRenew(false);

        Subscription saved = subscriptionRepository.save(subscriptionRecord);
        saved.setPlan(planEntity);
        return saved;
    }

    private SubscriptionPayment createSubscriptionPayment(Subscription subscriptionRecord, BusinessOwnerCreateRequest creationRequestData) {
        SubscriptionPayment paymentRecord = new SubscriptionPayment();
        paymentRecord.setBusinessId(subscriptionRecord.getBusinessId());
        paymentRecord.setPlanId(subscriptionRecord.getPlanId());
        paymentRecord.setSubscriptionId(subscriptionRecord.getId());
        BigDecimal planPrice = subscriptionRecord.getPlan() != null ? subscriptionRecord.getPlan().getPrice() : BigDecimal.ZERO;
        paymentRecord.setAmount(creationRequestData.getPaymentAmount() != null
                ? creationRequestData.getPaymentAmount() : planPrice);
        String method = creationRequestData.getPaymentMethod();
        paymentRecord.setPaymentMethod(method != null && !method.isBlank()
                ? PaymentMethod.valueOf(method) : PaymentMethod.CASH);
        paymentRecord.setPaymentType(SubscriptionPaymentType.SUBSCRIPTION);
        paymentRecord.setStatus(SubscriptionPaymentStatus.COMPLETED);
        paymentRecord.setReferenceNumber(creationRequestData.getPaymentReference());
        paymentRecord.setNotes(creationRequestData.getPaymentNotes());
        return subscriptionPaymentRepository.save(paymentRecord);
    }

    private void createSubscriptionPaymentForRenewal(Subscription subscriptionRecord, BigDecimal amount,
                                                     String method, String reference, String notes) {
        SubscriptionPayment paymentRecord = new SubscriptionPayment();
        paymentRecord.setBusinessId(subscriptionRecord.getBusinessId());
        paymentRecord.setPlanId(subscriptionRecord.getPlanId());
        paymentRecord.setSubscriptionId(subscriptionRecord.getId());
        paymentRecord.setAmount(amount != null ? amount : BigDecimal.ZERO);
        paymentRecord.setPaymentMethod(method != null && !method.isBlank()
                ? PaymentMethod.valueOf(method) : PaymentMethod.CASH);
        paymentRecord.setPaymentType(SubscriptionPaymentType.RENEWAL);
        paymentRecord.setStatus(SubscriptionPaymentStatus.COMPLETED);
        paymentRecord.setReferenceNumber(reference);
        paymentRecord.setNotes(notes);
        subscriptionPaymentRepository.save(paymentRecord);
    }

    private void createRefundPayment(Subscription subscriptionRecord, BusinessOwnerSubscriptionCancelRequest cancelRequestData) {
        SubscriptionPayment refundRecord = new SubscriptionPayment();
        refundRecord.setBusinessId(subscriptionRecord.getBusinessId());
        refundRecord.setPlanId(subscriptionRecord.getPlanId());
        refundRecord.setSubscriptionId(subscriptionRecord.getId());
        refundRecord.setAmount(cancelRequestData.getRefundAmount().negate());
        String refundMethodStr = cancelRequestData.getRefundMethod();
        if (refundMethodStr != null && !refundMethodStr.trim().isEmpty()) {
            try {
                refundRecord.setPaymentMethod(PaymentMethod.valueOf(refundMethodStr));
            } catch (IllegalArgumentException e) {
                refundRecord.setPaymentMethod(PaymentMethod.CASH);
            }
        } else {
            refundRecord.setPaymentMethod(PaymentMethod.CASH);
        }
        refundRecord.setPaymentType(SubscriptionPaymentType.REFUND);
        refundRecord.setStatus(SubscriptionPaymentStatus.COMPLETED);
        refundRecord.setReferenceNumber(cancelRequestData.getRefundReference());
        refundRecord.setNotes("Subscription refund processed");
        subscriptionPaymentRepository.save(refundRecord);
    }

    private BusinessOwnerDetailResponse buildEnrichedDetailResponse(User ownerEntity) {
        BusinessOwnerDetailResponse detailResponse = mapper.toDetailResponse(ownerEntity);

        if (ownerEntity.getBusiness() != null) {
            enrichDetailResponse(detailResponse, ownerEntity.getBusiness());
        }

        return detailResponse;
    }

    private void enrichDetailResponse(BusinessOwnerDetailResponse detailResponse, Business businessEntity) {
        if (businessEntity == null) return;
        enrichSubscriptionData(detailResponse, businessEntity.getId());
        enrichBusinessSettingData(detailResponse, businessEntity.getId());
    }

    private void enrichBusinessSettingData(BusinessOwnerDetailResponse detailResponse, UUID businessId) {
        businessSettingRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .ifPresent(setting -> {
                    detailResponse.setBusinessSettingId(setting.getId());
                    detailResponse.setLogoBusinessUrl(setting.getLogoBusinessUrl());
                    detailResponse.setEnableStock(setting.getEnableStock() != null ? setting.getEnableStock().name() : null);
                });
    }

    private void enrichSubscriptionData(BusinessOwnerDetailResponse detailResponse, UUID businessId) {
        subscriptionRepository.findCurrentActiveByBusinessId(businessId, LocalDateTime.now())
                .ifPresentOrElse(
                        subscriptionRecord -> populateSubscriptionInfo(detailResponse, subscriptionRecord),
                        () -> detailResponse.setSubscriptionStatus(SubscriptionStatus.EXPIRED)
                );
    }

    private void populateSubscriptionInfo(BusinessOwnerDetailResponse detailResponse, Subscription subscriptionRecord) {
        detailResponse.setCurrentSubscriptionId(subscriptionRecord.getId());
        detailResponse.setCurrentPlanId(subscriptionRecord.getPlanId());
        detailResponse.setCurrentPlanName(subscriptionRecord.getPlan().getName());
        detailResponse.setCurrentPlanPrice(subscriptionRecord.getPlan().getPrice());
        detailResponse.setCurrentPlanDurationType(subscriptionRecord.getPlan().getDurationType());
        detailResponse.setSubscriptionStartDate(subscriptionRecord.getStartDate().toLocalDate());
        detailResponse.setSubscriptionEndDate(subscriptionRecord.getEndDate().toLocalDate());
        detailResponse.setDaysRemaining(calculateDaysRemaining(subscriptionRecord.getEndDate().toLocalDate()));
        detailResponse.setDaysActive(calculateDaysActive(subscriptionRecord.getStartDate().toLocalDate()));
        detailResponse.setSubscriptionStatus(determineSubscriptionStatus(subscriptionRecord));
        detailResponse.setAutoRenew(subscriptionRecord.getAutoRenew());
    }

    private Long calculateDaysRemaining(LocalDate endDate) {
        if (endDate == null) return 0L;
        LocalDate today = LocalDate.now();
        if (today.isAfter(endDate)) return 0L;
        return ChronoUnit.DAYS.between(today, endDate);
    }

    private Long calculateDaysActive(LocalDate startDate) {
        if (startDate == null) return 0L;
        LocalDate today = LocalDate.now();
        if (today.isBefore(startDate)) return 0L;
        return ChronoUnit.DAYS.between(startDate, today);
    }

    private SubscriptionStatus determineSubscriptionStatus(Subscription subscriptionRecord) {
        if (subscriptionRecord.isExpired()) {
            return SubscriptionStatus.EXPIRED;
        }
        if (subscriptionRecord.isExpiringSoon(expirySoonDays)) {
            return SubscriptionStatus.EXPIRING_SOON;
        }
        return SubscriptionStatus.ACTIVE;
    }

    private String determinePaymentStatus(BigDecimal totalPaidAmount, BigDecimal totalPendingAmount, BigDecimal planPrice) {
        if (planPrice == null) {
            return "UNKNOWN";
        }

        if (totalPaidAmount.compareTo(planPrice) >= 0) {
            return "PAID";
        } else if (totalPaidAmount.compareTo(BigDecimal.ZERO) > 0) {
            return "PARTIALLY_PAID";
        } else if (totalPendingAmount.compareTo(BigDecimal.ZERO) > 0) {
            return "PENDING";
        }

        return "UNPAID";
    }

    private List<String> buildCreatedComponentsList(boolean hasPaymentRecord) {
        List<String> componentsList = new ArrayList<>();
        componentsList.add("Owner User");
        componentsList.add("Business Profile");
        componentsList.add("Subscription");
        if (hasPaymentRecord) {
            componentsList.add("Payment");
        }
        return componentsList;
    }

    private User getOwnerOrThrow(UUID ownerId) {
        return businessOwnerRepository.findBusinessOwnerById(ownerId)
                .orElseThrow(() -> {
                    log.warn("Business owner not found: owner_id={}", ownerId);
                    return new NotFoundException("Business owner not found: " + ownerId);
                });
    }

    private Subscription getCurrentSubscription(UUID businessId) {
        return subscriptionRepository.findCurrentActiveByBusinessId(businessId, LocalDateTime.now())
                .orElseThrow(() -> {
                    log.warn("Active subscription not found: business_id={}", businessId);
                    return new NotFoundException("No active subscription found");
                });
    }

    private SubscriptionPlan getPlanOrThrow(UUID planId) {
        return planRepository.findById(planId)
                .orElseThrow(() -> {
                    log.warn("Subscription plan not found: plan_id={}", planId);
                    return new NotFoundException("Plan not found: " + planId);
                });
    }
}
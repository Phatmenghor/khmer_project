package com.emenu.features.auth.service.impl;

import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.enums.payment.PaymentType;
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
import com.emenu.features.order.models.Payment;
import com.emenu.features.order.repository.PaymentRepository;
import com.emenu.features.subscription.models.Subscription;
import com.emenu.features.subscription.models.SubscriptionPlan;
import com.emenu.features.subscription.repository.SubscriptionPlanRepository;
import com.emenu.features.subscription.repository.SubscriptionRepository;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BusinessOwnerServiceImpl implements BusinessOwnerService {

    private final BusinessOwnerRepository businessOwnerRepository;
    private final BusinessRepository businessRepository;
    private final RoleRepository roleRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository planRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;
    private final BusinessOwnerMapper mapper;
    private final UserValidationService userValidationService;
    private final PaginationMapper paginationMapper;

    @Override
    public BusinessOwnerCreateResponse createBusinessOwner(BusinessOwnerCreateRequest creationRequestData) {
        log.info("Business owner creation initiated: business_name={}, owner_email={}",
                creationRequestData.getBusinessName(), creationRequestData.getOwnerEmail());

        validateBusinessOwnerCreation(creationRequestData);

        Business businessEntity = createBusiness(creationRequestData);
        User ownerUserEntity = createOwnerUser(creationRequestData, businessEntity.getId());

        businessEntity.setOwnerId(ownerUserEntity.getId());
        businessRepository.save(businessEntity);

        Subscription subscriptionRecord = createSubscription(businessEntity.getId(), creationRequestData);

        Payment paymentRecord = creationRequestData.hasPaymentInfo() && creationRequestData.isPaymentInfoComplete()
                ? createPayment(subscriptionRecord, creationRequestData)
                : null;

        businessEntity.activateSubscription();
        businessRepository.save(businessEntity);

        BusinessOwnerCreateResponse response = mapper.toCreateResponse(ownerUserEntity, businessEntity, subscriptionRecord, paymentRecord);
        response.setCreatedComponents(buildCreatedComponentsList(paymentRecord != null));

        log.info("Business owner created successfully: owner_id={}, business_id={}, subscription_id={}, has_payment={}",
                ownerUserEntity.getId(), businessEntity.getId(), subscriptionRecord.getId(), paymentRecord != null);
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

        List<AccountStatus> filterOwnerStatuses = (filterCriteria.getOwnerAccountStatuses() != null && !filterCriteria.getOwnerAccountStatuses().isEmpty())
                ? filterCriteria.getOwnerAccountStatuses() : null;
        List<BusinessStatus> filterBusinessStatuses = (filterCriteria.getBusinessStatuses() != null && !filterCriteria.getBusinessStatuses().isEmpty())
                ? filterCriteria.getBusinessStatuses() : null;
        List<SubscriptionStatus> filterSubscriptionStatuses = (filterCriteria.getSubscriptionStatuses() != null && !filterCriteria.getSubscriptionStatuses().isEmpty())
                ? filterCriteria.getSubscriptionStatuses() : null;
        List<PaymentStatus> filterPaymentStatuses = (filterCriteria.getPaymentStatuses() != null && !filterCriteria.getPaymentStatuses().isEmpty())
                ? filterCriteria.getPaymentStatuses() : null;

        boolean hasActiveSubscription = filterSubscriptionStatuses != null && filterSubscriptionStatuses.contains(SubscriptionStatus.ACTIVE);
        boolean hasExpiredSubscription = filterSubscriptionStatuses != null && filterSubscriptionStatuses.contains(SubscriptionStatus.EXPIRED);
        boolean hasExpiringSubscription = filterSubscriptionStatuses != null && filterSubscriptionStatuses.contains(SubscriptionStatus.EXPIRING_SOON);

        LocalDateTime currentDateTime = LocalDateTime.now();
        LocalDateTime expiryThreshold = currentDateTime.plusDays(filterCriteria.getExpiringSoonDays());

        Page<User> ownerPage = businessOwnerRepository.findAllBusinessOwnersWithFilters(
                filterOwnerStatuses,
                filterBusinessStatuses,
                filterSubscriptionStatuses,
                hasActiveSubscription,
                hasExpiredSubscription,
                hasExpiringSubscription,
                currentDateTime,
                expiryThreshold,
                filterCriteria.getAutoRenew(),
                filterPaymentStatuses,
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
        Subscription currentSubscriptionRecord = getCurrentSubscription(businessEntity.getId());

        SubscriptionPlan planToUse = renewRequestData.getNewPlanId() != null
                ? getPlanOrThrow(renewRequestData.getNewPlanId())
                : currentSubscriptionRecord.getPlan();

        currentSubscriptionRecord.setPlan(planToUse);
        currentSubscriptionRecord.renew();
        subscriptionRepository.save(currentSubscriptionRecord);

        if (renewRequestData.hasPaymentInfo() && renewRequestData.isPaymentInfoComplete()) {
            createPaymentForSubscription(currentSubscriptionRecord, renewRequestData.getPaymentAmount(),
                    renewRequestData.getPaymentMethod(), renewRequestData.getPaymentReference(), renewRequestData.getPaymentNotes());
        }

        log.info("Subscription renewed successfully: owner_id={}, subscription_id={}", ownerId, currentSubscriptionRecord.getId());
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

        if (!changePlanRequestData.shouldKeepCurrentEndDate()) {
            LocalDateTime newEndDate = currentSubscriptionRecord.getStartDate().plusDays(newPlanEntity.getDurationDays());
            currentSubscriptionRecord.setEndDate(newEndDate);
        }

        subscriptionRepository.save(currentSubscriptionRecord);

        if (changePlanRequestData.hasPaymentInfo() && changePlanRequestData.isPaymentInfoComplete()) {
            createPaymentForSubscription(currentSubscriptionRecord, changePlanRequestData.getPaymentAmount(),
                    changePlanRequestData.getPaymentMethod(), changePlanRequestData.getPaymentReference(), changePlanRequestData.getPaymentNotes());
        }

        log.info("Subscription plan changed successfully: owner_id={}, subscription_id={}, new_plan_id={}",
                ownerId, currentSubscriptionRecord.getId(), changePlanRequestData.getNewPlanId());
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

        List<Payment> pendingPaymentRecords = paymentRepository.findBySubscriptionIdAndStatusAndIsDeletedFalse(
                currentSubscriptionRecord.getId(), PaymentStatus.PENDING);

        pendingPaymentRecords.forEach(paymentRecord -> {
            paymentRecord.setStatus(PaymentStatus.CANCELLED);
            paymentRecord.setNotes("Cancelled: " + cancelRequestData.getReason());
            paymentRepository.save(paymentRecord);
        });

        businessEntity.deactivateSubscription();
        businessRepository.save(businessEntity);

        if (cancelRequestData.hasRefundAmount()) {
            createRefundPayment(currentSubscriptionRecord, cancelRequestData);
        }

        log.info("Subscription cancelled successfully: owner_id={}, subscription_id={}, refund_issued={}",
                ownerId, currentSubscriptionRecord.getId(), cancelRequestData.hasRefundAmount());
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

        Integer durationDays = creationRequestData.getCustomDurationDays() != null
                ? creationRequestData.getCustomDurationDays()
                : planEntity.getDurationDays();
        subscriptionRecord.setEndDate(startDateTime.plusDays(durationDays));

        subscriptionRecord.setAutoRenew(false);

        return subscriptionRepository.save(subscriptionRecord);
    }

    private Payment createPayment(Subscription subscriptionRecord, BusinessOwnerCreateRequest creationRequestData) {
        Payment paymentRecord = new Payment();
        paymentRecord.setBusinessId(subscriptionRecord.getBusinessId());
        paymentRecord.setPlanId(subscriptionRecord.getPlanId());
        paymentRecord.setSubscriptionId(subscriptionRecord.getId());
        paymentRecord.setAmount(creationRequestData.getPaymentAmount());
        paymentRecord.setPaymentMethod(PaymentMethod.valueOf(creationRequestData.getPaymentMethod()));
        paymentRecord.setPaymentType(PaymentType.SUBSCRIPTION);
        paymentRecord.setStatus(PaymentStatus.COMPLETED);
        paymentRecord.setReferenceNumber(creationRequestData.getPaymentReference());
        paymentRecord.setNotes(creationRequestData.getPaymentNotes());
        return paymentRepository.save(paymentRecord);
    }

    private void createPaymentForSubscription(Subscription subscriptionRecord, BigDecimal amount,
                                             String method, String reference, String notes) {
        Payment paymentRecord = new Payment();
        paymentRecord.setBusinessId(subscriptionRecord.getBusinessId());
        paymentRecord.setPlanId(subscriptionRecord.getPlanId());
        paymentRecord.setSubscriptionId(subscriptionRecord.getId());
        paymentRecord.setAmount(amount);
        paymentRecord.setPaymentMethod(PaymentMethod.valueOf(method));
        paymentRecord.setPaymentType(PaymentType.SUBSCRIPTION);
        paymentRecord.setStatus(PaymentStatus.COMPLETED);
        paymentRecord.setReferenceNumber(reference);
        paymentRecord.setNotes(notes);
        paymentRepository.save(paymentRecord);
    }

    private void createRefundPayment(Subscription subscriptionRecord, BusinessOwnerSubscriptionCancelRequest cancelRequestData) {
        Payment refundRecord = new Payment();
        refundRecord.setBusinessId(subscriptionRecord.getBusinessId());
        refundRecord.setPlanId(subscriptionRecord.getPlanId());
        refundRecord.setSubscriptionId(subscriptionRecord.getId());
        refundRecord.setAmount(cancelRequestData.getRefundAmount().negate());
        refundRecord.setPaymentMethod(PaymentMethod.valueOf(cancelRequestData.getRefundMethod()));
        refundRecord.setPaymentType(PaymentType.REFUND);
        refundRecord.setStatus(PaymentStatus.COMPLETED);
        refundRecord.setReferenceNumber(cancelRequestData.getRefundReference());
        refundRecord.setNotes("Refund: " + cancelRequestData.getReason());
        paymentRepository.save(refundRecord);
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

        if (detailResponse.getCurrentSubscriptionId() != null) {
            enrichPaymentData(detailResponse, detailResponse.getCurrentSubscriptionId());
        }
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
        detailResponse.setCurrentPlanName(subscriptionRecord.getPlan().getName());
        detailResponse.setCurrentPlanPrice(subscriptionRecord.getPlan().getPrice());
        detailResponse.setCurrentPlanDurationDays(subscriptionRecord.getPlan().getDurationDays());
        detailResponse.setSubscriptionStartDate(subscriptionRecord.getStartDate());
        detailResponse.setSubscriptionEndDate(subscriptionRecord.getEndDate());
        detailResponse.setDaysRemaining(calculateDaysRemaining(subscriptionRecord.getEndDate()));
        detailResponse.setDaysActive(calculateDaysActive(subscriptionRecord.getStartDate()));
        detailResponse.setSubscriptionStatus(determineSubscriptionStatus(subscriptionRecord));
        detailResponse.setAutoRenew(subscriptionRecord.getAutoRenew());
        detailResponse.setIsExpiringSoon(subscriptionRecord.isExpiringSoon(7));
    }

    private void enrichPaymentData(BusinessOwnerDetailResponse detailResponse, UUID subscriptionId) {
        List<Payment> paymentRecords = paymentRepository.findBySubscriptionIdAndIsDeletedFalse(subscriptionId);

        if (paymentRecords.isEmpty()) {
            setDefaultPaymentData(detailResponse);
            return;
        }

        BigDecimal totalPaidAmount = paymentRecords.stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPendingAmount = paymentRecords.stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long completedPaymentCount = paymentRecords.stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .count();

        long pendingPaymentCount = paymentRecords.stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .count();

        LocalDateTime lastPaymentDateTime = paymentRecords.stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .map(Payment::getCreatedAt)
                .max(LocalDateTime::compareTo)
                .orElse(null);

        detailResponse.setTotalPaid(totalPaidAmount);
        detailResponse.setTotalPending(totalPendingAmount);
        detailResponse.setTotalPayments(paymentRecords.size());
        detailResponse.setCompletedPayments((int) completedPaymentCount);
        detailResponse.setPendingPayments((int) pendingPaymentCount);
        detailResponse.setPaymentStatus(determinePaymentStatus(totalPaidAmount, totalPendingAmount, detailResponse.getCurrentPlanPrice()));
        detailResponse.setLastPaymentDate(lastPaymentDateTime);
    }

    private void setDefaultPaymentData(BusinessOwnerDetailResponse detailResponse) {
        detailResponse.setTotalPaid(BigDecimal.ZERO);
        detailResponse.setTotalPending(BigDecimal.ZERO);
        detailResponse.setTotalPayments(0);
        detailResponse.setCompletedPayments(0);
        detailResponse.setPendingPayments(0);
        detailResponse.setPaymentStatus("UNPAID");
        detailResponse.setLastPaymentDate(null);
    }

    private Long calculateDaysRemaining(LocalDateTime endDate) {
        if (endDate == null) return 0L;
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(endDate)) return 0L;
        return ChronoUnit.DAYS.between(now, endDate);
    }

    private Long calculateDaysActive(LocalDateTime startDate) {
        if (startDate == null) return 0L;
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(startDate)) return 0L;
        return ChronoUnit.DAYS.between(startDate, now);
    }

    private SubscriptionStatus determineSubscriptionStatus(Subscription subscriptionRecord) {
        if (subscriptionRecord.isExpired()) {
            return SubscriptionStatus.EXPIRED;
        }
        if (subscriptionRecord.isExpiringSoon(7)) {
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
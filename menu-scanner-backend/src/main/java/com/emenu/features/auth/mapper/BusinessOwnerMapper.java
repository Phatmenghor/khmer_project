package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.response.BusinessOwnerCreateResponse;
import com.emenu.features.auth.dto.response.BusinessOwnerDetailResponse;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.models.User;
import com.emenu.features.subscription.models.Subscription;
import com.emenu.features.subscription.models.SubscriptionPayment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BusinessOwnerMapper {

    @Mapping(target = "ownerId", source = "owner.id")
    @Mapping(target = "ownerUserIdentifier", source = "owner.userIdentifier")
    @Mapping(target = "ownerEmail", source = "owner.profile.email")
    @Mapping(target = "ownerFullName", expression = "java(owner.getFullName())")
    @Mapping(target = "businessId", source = "business.id")
    @Mapping(target = "businessName", source = "business.name")
    @Mapping(target = "businessEmail", source = "business.email")
    @Mapping(target = "businessStatus", source = "business.status")
    @Mapping(target = "subdomain", source = "business.subdomain")
    @Mapping(target = "subscriptionId", expression = "java(subscription != null ? subscription.getId() : null)")
    @Mapping(target = "planName", expression = "java(subscription != null && subscription.getPlan() != null ? subscription.getPlan().getName() : null)")
    @Mapping(target = "planPrice", expression = "java(subscription != null && subscription.getPlan() != null ? subscription.getPlan().getPrice() : null)")
    @Mapping(target = "planDurationType", expression = "java(subscription != null && subscription.getPlan() != null ? subscription.getPlan().getDurationType() : null)")
    @Mapping(target = "subscriptionStartDate", expression = "java(subscription != null && subscription.getStartDate() != null ? subscription.getStartDate().toLocalDate() : null)")
    @Mapping(target = "subscriptionEndDate", expression = "java(subscription != null && subscription.getEndDate() != null ? subscription.getEndDate().toLocalDate() : null)")
    @Mapping(target = "daysRemaining", expression = "java(subscription != null ? subscription.getDaysRemaining() : null)")
    @Mapping(target = "paymentId", expression = "java(payment != null ? payment.getId() : null)")
    @Mapping(target = "paymentAmount", expression = "java(payment != null ? payment.getAmount() : null)")
    @Mapping(target = "paymentStatus", expression = "java(payment != null && payment.getStatus() != null ? payment.getStatus().name() : null)")
    @Mapping(target = "paymentMethod", expression = "java(payment != null && payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : null)")
    @Mapping(target = "createdAt", source = "owner.createdAt")
    BusinessOwnerCreateResponse toCreateResponse(
            User owner,
            Business business,
            Subscription subscription,
            SubscriptionPayment payment
    );

    @Mapping(target = "ownerId", source = "id")
    @Mapping(target = "ownerUserIdentifier", source = "userIdentifier")
    @Mapping(target = "ownerEmail", source = "profile.email")
    @Mapping(target = "ownerFullName", expression = "java(owner.getFullName())")
    @Mapping(target = "ownerPhone", source = "profile.phoneNumber")
    @Mapping(target = "ownerAccountStatus", source = "accountStatus")
    @Mapping(target = "businessId", source = "business.id")
    @Mapping(target = "businessName", source = "business.name")
    @Mapping(target = "businessEmail", source = "business.email")
    @Mapping(target = "businessPhone", source = "business.phone")
    @Mapping(target = "businessAddress", source = "business.address")
    @Mapping(target = "businessStatus", source = "business.status")
    @Mapping(target = "subdomain", source = "business.subdomain")
    @Mapping(target = "isSubscriptionActive", source = "business.isSubscriptionActive")
    BusinessOwnerDetailResponse toDetailResponse(User owner);

    List<BusinessOwnerDetailResponse> toDetailResponseList(List<User> owners);
}
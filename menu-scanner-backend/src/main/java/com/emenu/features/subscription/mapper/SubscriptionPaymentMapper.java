package com.emenu.features.subscription.mapper;

import com.emenu.features.subscription.dto.request.SubscriptionPaymentCreateRequest;
import com.emenu.features.subscription.dto.response.SubscriptionPaymentResponse;
import com.emenu.features.subscription.dto.update.SubscriptionPaymentUpdateRequest;
import com.emenu.features.subscription.models.SubscriptionPayment;
import com.emenu.shared.mapper.PaginationMapper;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PaginationMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SubscriptionPaymentMapper {

    @Mapping(target = "business", ignore = true)
    @Mapping(target = "subscription", ignore = true)
    @Mapping(target = "plan", ignore = true)
    SubscriptionPayment toEntity(SubscriptionPaymentCreateRequest request);

    SubscriptionPaymentResponse toResponse(SubscriptionPayment subscriptionPayment);

    List<SubscriptionPaymentResponse> toResponseList(List<SubscriptionPayment> subscriptionPayments);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "business", ignore = true)
    @Mapping(target = "subscription", ignore = true)
    @Mapping(target = "plan", ignore = true)
    void updateEntity(SubscriptionPaymentUpdateRequest request, @MappingTarget SubscriptionPayment subscriptionPayment);

    @AfterMapping
    default void setRelationshipFields(@MappingTarget SubscriptionPaymentResponse response, SubscriptionPayment payment) {
        if (payment.getBusiness() != null) {
            response.setBusinessName(payment.getBusiness().getName());
        }
        if (payment.getPlan() != null) {
            response.setPlanName(payment.getPlan().getName());
        }
    }
}

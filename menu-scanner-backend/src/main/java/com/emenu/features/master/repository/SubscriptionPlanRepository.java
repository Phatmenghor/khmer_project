package com.emenu.features.master.repository;

import com.emenu.enums.sub_scription.SubscriptionPlanStatus;
import com.emenu.features.master.models.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, UUID>, JpaSpecificationExecutor<SubscriptionPlan> {

    Optional<SubscriptionPlan> findByIdAndIsDeletedFalse(UUID id);

    boolean existsByNameAndIsDeletedFalse(String name);

    List<SubscriptionPlan> findByStatusAndIsDeletedFalseOrderByDurationTypeAscPriceAsc(SubscriptionPlanStatus status);

    default List<SubscriptionPlan> findAllActivePlans() {
        return findByStatusAndIsDeletedFalseOrderByDurationTypeAscPriceAsc(SubscriptionPlanStatus.PUBLIC);
    }
}


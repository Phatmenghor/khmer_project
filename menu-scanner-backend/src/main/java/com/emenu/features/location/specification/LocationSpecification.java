package com.emenu.features.location.specification;

import com.emenu.features.location.models.Location;
import com.emenu.shared.specification.BaseSpecification;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class LocationSpecification extends BaseSpecification {

    public static Specification<Location> byBusinessId(UUID businessId) {
        return filterByField("businessId", businessId);
    }

    public static Specification<Location> byUserId(UUID userId) {
        return filterByField("userId", userId);
    }

    public static Specification<Location> searchByName(String search) {
        return searchByField("name", search);
    }

    public static Specification<Location> filterLocations(UUID businessId, String search) {
        return active().and(byBusinessId(businessId)).and(searchByName(search));
    }

    public static Specification<Location> filterLocationsByUser(UUID userId, String search) {
        return active().and(byUserId(userId)).and(searchByName(search));
    }
}

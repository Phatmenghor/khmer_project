package com.emenu.features.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Clean DTO for order delivery address snapshot - includes location reference and image snapshots
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDeliveryAddressDto {
    private String village;
    private String commune;
    private String district;
    private String province;
    private String streetNumber;
    private String houseNumber;
    private String note;
    private BigDecimal latitude;
    private BigDecimal longitude;

    // Location reference and images snapshot
    private UUID locationId;  // Reference to original Location entity
    private List<String> locationImages;  // Snapshot of location images at order time
}

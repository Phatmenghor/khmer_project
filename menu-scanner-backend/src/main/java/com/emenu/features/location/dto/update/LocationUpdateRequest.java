package com.emenu.features.location.dto.update;

import com.emenu.features.location.dto.request.LocationImageRequest;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class LocationUpdateRequest {
    private String village;
    private String commune;
    private String district;
    private String province;
    private String streetNumber;
    private String houseNumber;
    private String note;
    
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private BigDecimal latitude;
    
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private BigDecimal longitude;

    private Boolean isDefault;

    private List<LocationImageRequest> locationImages; // Optional images
}

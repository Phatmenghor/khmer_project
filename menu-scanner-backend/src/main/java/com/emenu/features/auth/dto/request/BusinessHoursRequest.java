package com.emenu.features.auth.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Business Hours Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessHoursRequest {
    private String day;
    private String openingTime;
    private String closingTime;
}

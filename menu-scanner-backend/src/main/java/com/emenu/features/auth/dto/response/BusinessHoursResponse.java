package com.emenu.features.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Business Hours Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessHoursResponse {
    private UUID id;
    private String day;
    private String openingTime;
    private String closingTime;
}

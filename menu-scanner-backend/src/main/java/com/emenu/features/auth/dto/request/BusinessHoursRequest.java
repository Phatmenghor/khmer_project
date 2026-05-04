package com.emenu.features.auth.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Business Hours Request DTO
 * Used for creating and updating business hours
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessHoursRequest {
    private UUID id;                    // Optional for updates
    private String day;                 // Day of week (Monday, Tuesday, etc.)
    private String openingTime;         // Opening time in HH:mm format (e.g., "08:00")
    private String closingTime;         // Closing time in HH:mm format (e.g., "22:00")
    private Boolean isClosed;           // True if closed on this day
}

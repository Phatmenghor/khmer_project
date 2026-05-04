package com.emenu.features.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Business Hours Response DTO
 * Represents business operating hours for a specific day
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessHoursResponse {
    private UUID id;                    // Unique identifier
    private String day;                 // Day of week (Monday, Tuesday, etc.)
    private String openTime;            // Opening time in HH:mm format (e.g., "08:00")
    private String closeTime;           // Closing time in HH:mm format (e.g., "22:00")
    private Boolean isClosed;           // True if closed on this day
}

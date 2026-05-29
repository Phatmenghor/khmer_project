package com.emenu.features.auth.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessHoursRequest {
    private UUID id;
    private String day;
    private String openingTime;
    private String closingTime;
}

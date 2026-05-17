package com.emenu.features.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessHoursResponse {
    private UUID id;
    private String day;
    private String openTime;
    private String closeTime;
    private Boolean isClosed;
}

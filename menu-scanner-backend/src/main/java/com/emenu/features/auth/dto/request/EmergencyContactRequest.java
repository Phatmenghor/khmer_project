package com.emenu.features.auth.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class EmergencyContactRequest {
    private UUID id;  // present = update existing, absent = create new
    private String name;
    private String phone;
    private String relationship;
}

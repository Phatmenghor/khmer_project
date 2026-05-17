package com.emenu.features.auth.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class EmergencyContactRequest {
    private UUID id;
    private String name;
    private String phone;
    private String relationship;
}

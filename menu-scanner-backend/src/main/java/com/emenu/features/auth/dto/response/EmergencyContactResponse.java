package com.emenu.features.auth.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class EmergencyContactResponse {
    private UUID id;
    private String name;
    private String phone;
    private String relationship;
}

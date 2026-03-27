package com.emenu.features.auth.dto.request;

import lombok.Data;

@Data
public class EmergencyContactRequest {
    private String name;
    private String phone;
    private String relationship;
}

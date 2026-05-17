package com.emenu.features.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailResponse extends UserResponse {

    private List<AddressResponse> addresses;
    private List<EmergencyContactResponse> emergencyContacts;
    private List<DocumentResponse> documents;
    private List<EducationResponse> educations;
}

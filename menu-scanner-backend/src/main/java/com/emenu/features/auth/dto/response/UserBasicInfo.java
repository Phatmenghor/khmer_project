package com.emenu.features.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.emenu.shared.dto.ImageUrls;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBasicInfo {
    private UUID id;
    private String userIdentifier;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private List<String> roles;
    private ImageUrls profileImage;

    @JsonProperty("fullName")
    public String getFullName() {
        if (firstName == null && lastName == null) {
            return null;
        }
        if (firstName == null) {
            return lastName;
        }
        if (lastName == null) {
            return firstName;
        }
        return (firstName + " " + lastName).trim();
    }
}

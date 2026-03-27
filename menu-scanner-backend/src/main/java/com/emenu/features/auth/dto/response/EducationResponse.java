package com.emenu.features.auth.dto.response;

import com.emenu.enums.user.EducationLevel;
import lombok.Data;

import java.util.UUID;

@Data
public class EducationResponse {
    private UUID id;
    private EducationLevel level;
    private String schoolName;
    private String fieldOfStudy;
    private String startYear;
    private String endYear;
    private Boolean isGraduated;
    private String certificateUrl;
}

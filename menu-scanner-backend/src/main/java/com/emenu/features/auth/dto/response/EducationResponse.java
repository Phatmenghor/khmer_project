package com.emenu.features.auth.dto.response;

import com.emenu.enums.user.EducationLevel;
import lombok.Data;

@Data
public class EducationResponse {
    private EducationLevel level;
    private String schoolName;
    private String fieldOfStudy;
    private String startYear;
    private String endYear;
    private Boolean isGraduated;
    private String certificateUrl;
}

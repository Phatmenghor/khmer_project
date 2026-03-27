package com.emenu.enums.user;

import lombok.Getter;

@Getter
public enum EducationLevel {
    HIGH_SCHOOL("High School"),
    DIPLOMA("Diploma"),
    BACHELOR("Bachelor"),
    MASTER("Master"),
    DOCTORATE("Doctorate");

    private final String description;

    EducationLevel(String description) {
        this.description = description;
    }
}

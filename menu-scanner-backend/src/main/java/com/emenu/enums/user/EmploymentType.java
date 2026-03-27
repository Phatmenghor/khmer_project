package com.emenu.enums.user;

import lombok.Getter;

@Getter
public enum EmploymentType {
    FULL_TIME("Full Time"),
    PART_TIME("Part Time"),
    CONTRACT("Contract");

    private final String description;

    EmploymentType(String description) {
        this.description = description;
    }
}

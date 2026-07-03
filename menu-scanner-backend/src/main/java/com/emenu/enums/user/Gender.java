package com.emenu.enums.user;

import lombok.Getter;

@Getter
public enum Gender {
    MALE("Male"),
    FEMALE("Female"),
    OTHER("Other");

    private final String description;

    Gender(String description) {
        this.description = description;
    }
}

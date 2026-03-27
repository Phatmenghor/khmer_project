package com.emenu.enums.user;

import lombok.Getter;

@Getter
public enum DocumentType {
    ID_CARD("ID Card"),
    FAMILY_BOOK("Family Book"),
    PASSPORT("Passport"),
    BIRTH_CERTIFICATE("Birth Certificate");

    private final String description;

    DocumentType(String description) {
        this.description = description;
    }
}

package com.emenu.features.auth.dto.request;

import com.emenu.enums.user.DocumentType;
import lombok.Data;

import java.util.UUID;

@Data
public class DocumentRequest {
    private UUID id;  // present = update existing, absent = create new
    private DocumentType type;
    private String number;
    private String fileUrl;
}

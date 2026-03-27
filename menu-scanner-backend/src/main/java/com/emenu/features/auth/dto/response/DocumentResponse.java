package com.emenu.features.auth.dto.response;

import com.emenu.enums.user.DocumentType;
import lombok.Data;

import java.util.UUID;

@Data
public class DocumentResponse {
    private UUID id;
    private DocumentType type;
    private String number;
    private String fileUrl;
}

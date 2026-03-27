package com.emenu.features.auth.dto.request;

import com.emenu.enums.user.DocumentType;
import lombok.Data;

@Data
public class DocumentRequest {
    private DocumentType type;
    private String number;
    private String fileUrl;
}

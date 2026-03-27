package com.emenu.features.auth.dto.response;

import com.emenu.enums.user.DocumentType;
import lombok.Data;

@Data
public class DocumentResponse {
    private DocumentType type;
    private String number;
    private String fileUrl;
}

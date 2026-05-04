package com.emenu.features.main.dto.update;

import com.emenu.enums.common.Status;
import lombok.Data;

import java.util.UUID;

@Data
public class SubcategoryUpdateRequest {
    private UUID categoryId;
    private String name;
    private String imageUrl;
    private Status status;
}

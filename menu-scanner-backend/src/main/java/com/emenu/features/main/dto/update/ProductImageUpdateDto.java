package com.emenu.features.main.dto.update;

import com.emenu.shared.dto.ImageUrls;
import lombok.Data;

import java.util.UUID;

@Data
public class ProductImageUpdateDto {
    private UUID id;
    private ImageUrls image;
    private Boolean toDelete = false;

    public boolean isExisting() {
        return id != null;
    }

    public boolean isNew() {
        return id == null;
    }

    public boolean shouldDelete() {
        return Boolean.TRUE.equals(toDelete);
    }
}
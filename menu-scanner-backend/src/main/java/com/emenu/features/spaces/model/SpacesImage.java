package com.emenu.features.spaces.model;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "spaces_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpacesImage extends BaseUUIDEntity {

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    /** Full Spaces object key — b/{businessId}/yyyy-MM-dd/name-size.webp */
    @Column(name = "object_key", nullable = false, length = 500)
    private String objectKey;

    /** Public CDN URL */
    @Column(name = "url", nullable = false, length = 1000)
    private String url;

    /** sm | md | lg | o */
    @Column(name = "size", length = 10)
    private String size;

    /** e.g. product, category, logo, banner, qr, staff — optional label */
    @Column(name = "entity_type", length = 50)
    private String entityType;

    /** ID of the entity this image belongs to — optional */
    @Column(name = "entity_id", length = 100)
    private String entityId;

    /** Original filename from the upload */
    @Column(name = "original_filename", length = 255)
    private String originalFilename;

    /** File size in bytes */
    @Column(name = "file_size")
    private Long fileSize;
}

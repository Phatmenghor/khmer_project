package com.emenu.features.spaces.model;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "spaces_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpacesImage extends BaseUUIDEntity {

    /** e.g. "emenu", "ab" — comes from the API key */
    @Column(name = "project_code", nullable = false, length = 100)
    private String projectCode;

    /**
     * The resolved path: the API key's path, with the optional customPath appended.
     * e.g. "b/abc-123", "owner", "customer".
     */
    @Column(name = "path", nullable = false, length = 255)
    private String path;

    @Column(name = "object_key", nullable = false, length = 500)
    private String objectKey;

    @Column(name = "url", nullable = false, length = 1000)
    private String url;

    @Column(name = "original_filename", length = 255)
    private String originalFilename;

    @Column(name = "file_size")
    private Long fileSize;
}

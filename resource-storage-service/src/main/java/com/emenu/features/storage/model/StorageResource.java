package com.emenu.features.storage.model;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "storage_resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StorageResource extends BaseUUIDEntity {

    @Column(name = "project_code", nullable = false, length = 100)
    private String projectCode;

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

package com.emenu.features.storage.model;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "storage_base64")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StorageBase64 extends BaseUUIDEntity {

    @Column(name = "object_key", nullable = false, unique = true, length = 500)
    private String objectKey;

    @Column(name = "content", columnDefinition = "text", nullable = false)
    private String content; // Base64 encoded string
}

package com.emenu.features.auth.models;

import com.emenu.enums.user.DocumentType;
import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_documents",
        indexes = {
                @Index(name = "idx_user_documents_user_id",       columnList = "user_id"),
                // Composite for soft-delete filter: WHERE user_id = ? AND is_deleted = false
                @Index(name = "idx_user_documents_user_deleted",  columnList = "user_id, is_deleted"),
        }
)
@Data
@EqualsAndHashCode(callSuper = true, exclude = "user")
@ToString(exclude = "user")
@NoArgsConstructor
@AllArgsConstructor
public class UserDocument extends BaseUUIDEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private DocumentType type;

    @Column(name = "number")
    private String number;

    @Column(name = "file_url", columnDefinition = "TEXT")
    private String fileUrl;
}

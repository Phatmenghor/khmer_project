package com.emenu.features.master.dto.response;

import com.emenu.enums.common.Status;
import com.emenu.shared.dto.ImageUrls;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformBankResponse {

    private UUID id;
    private String name;
    private String accountName;
    private String accountNumber;
    private String description;
    private Status status;
    private Integer displayOrder;
    private ImageUrls image;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.emenu.features.master.dto.request;

import com.emenu.enums.common.Status;
import com.emenu.shared.dto.ImageUrls;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformBankRequest {

    @NotBlank(message = "Bank name is required")
    private String name;

    @NotBlank(message = "Account name is required")
    private String accountName;

    @NotBlank(message = "Account number is required")
    private String accountNumber;

    private String description;
    private Status status;
    private Integer displayOrder;
    private ImageUrls image;
}

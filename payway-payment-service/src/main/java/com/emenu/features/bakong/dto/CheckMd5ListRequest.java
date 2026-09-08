package com.emenu.features.bakong.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckMd5ListRequest {

    @NotEmpty(message = "MD5 list must not be empty")
    @Size(max = 50, message = "Maximum 50 MD5 items per request")
    private List<String> md5List;
}

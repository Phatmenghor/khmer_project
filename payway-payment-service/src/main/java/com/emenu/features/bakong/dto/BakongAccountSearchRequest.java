package com.emenu.features.bakong.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BakongAccountSearchRequest {
    private String search;
    private Integer pageNo;
    private Integer pageSize;
}

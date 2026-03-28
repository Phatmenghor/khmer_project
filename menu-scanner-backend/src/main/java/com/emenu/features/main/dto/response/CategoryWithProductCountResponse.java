package com.emenu.features.main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryWithProductCountResponse extends CategoryResponse {
    private Long totalProducts = 0L;
    private Long activeProducts = 0L;
}

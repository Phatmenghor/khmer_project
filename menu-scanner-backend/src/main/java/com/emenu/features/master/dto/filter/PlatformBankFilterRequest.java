package com.emenu.features.master.dto.filter;

import com.emenu.enums.common.Status;
import com.emenu.shared.dto.BaseFilterRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PlatformBankFilterRequest extends BaseFilterRequest {

    private Status status;
}

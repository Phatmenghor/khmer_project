package com.emenu.features.bakong.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BakongResponse {

    private int responseCode;
    private String responseMessage;
    private Integer errorCode;
    private Object data;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    public boolean isSuccess() {
        return responseCode == 0;
    }
}

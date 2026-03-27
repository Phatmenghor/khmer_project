package com.emenu.features.auth.dto.response;

import lombok.Data;

@Data
public class AddressResponse {
    private String houseNo;
    private String street;
    private String village;
    private String commune;
    private String district;
    private String province;
    private String country;
}

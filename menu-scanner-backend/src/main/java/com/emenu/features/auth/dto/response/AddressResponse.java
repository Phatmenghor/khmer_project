package com.emenu.features.auth.dto.response;

import com.emenu.enums.user.AddressType;
import lombok.Data;

@Data
public class AddressResponse {
    private AddressType addressType;
    private String houseNo;
    private String street;
    private String village;
    private String commune;
    private String district;
    private String province;
    private String country;
}

package com.emenu.features.bakong.dto;

import com.emenu.features.bakong.validation.ValidBakongRequest;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import kh.gov.nbc.bakong_khqr.model.KHQRCurrency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ValidBakongRequest
public class BakongRequest {

    @Builder.Default
    private KHQRCurrency currency = KHQRCurrency.KHR;

    @NotNull(message = "amount is required")
    @Positive(message = "amount must be greater than 0")
    private Double amount;

    @Builder.Default
    private String merchantName = "DEFAULT MERCHANT";

    @Builder.Default
    private String merchantCity = "PHNOM PENH";

    @Builder.Default
    private String merchantId = "DEFAULT MERCHANT ID";

    @Builder.Default
    private String acquiringBank = "DEFAULT BANK";

    private String upiAccountInformation;

    @Builder.Default
    private Integer expirationTimestamp = 15;

    @Builder.Default
    private String billNumber = "BILL123456";

    @Builder.Default
    private String storeLabel = "STORE";

    @Builder.Default
    private String terminalLabel = "TERMINAL1";

    @Builder.Default
    private String mobileNumber = "012345678";

    @Builder.Default
    private String purposeOfTransaction = "Payment";

    @Builder.Default
    private String merchantAlternateLanguagePreference = "km";

    @Builder.Default
    private String merchantNameAlternateLanguage = "អ្នកលក់";

    @Builder.Default
    private String merchantCityAlternateLanguage = "ភ្នំពេញ";

    public KHQRCurrency currency() { return getCurrency() != null ? getCurrency() : KHQRCurrency.KHR; }
    public Double amount() { return getAmount(); }
    public String merchantName() { return getMerchantName() != null ? getMerchantName() : "DEFAULT MERCHANT"; }
    public String merchantCity() { return getMerchantCity() != null ? getMerchantCity() : "PHNOM PENH"; }
    public String merchantId() { return getMerchantId() != null ? getMerchantId() : "DEFAULT MERCHANT ID"; }
    public String acquiringBank() { return getAcquiringBank() != null ? getAcquiringBank() : "DEFAULT BANK"; }
    public String upiAccountInformation() { return getUpiAccountInformation(); }
    public Integer expirationTimestamp() { return getExpirationTimestamp() != null ? getExpirationTimestamp() : 15; }
    public String billNumber() { return getBillNumber() != null ? getBillNumber() : "BILL123456"; }
    public String storeLabel() { return getStoreLabel() != null ? getStoreLabel() : "STORE"; }
    public String terminalLabel() { return getTerminalLabel() != null ? getTerminalLabel() : "TERMINAL1"; }
    public String mobileNumber() { return getMobileNumber() != null ? getMobileNumber() : "012345678"; }
    public String purposeOfTransaction() { return getPurposeOfTransaction() != null ? getPurposeOfTransaction() : "Payment"; }
    public String merchantAlternateLanguagePreference() { return getMerchantAlternateLanguagePreference() != null ? getMerchantAlternateLanguagePreference() : "km"; }
    public String merchantNameAlternateLanguage() { return getMerchantNameAlternateLanguage() != null ? getMerchantNameAlternateLanguage() : "អ្នកលក់"; }
    public String merchantCityAlternateLanguage() { return getMerchantCityAlternateLanguage() != null ? getMerchantCityAlternateLanguage() : "ភ្នំពេញ"; }
}

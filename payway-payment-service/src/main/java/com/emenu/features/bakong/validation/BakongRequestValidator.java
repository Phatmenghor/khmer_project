package com.emenu.features.bakong.validation;

import com.emenu.features.bakong.dto.BakongRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import kh.gov.nbc.bakong_khqr.model.KHQRCurrency;

public class BakongRequestValidator implements ConstraintValidator<ValidBakongRequest, BakongRequest> {

    @Override
    public boolean isValid(BakongRequest value, ConstraintValidatorContext context) {
        if (value == null || value.getAmount() == null) {
            return true;
        }

        KHQRCurrency currency = value.getCurrency() == null ? KHQRCurrency.KHR : value.getCurrency();
        if (currency == KHQRCurrency.KHR && value.getAmount() % 1 != 0) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("KHR amount must be a whole number. Use USD for fractional amounts.")
                    .addPropertyNode("amount")
                    .addConstraintViolation();
            return false;
        }

        return true;
    }
}

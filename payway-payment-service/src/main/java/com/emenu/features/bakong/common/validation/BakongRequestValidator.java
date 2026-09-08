package com.emenu.features.bakong.common.validation;

import com.emenu.features.bakong.dto.BakongRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import kh.gov.nbc.bakong_khqr.model.KHQRCurrency;

public class BakongRequestValidator implements ConstraintValidator<ValidBakongRequest, BakongRequest> {

    @Override
    public boolean isValid(BakongRequest request, ConstraintValidatorContext context) {
        if (request == null) {
            return true;
        }

        context.disableDefaultConstraintViolation();

        if (request.getCurrency() == null) {
            context.buildConstraintViolationWithTemplate("Currency must not be null")
                    .addPropertyNode("currency")
                    .addConstraintViolation();
            return false;
        }

        if (request.getAmount() == null || request.getAmount() <= 0) {
            context.buildConstraintViolationWithTemplate("Amount must be greater than zero")
                    .addPropertyNode("amount")
                    .addConstraintViolation();
            return false;
        }

        if (request.getCurrency() == KHQRCurrency.USD && request.getAmount() < 0.01) {
            context.buildConstraintViolationWithTemplate("USD amount must be at least 0.01")
                    .addPropertyNode("amount")
                    .addConstraintViolation();
            return false;
        }

        if (request.getCurrency() == KHQRCurrency.KHR && request.getAmount() < 100) {
            context.buildConstraintViolationWithTemplate("KHR amount must be at least 100")
                    .addPropertyNode("amount")
                    .addConstraintViolation();
            return false;
        }

        return true;
    }
}

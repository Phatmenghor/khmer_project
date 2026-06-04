package com.emenu.enums.payment;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class PaymentStatusConverter implements AttributeConverter<PaymentStatus, String> {

    @Override
    public String convertToDatabaseColumn(PaymentStatus status) {
        return status != null ? status.name() : null;
    }

    @Override
    public PaymentStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        switch (dbData) {
            case "PAID":      return PaymentStatus.PAID;
            case "UNPAID":    return PaymentStatus.UNPAID;
            case "REFUNDED":  return PaymentStatus.REFUNDED;
            // Legacy values — map to nearest equivalent
            case "PENDING":   return PaymentStatus.UNPAID;
            case "COMPLETED": return PaymentStatus.PAID;
            case "FAILED":    return PaymentStatus.UNPAID;
            case "CANCELLED": return PaymentStatus.UNPAID;
            default:          return PaymentStatus.UNPAID;
        }
    }
}

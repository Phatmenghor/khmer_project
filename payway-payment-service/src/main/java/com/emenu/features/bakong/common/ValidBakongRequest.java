package com.emenu.features.bakong.common;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = BakongRequestValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidBakongRequest {
    String message() default "Invalid Bakong KHQR request payload";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

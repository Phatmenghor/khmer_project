package com.emenu.config;

import com.emenu.shared.logging.ControllerLoggingInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.beans.PropertyEditorSupport;

/**
 * Global Spring MVC configuration that:
 * 1. Registers ControllerLoggingInterceptor for Controller Class & Method correlation
 * 2. Trims whitespace from all @RequestParam, @PathVariable, and form-field String values.
 */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final ControllerLoggingInterceptor controllerLoggingInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(controllerLoggingInterceptor);
    }

    /**
     * Applies a global {@link StringTrimmerEditor} to every controller via
     * {@code @RestControllerAdvice}, so no per-controller {@code @InitBinder} is needed.
     */
    @RestControllerAdvice
    static class GlobalInitBinder {

        @InitBinder
        public void initBinder(WebDataBinder binder) {
            // emptyAsNull=true: blank/whitespace-only strings become null
            binder.registerCustomEditor(String.class, new StringTrimmerEditor(true));
        }
    }

    /**
     * Lightweight property editor that trims a String and optionally converts
     * blank strings to {@code null}.
     */
    private static class StringTrimmerEditor extends PropertyEditorSupport {

        private final boolean emptyAsNull;

        StringTrimmerEditor(boolean emptyAsNull) {
            this.emptyAsNull = emptyAsNull;
        }

        @Override
        public void setAsText(String text) {
            if (text == null) {
                setValue(null);
                return;
            }
            String trimmed = text.trim();
            setValue((emptyAsNull && trimmed.isEmpty()) ? null : trimmed);
        }

        @Override
        public String getAsText() {
            Object value = getValue();
            return value != null ? value.toString() : "";
        }
    }
}

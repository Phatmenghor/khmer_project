package com.emenu.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.beans.PropertyEditorSupport;

/**
 * Global Spring MVC configuration that trims whitespace from all
 * {@code @RequestParam}, {@code @PathVariable}, and form-field {@code String} values.
 *
 * <p>Works alongside {@link StringTrimDeserializer} (which covers {@code @RequestBody} JSON)
 * to ensure <em>every</em> string that enters the application is whitespace-free before
 * it reaches any controller method.</p>
 *
 * <p>Behaviour:
 * <ul>
 *   <li>{@code ?name=+%20hello%20+} → {@code "hello"}</li>
 *   <li>{@code ?name=+++} (blank) → {@code null}</li>
 *   <li>Missing param ({@code null}) → {@code null}</li>
 * </ul>
 * </p>
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

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

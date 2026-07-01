package com.emenu.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;

/**
 * Global Jackson deserializer that trims leading/trailing whitespace from every
 * JSON String field automatically.
 *
 * <p>Registered via {@link ApplicationConfig#objectMapper()} so it applies to
 * every {@code @RequestBody} DTO across the entire application without any
 * per-field or per-class annotation.</p>
 *
 * <p>Behaviour:
 * <ul>
 *   <li>{@code "  hello  "} → {@code "hello"}</li>
 *   <li>{@code "   "} (blank) → {@code null}</li>
 *   <li>{@code null} → {@code null}</li>
 * </ul>
 * </p>
 */
public class StringTrimDeserializer extends JsonDeserializer<String> {

    @Override
    public String deserialize(JsonParser p, DeserializationContext ctx) throws IOException {
        String value = p.getValueAsString();
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}

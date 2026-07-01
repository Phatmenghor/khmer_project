package com.emenu.shared.domain;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * JPA entity listener that trims all {@link String} fields before every
 * {@code INSERT} ({@link PrePersist}) and {@code UPDATE} ({@link PreUpdate}).
 *
 * <p>This is the final safety net in the trim pipeline:
 * <ol>
 *   <li>JSON body  → trimmed by {@code StringTrimDeserializer} (Jackson)</li>
 *   <li>@RequestParam → trimmed by {@code WebMvcConfig} (InitBinder)</li>
 *   <li>Database write → trimmed here (JPA listener, catches anything missed above)</li>
 * </ol>
 * </p>
 *
 * <p>Registration: add {@code @EntityListeners(StringTrimEntityListener.class)} to
 * {@link BaseUUIDEntity} so every entity in the application inherits it automatically.</p>
 *
 * <p>Behaviour:
 * <ul>
 *   <li>{@code "  hello  "} → {@code "hello"}</li>
 *   <li>{@code "   "} (blank) → {@code null}</li>
 *   <li>{@code null} → {@code null} (unchanged)</li>
 * </ul>
 * </p>
 */
@Slf4j
public class StringTrimEntityListener {

    // Cache reflected fields per class to avoid repeated reflection on every save
    private static final Map<Class<?>, List<Field>> FIELD_CACHE = new ConcurrentHashMap<>();

    @PrePersist
    @PreUpdate
    public void trimStringFields(Object entity) {
        if (entity == null) return;
        List<Field> fields = getStringFields(entity.getClass());
        for (Field field : fields) {
            try {
                String value = (String) field.get(entity);
                if (value == null) continue;
                String trimmed = value.trim();
                field.set(entity, trimmed.isEmpty() ? null : trimmed);
            } catch (IllegalAccessException e) {
                log.debug("Could not trim field [{}.{}]: {}",
                        entity.getClass().getSimpleName(), field.getName(), e.getMessage());
            }
        }
    }

    /**
     * Collects all {@link String} fields from the class hierarchy (entity + all superclasses),
     * makes them accessible, and caches the result.
     */
    private static List<Field> getStringFields(Class<?> clazz) {
        return FIELD_CACHE.computeIfAbsent(clazz, c -> {
            List<Field> fields = new ArrayList<>();
            Class<?> cursor = c;
            while (cursor != null && cursor != Object.class) {
                for (Field field : cursor.getDeclaredFields()) {
                    if (field.getType() == String.class) {
                        field.setAccessible(true);
                        fields.add(field);
                    }
                }
                cursor = cursor.getSuperclass();
            }
            return fields;
        });
    }
}

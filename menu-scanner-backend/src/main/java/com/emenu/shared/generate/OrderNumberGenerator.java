package com.emenu.shared.generate;

import com.emenu.features.order.models.OrderCounter;
import com.emenu.features.order.repository.OrderCounterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.function.Predicate;

/**
 * Utility class for generating unique order numbers.
 * Pattern: ORD-YYYYMMDD-XXX where XXX is a database-backed counter per business per day.
 * Counter grows: 001 → 999 → 1000 → 9999 → 10000 onwards (unlimited).
 * Each business has its own independent sequence.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class OrderNumberGenerator {

    private final OrderCounterRepository orderCounterRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final String ORDER_PREFIX = "ORD";

    /**
     * Generate a unique order number with per-business counter.
     * Counter is per-business-per-day and grows dynamically: 001 → 999 → 1000 → 9999 → 10000 onwards.
     *
     * @param businessId UUID of the business
     * @return Unique order number in format ORD-YYYYMMDD-XXX (where XXX can be 3, 4, 5+ digits)
     */
    @Transactional
    public String generateOrderNumber(java.util.UUID businessId) {
        LocalDate today = LocalDate.now();

        // Get or create counter for this business on today's date
        OrderCounter counter = orderCounterRepository.findByBusinessIdAndCounterDate(businessId, today)
                .orElseGet(() -> {
                    OrderCounter newCounter = new OrderCounter();
                    newCounter.setBusinessId(businessId);
                    newCounter.setCounterDate(today);
                    newCounter.setCounterValue(0L);
                    return orderCounterRepository.save(newCounter);
                });

        // Increment counter
        counter.setCounterValue(counter.getCounterValue() + 1);
        OrderCounter savedCounter = orderCounterRepository.save(counter);

        String date = today.format(DATE_FORMATTER);
        // Dynamic format: 001-999 (3 digits), 1000-9999 (4 digits), 10000+ (5+ digits)
        return String.format("%s-%s-%03d", ORDER_PREFIX, date, savedCounter.getCounterValue());
    }

    /**
     * Generate a unique order number with uniqueness check.
     * For legacy compatibility - uses per-business counter.
     *
     * @param businessId UUID of the business
     * @param existsChecker Predicate to check if order number already exists
     * @return Unique order number in format ORD-YYYYMMDD-XXXXX
     */
    @Transactional
    public String generateUniqueOrderNumber(java.util.UUID businessId, Predicate<String> existsChecker) {
        String orderNumber = generateOrderNumber(businessId);

        // Check if order number exists (should rarely happen with database sequence)
        int attempts = 0;
        final int maxAttempts = 5;

        while (existsChecker.test(orderNumber) && attempts < maxAttempts) {
            orderNumber = generateOrderNumber(businessId);
            attempts++;
        }

        if (attempts > 0) {
            log.warn("Had to retry order number generation {} times for business {}", attempts, businessId);
        }

        log.debug("Generated order number: {} for business: {}", orderNumber, businessId);
        return orderNumber;
    }

    /**
     * Legacy method for backward compatibility - defaults to first parameter as businessId
     *
     * @return Unique order number in format ORD-YYYYMMDD-XXXXX
     */
    @Transactional
    public String generateOrderNumber() {
        // This method should not be called directly - use generateOrderNumber(businessId) instead
        throw new IllegalStateException("Use generateOrderNumber(UUID businessId) to generate per-business order numbers");
    }
}

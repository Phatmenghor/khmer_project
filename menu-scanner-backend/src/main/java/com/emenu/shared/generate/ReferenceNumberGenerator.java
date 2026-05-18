package com.emenu.shared.generate;

import com.emenu.shared.models.ReferenceCounter;
import com.emenu.shared.repository.ReferenceCounterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
@Slf4j
@RequiredArgsConstructor
public class ReferenceNumberGenerator {

    private final ReferenceCounterRepository referenceCounterRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    public enum EntityType {
        ORDER("ORD"),
        LEAVE("LEV"),
        ATTENDANCE("ATT"),
        CHECK_IN("CHK");

        private final String prefix;

        EntityType(String prefix) {
            this.prefix = prefix;
        }

        public String getPrefix() {
            return prefix;
        }
    }

    @Transactional
    public String generateReferenceNumber(EntityType entityType) {
        LocalDate today = LocalDate.now();

        // Get or create counter for entity type and date
        ReferenceCounter counter = referenceCounterRepository
                .findByEntityTypeAndCounterDate(entityType.name(), today)
                .orElseGet(() -> {
                    ReferenceCounter newCounter = new ReferenceCounter();
                    newCounter.setEntityType(entityType.name());
                    newCounter.setCounterDate(today);
                    newCounter.setCounterValue(0L);
                    return referenceCounterRepository.save(newCounter);
                });

        // Increment counter
        counter.setCounterValue(counter.getCounterValue() + 1);
        ReferenceCounter savedCounter = referenceCounterRepository.save(counter);

        String date = today.format(DATE_FORMATTER);
        return String.format("%s-%s-%06d", entityType.getPrefix(), date, savedCounter.getCounterValue());
    }

    @Transactional
    public String generateOrderNumber() {
        return generateReferenceNumber(EntityType.ORDER);
    }

    @Transactional
    public String generateLeaveNumber() {
        return generateReferenceNumber(EntityType.LEAVE);
    }

    @Transactional
    public String generateAttendanceNumber() {
        return generateReferenceNumber(EntityType.ATTENDANCE);
    }

    @Transactional
    public String generateCheckInNumber() {
        return generateReferenceNumber(EntityType.CHECK_IN);
    }
}

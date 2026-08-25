package com.emenu.features.counter;

import com.emenu.features.counter.models.AttendanceCheckInCounter;
import com.emenu.features.counter.models.AttendanceCounter;
import com.emenu.features.counter.models.LeaveCounter;
import com.emenu.features.counter.models.OrderCounter;
import com.emenu.features.counter.repository.AttendanceCheckInCounterRepository;
import com.emenu.features.counter.repository.AttendanceCounterRepository;
import com.emenu.features.counter.repository.LeaveCounterRepository;
import com.emenu.features.counter.repository.OrderCounterRepository;
import com.emenu.shared.models.ReferenceCounter;
import com.emenu.shared.repository.ReferenceCounterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.function.Predicate;

@Component
@Slf4j
@RequiredArgsConstructor
public class ReferenceNumberGenerator {

    private final ReferenceCounterRepository referenceCounterRepository;
    private final OrderCounterRepository orderCounterRepository;
    private final LeaveCounterRepository leaveCounterRepository;
    private final AttendanceCounterRepository attendanceCounterRepository;
    private final AttendanceCheckInCounterRepository attendanceCheckInCounterRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final String ORDER_PREFIX = "ORD";

    public enum EntityType {
        ORDER("ORD"),
        LEAVE("LV"),
        ATTENDANCE("ATT"),
        CHECK_IN("CHK"),
        TABLE_SESSION("SESS");

        private final String prefix;

        EntityType(String prefix) {
            this.prefix = prefix;
        }

        public String getPrefix() {
            return prefix;
        }
    }

    /**
     * Generate a unique leave reference number scoped per business per day using leave_counters table.
     * Format: LV-YYYYMMDD-XXX (starts at 001)
     */
    @Transactional
    public String generateLeaveNumber(UUID businessId) {
        LocalDate today = LocalDate.now();

        LeaveCounter counter = leaveCounterRepository.findByBusinessIdAndCounterDate(businessId, today)
                .orElseGet(() -> {
                    LeaveCounter newCounter = new LeaveCounter();
                    newCounter.setBusinessId(businessId);
                    newCounter.setCounterDate(today);
                    newCounter.setCounterValue(0L);
                    return leaveCounterRepository.save(newCounter);
                });

        counter.setCounterValue(counter.getCounterValue() + 1);
        LeaveCounter savedCounter = leaveCounterRepository.save(counter);

        String date = today.format(DATE_FORMATTER);
        return String.format("LV-%s-%03d", date, savedCounter.getCounterValue());
    }

    /**
     * Generate a unique order number with per-business counter using order_counters table.
     */
    @Transactional
    public String generateOrderNumber(UUID businessId) {
        LocalDate today = LocalDate.now();

        OrderCounter counter = orderCounterRepository.findByBusinessIdAndCounterDate(businessId, today)
                .orElseGet(() -> {
                    OrderCounter newCounter = new OrderCounter();
                    newCounter.setBusinessId(businessId);
                    newCounter.setCounterDate(today);
                    newCounter.setCounterValue(0L);
                    return orderCounterRepository.save(newCounter);
                });

        counter.setCounterValue(counter.getCounterValue() + 1);
        OrderCounter savedCounter = orderCounterRepository.save(counter);

        String date = today.format(DATE_FORMATTER);
        return String.format("%s-%s-%03d", ORDER_PREFIX, date, savedCounter.getCounterValue());
    }

    /**
     * Generate a unique table session number using order_counters table.
     * Format: Table01-YYYYMMDD-002
     */
    @Transactional
    public String generateSessionNumber(UUID businessId, String tableNumber) {
        String cleanTable = tableNumber != null ? tableNumber.trim() : "01";
        String tableFormatted = cleanTable.toLowerCase().startsWith("table")
                ? "Table" + cleanTable.substring(5).replaceAll("\\s+", "")
                : "Table" + cleanTable.replaceAll("\\s+", "");

        LocalDate today = LocalDate.now();
        String date = today.format(DATE_FORMATTER);

        OrderCounter counter = orderCounterRepository.findByBusinessIdAndCounterDate(businessId, today)
                .orElseGet(() -> {
                    OrderCounter newCounter = new OrderCounter();
                    newCounter.setBusinessId(businessId);
                    newCounter.setCounterDate(today);
                    newCounter.setCounterValue(0L);
                    return orderCounterRepository.save(newCounter);
                });

        counter.setCounterValue(counter.getCounterValue() + 1);
        OrderCounter savedCounter = orderCounterRepository.save(counter);

        return String.format("%s-%s-%03d", tableFormatted, date, savedCounter.getCounterValue());
    }

    /**
     * Generate a unique order number with uniqueness check.
     */
    @Transactional
    public String generateUniqueOrderNumber(UUID businessId, Predicate<String> existsChecker) {
        String orderNumber = generateOrderNumber(businessId);
        int attempts = 0;
        while (existsChecker.test(orderNumber) && attempts < 10) {
            orderNumber = generateOrderNumber(businessId);
            attempts++;
        }
        return orderNumber;
    }

    /**
     * Generate a unique attendance reference number scoped per business per day using attendance_counters table.
     * Format: ATT-YYYYMMDD-XXX (starts at 001)
     */
    @Transactional
    public String generateAttendanceNumber(UUID businessId) {
        LocalDate today = LocalDate.now();

        AttendanceCounter counter = attendanceCounterRepository.findByBusinessIdAndCounterDate(businessId, today)
                .orElseGet(() -> {
                    AttendanceCounter newCounter = new AttendanceCounter();
                    newCounter.setBusinessId(businessId);
                    newCounter.setCounterDate(today);
                    newCounter.setCounterValue(0L);
                    return attendanceCounterRepository.save(newCounter);
                });

        counter.setCounterValue(counter.getCounterValue() + 1);
        AttendanceCounter savedCounter = attendanceCounterRepository.save(counter);

        String date = today.format(DATE_FORMATTER);
        return String.format("ATT-%s-%03d", date, savedCounter.getCounterValue());
    }

    /**
     * Generate a unique check-in reference number scoped per business per day using attendance_check_in_counters table.
     * Format: CHK-YYYYMMDD-XXX (starts at 001)
     */
    @Transactional
    public String generateCheckInNumber(UUID businessId) {
        LocalDate today = LocalDate.now();

        AttendanceCheckInCounter counter = attendanceCheckInCounterRepository.findByBusinessIdAndCounterDate(businessId, today)
                .orElseGet(() -> {
                    AttendanceCheckInCounter newCounter = new AttendanceCheckInCounter();
                    newCounter.setBusinessId(businessId);
                    newCounter.setCounterDate(today);
                    newCounter.setCounterValue(0L);
                    return attendanceCheckInCounterRepository.save(newCounter);
                });

        counter.setCounterValue(counter.getCounterValue() + 1);
        AttendanceCheckInCounter savedCounter = attendanceCheckInCounterRepository.save(counter);

        String date = today.format(DATE_FORMATTER);
        return String.format("CHK-%s-%03d", date, savedCounter.getCounterValue());
    }

    /**
     * Global/General fallback reference number generator (legacy support).
     */
    @Transactional
    public String generateReferenceNumber(EntityType entityType) {
        LocalDate today = LocalDate.now();

        ReferenceCounter counter = referenceCounterRepository
                .findByEntityTypeAndCounterDate(entityType.name(), today)
                .orElseGet(() -> {
                    ReferenceCounter newCounter = new ReferenceCounter();
                    newCounter.setEntityType(entityType.name());
                    newCounter.setCounterDate(today);
                    newCounter.setCounterValue(0L);
                    return referenceCounterRepository.save(newCounter);
                });

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
    public String generateTableSessionNumber() {
        return generateReferenceNumber(EntityType.TABLE_SESSION);
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

package com.emenu.features.hr.scheduler;

import com.emenu.features.hr.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AttendanceScheduler {

    private final AttendanceService attendanceService;

    /**
     * Runs every night at 00:00:00 AM (Midnight)
     * Automatically processes daily absences for past dates (< 2 days: yesterday & day before yesterday)
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void processMidnightDailyAbsences() {
        log.info("Scheduled trigger: Running midnight attendance absence evaluation...");
        try {
            attendanceService.processDailyAbsences();
        } catch (Exception e) {
            log.error("Error during scheduled midnight attendance absence evaluation: {}", e.getMessage(), e);
        }
    }
}

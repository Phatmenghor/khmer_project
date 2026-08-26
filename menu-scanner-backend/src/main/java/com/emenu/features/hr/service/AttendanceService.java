package com.emenu.features.hr.service;

import com.emenu.features.hr.dto.filter.AttendanceFilterRequest;
import com.emenu.features.hr.dto.request.AttendanceCheckInRequest;
import com.emenu.features.hr.dto.response.AttendanceResponse;
import com.emenu.features.hr.dto.update.AttendanceUpdateRequest;
import com.emenu.shared.dto.PaginationResponse;

import java.util.List;
import java.util.UUID;

public interface AttendanceService {
    AttendanceResponse checkIn(AttendanceCheckInRequest request, UUID userId, UUID businessId);
    AttendanceResponse getById(UUID id);
    List<AttendanceResponse> getTodayAttendance(UUID businessId);
    PaginationResponse<AttendanceResponse> getAll(AttendanceFilterRequest filter);
    AttendanceResponse update(UUID id, AttendanceUpdateRequest request);
    AttendanceResponse delete(UUID id);
    void processDailyAbsences();
}
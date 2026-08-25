package com.emenu.features.hr.repository;

import com.emenu.features.hr.models.LeaveStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LeaveStatusHistoryRepository extends JpaRepository<LeaveStatusHistory, UUID> {
    List<LeaveStatusHistory> findByLeaveIdOrderByCreatedAtAsc(UUID leaveId);
}

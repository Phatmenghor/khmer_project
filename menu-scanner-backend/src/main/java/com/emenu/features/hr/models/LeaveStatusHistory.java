package com.emenu.features.hr.models;

import com.emenu.enums.hr.LeaveStatusEnum;
import com.emenu.features.auth.models.User;
import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "leave_status_history")
@Data
@ToString(callSuper = true, exclude = {"leave", "changedByUser"})
@EqualsAndHashCode(callSuper = true, exclude = {"leave", "changedByUser"})
@NoArgsConstructor
@AllArgsConstructor
public class LeaveStatusHistory extends BaseUUIDEntity {

    @Column(name = "leave_id", nullable = false)
    private UUID leaveId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_id", insertable = false, updatable = false)
    private Leave leave;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private LeaveStatusEnum status;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "changed_by_user_id")
    private UUID changedByUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_user_id", insertable = false, updatable = false)
    private User changedByUser;

    // Snapshot of changer's name at the time of action
    @Column(name = "changed_by_name")
    private String changedByName;

    public LeaveStatusHistory(UUID leaveId, LeaveStatusEnum status, String note, UUID changedByUserId, String changedByName) {
        this.leaveId = leaveId;
        this.status = status;
        this.note = note;
        this.changedByUserId = changedByUserId;
        this.changedByName = changedByName;
    }
}

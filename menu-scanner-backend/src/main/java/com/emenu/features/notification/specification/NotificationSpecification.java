package com.emenu.features.notification.specification;

import com.emenu.enums.notification.MessageType;
import com.emenu.enums.notification.NotificationPriority;
import com.emenu.enums.notification.NotificationRecipientType;
import com.emenu.features.notification.models.Notification;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class NotificationSpecification {

    public static Specification<Notification> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<Notification> byUserId(UUID userId) {
        return (root, query, cb) -> {
            if (userId == null) return cb.conjunction();
            return cb.equal(root.get("userId"), userId);
        };
    }

    public static Specification<Notification> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<Notification> byMessageType(MessageType messageType) {
        return (root, query, cb) -> {
            if (messageType == null) return cb.conjunction();
            return cb.equal(root.get("messageType"), messageType);
        };
    }

    public static Specification<Notification> byPriority(NotificationPriority priority) {
        return (root, query, cb) -> {
            if (priority == null) return cb.conjunction();
            return cb.equal(root.get("priority"), priority);
        };
    }

    public static Specification<Notification> byIsRead(Boolean isRead) {
        return (root, query, cb) -> {
            if (isRead == null) return cb.conjunction();
            return cb.equal(root.get("isRead"), isRead);
        };
    }

    public static Specification<Notification> byRecipientType(NotificationRecipientType recipientType) {
        return (root, query, cb) -> {
            if (recipientType == null) return cb.conjunction();
            return cb.equal(root.get("recipientType"), recipientType);
        };
    }

    public static Specification<Notification> searchByTitleOrMessage(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(root.get("title")), pattern),
                cb.like(cb.lower(root.get("message")), pattern)
            );
        };
    }

    public static Specification<Notification> byIsSeen(Boolean isSeen) {
        return (root, query, cb) -> {
            if (isSeen == null) return cb.conjunction();
            return cb.equal(root.get("isSeen"), isSeen);
        };
    }

    public static Specification<Notification> byGroupId(UUID groupId) {
        return (root, query, cb) -> {
            if (groupId == null) return cb.conjunction();
            return cb.equal(root.get("groupId"), groupId);
        };
    }

    public static Specification<Notification> searchNotifications(
            UUID userId,
            UUID businessId,
            MessageType messageType,
            NotificationPriority priority,
            Boolean isRead,
            NotificationRecipientType recipientType,
            String search) {
        return active()
                .and(byUserId(userId))
                .and(byBusinessId(businessId))
                .and(byMessageType(messageType))
                .and(byPriority(priority))
                .and(byIsRead(isRead))
                .and(byRecipientType(recipientType))
                .and(searchByTitleOrMessage(search));
    }
}

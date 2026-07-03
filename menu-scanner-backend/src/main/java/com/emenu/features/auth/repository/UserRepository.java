package com.emenu.features.auth.repository;

import com.emenu.enums.user.UserType;
import com.emenu.features.auth.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {
    Optional<User> findByUserIdentifierAndIsDeletedFalse(String userIdentifier);

    Optional<User> findByUserIdentifierAndUserTypeAndIsDeletedFalse(String userIdentifier, UserType userType);

    Optional<User> findByUserIdentifierAndBusinessIdAndIsDeletedFalse(String userIdentifier, UUID businessId);

    Optional<User> findByUserIdentifierAndUserTypeAndBusinessIdAndIsDeletedFalse(String userIdentifier, UserType userType, UUID businessId);

    boolean existsByUserIdentifierAndIsDeletedFalse(String userIdentifier);

    boolean existsByUserIdentifierAndUserTypeAndIsDeletedFalse(String userIdentifier, UserType userType);

    boolean existsByUserIdentifierAndBusinessIdAndIsDeletedFalse(String userIdentifier, UUID businessId);

    boolean existsByUserIdentifierAndUserTypeAndBusinessIdAndIsDeletedFalse(String userIdentifier, UserType userType, UUID businessId);

    Optional<User> findByIdAndIsDeletedFalse(UUID id);

    List<User> findAllByBusinessIdAndIsDeletedFalse(UUID businessId);

    @Query("SELECT u FROM User u JOIN u.telegram t WHERE t.telegramId = :telegramId AND u.businessId = :businessId AND u.isDeleted = false")
    Optional<User> findByTelegramIdAndBusinessIdAndIsDeletedFalse(@Param("telegramId") Long telegramId, @Param("businessId") UUID businessId);

    @Query("SELECT u FROM User u JOIN u.telegram t WHERE t.telegramId = :telegramId AND u.userType = :userType AND u.isDeleted = false")
    Optional<User> findByTelegramIdAndUserTypeAndIsDeletedFalse(@Param("telegramId") Long telegramId, @Param("userType") UserType userType);

    @Query("SELECT u FROM User u JOIN u.telegram t WHERE t.telegramId = :telegramId AND u.isDeleted = false")
    Optional<User> findByTelegramIdAndIsDeletedFalse(@Param("telegramId") Long telegramId);

    @Query("SELECT u FROM User u WHERE u.isDeleted = false ORDER BY u.createdAt DESC")
    List<User> findAllActiveUsers();

    Page<User> findByRolesNameContainingIgnoreCaseAndIsDeletedFalse(String roleName, Pageable pageable);
}

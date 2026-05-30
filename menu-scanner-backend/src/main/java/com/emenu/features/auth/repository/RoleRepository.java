package com.emenu.features.auth.repository;

import com.emenu.features.auth.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID>, JpaSpecificationExecutor<Role> {
    Optional<Role> findByIdAndIsDeletedFalse(UUID id);

    List<Role> findByNameInAndIsDeletedFalse(List<String> names);

    boolean existsByNameAndIsDeletedFalse(String name);

    boolean existsByNameAndBusinessIdAndIsDeletedFalse(String name, UUID businessId);

    boolean existsByNameAndBusinessIdIsNullAndIsDeletedFalse(String name);
}
